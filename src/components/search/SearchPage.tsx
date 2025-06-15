import React, { useState, useEffect, Suspense } from 'react';

import { useSearchParams, Link } from 'react-router';
import { ArrowLeft, Star, Calendar, User, Film, Tv, Filter, Grid, List } from 'lucide-react';
import { Button } from '@app/ui/button';
import { Badge } from '@app/ui/badge';
import { Card, CardContent } from '@app/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@app/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/ui/select';
import { Checkbox } from '@app/ui/checkbox';
import { Skeleton } from '../skeleton/skeleton';
import { useInView } from 'react-intersection-observer';
import {
  tmdbApi,
  // type TMDBMovie,
  // type TMDBTVShow,
  // type TMDBPerson,
  getTitle,
  getReleaseDate,
  formatRating,
  getYear,
} from '@app/service/tmdb';
import type { TMDBPerson, TMDBMovie, TMDBTVShow } from '@app/types/tmdb';

interface SearchResult {
  id: number;
  title: string;
  type: 'movie' | 'tv' | 'person';
  image: string;
  year?: string;
  rating?: number;
  overview?: string;
  knownFor?: string;
  department?: string;
  popularity: number;
}

const SearchSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="bg-slate-800 border-slate-700 overflow-hidden">
        <div className="aspect-[2/3] relative">
          <Skeleton className="w-full h-full" />
        </div>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Constants
const MAX_KNOWN_FOR_ITEMS = 3;
const DEFAULT_MIN_RATING = 0;

interface SearchPageProps {
  className?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({ className = '' }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { ref, inView } = useInView();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['movie', 'tv', 'person']);
  const [sortBy, setSortBy] = useState('popularity');
  const [minRating, setMinRating] = useState(DEFAULT_MIN_RATING);

  useEffect(() => {
    if (inView && !loading && !isLoadingMore && currentPage < totalPages) {
      loadMore();
    }
  }, [inView, loading, isLoadingMore, currentPage, totalPages]);

  useEffect(() => {
    if (query) {
      searchContent(query, currentPage);
    }
  }, [query, currentPage]);

  useEffect(() => {
    applyFilters();
  }, [results, selectedTypes, sortBy, minRating]);

  const searchContent = async (searchQuery: string, page: number): Promise<void> => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const response = await tmdbApi.searchMulti(searchQuery, page);

      const searchResults: SearchResult[] = response.results
        .filter((item: any) => {
          // Filter out adult content
          if (item.adult) return false;
          return true;
        })
        .map((item: any): SearchResult => {
          if (item.media_type === 'person') {
            const person = item as TMDBPerson;
            return {
              id: person.id,
              title: person.name,
              type: 'person',
              image: tmdbApi.getImageUrl(person.profile_path, 'w185'),
              department: person.known_for_department,
              knownFor:
                person.known_for
                  ?.slice(0, MAX_KNOWN_FOR_ITEMS)
                  .map((work: any) => getTitle(work))
                  .join(', ') || 'Various works',
              popularity: person.popularity,
            };
          } else {
            const content = item as TMDBMovie | TMDBTVShow;
            return {
              id: content.id,
              title: getTitle(content),
              type: item.media_type === 'movie' ? 'movie' : ('show' as 'movie' | 'tv'),
              image: tmdbApi.getImageUrl(content.poster_path, 'w185'),
              year: getYear(getReleaseDate(content)),
              rating: formatRating(content.vote_average),
              overview: content.overview,
              popularity: content.popularity,
            };
          }
        });

      if (page === 1) {
        setResults(searchResults);
      } else {
        setResults(prev => [...prev, ...searchResults]);
      }

      setTotalPages(response.total_pages);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const applyFilters = (): void => {
    let filtered = results.filter(result => selectedTypes.includes(result.type));

    // Filter by minimum rating (only for movies and TV shows)
    if (minRating > DEFAULT_MIN_RATING) {
      filtered = filtered.filter(
        result => result.type === 'person' || (result.rating && result.rating >= minRating),
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          if (a.type === 'person' && b.type === 'person') return 0;
          if (a.type === 'person') return 1;
          if (b.type === 'person') return -1;
          return (b.rating || 0) - (a.rating || 0);
        case 'year':
          if (a.type === 'person' && b.type === 'person') return 0;
          if (a.type === 'person') return 1;
          if (b.type === 'person') return -1;
          return (b.year || '0').localeCompare(a.year || '0');
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  };

  const handleTypeFilter = (type: string, checked: boolean): void => {
    if (checked) {
      setSelectedTypes(prev => [...prev, type]);
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    }
  };

  const loadMore = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No search query provided</p>
          <Link to="/">
            <Button className="bg-purple-500 hover:bg-purple-600 transition-all duration-300 transform hover:scale-105">
              Go Back Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to CineContext
            </Link>

            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <span className="text-xl font-bold">CineContext</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search Results for "{query}"</h1>
          <p className="text-slate-400">
            {loading ? 'Searching...' : `Found ${filteredResults.length} results`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>

              {/* Content Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Content Type</h4>
                <div className="space-y-2">
                  {[
                    { id: 'movie', label: 'Movies', icon: Film },
                    { id: 'tv', label: 'TV Shows', icon: Tv },
                    { id: 'person', label: 'People', icon: User },
                  ].map(({ id, label, icon: Icon }) => (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        checked={selectedTypes.includes(id)}
                        onCheckedChange={checked => {
                          handleTypeFilter(id, checked as boolean);
                        }}
                        className="border-slate-600"
                      />
                      <label
                        htmlFor={id}
                        className="text-sm text-slate-300 flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Sort By</h4>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Minimum Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Minimum Rating</h4>
                <Select
                  value={minRating.toString()}
                  onValueChange={value => {
                    setMinRating(Number(value));
                  }}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="6">6.0+</SelectItem>
                    <SelectItem value="7">7.0+</SelectItem>
                    <SelectItem value="8">8.0+</SelectItem>
                    <SelectItem value="9">9.0+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">View Mode</h4>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setViewMode('grid');
                    }}
                    className="flex-1"
                  >
                    <Grid className="h-4 w-4 mr-1" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setViewMode('list');
                    }}
                    className="flex-1"
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <SearchSkeleton />
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={() => searchContent(query, 1)}
                  className="bg-purple-500 hover:bg-purple-600 transition-all duration-300"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}
                >
                  {filteredResults.map(result => (
                    <Card
                      key={`${result.type}-${result.id}`}
                      className="bg-slate-800 border-slate-700 overflow-hidden hover:border-purple-500 transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="relative">
                        {result.type === 'person' ? (
                          <div className="aspect-[2/3] bg-slate-700 flex items-center justify-center">
                            <Avatar className="h-24 w-24">
                              <AvatarImage
                                src={result.image || '/placeholder.svg'}
                                alt={result.title}
                              />
                              <AvatarFallback className="bg-purple-500 text-white text-lg">
                                {result.title
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ) : (
                          <img
                            src={result.image || '/placeholder.svg'}
                            alt={result.title}
                            className="w-full aspect-[2/3] object-cover"
                          />
                        )}
                        <Badge
                          className={`absolute top-2 right-2 text-xs ${
                            result.type === 'movie'
                              ? 'bg-blue-500'
                              : result.type === 'tv'
                                ? 'bg-purple-500'
                                : 'bg-green-500'
                          }`}
                        >
                          {result.type === 'movie'
                            ? 'Movie'
                            : result.type === 'tv'
                              ? 'TV'
                              : 'Person'}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-white mb-1 line-clamp-2">
                          {result.title}
                        </h3>
                        {result.type === 'person' ? (
                          <p className="text-sm text-slate-400">{result.department}</p>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            {result.year && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{result.year}</span>
                              </div>
                            )}
                            {result.rating && result.rating > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{result.rating}</span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {!loading && currentPage < totalPages && (
                  <div ref={ref} className="h-20 flex items-center justify-center">
                    {isLoadingMore && <SearchSkeleton />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SearchPages: React.FC = () => (
  <Suspense fallback={<SearchSkeleton />}>
    <SearchPage />
  </Suspense>
);
