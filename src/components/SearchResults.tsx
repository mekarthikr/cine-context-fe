import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Star, Calendar, User, Film, Tv, X, Loader2 } from 'lucide-react';
import { Badge } from '@app/ui/badge';
import { Card, CardContent } from '@app/ui/card';
import { Button } from '@app/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@app/ui/avatar';
import {
  tmdbApi,
  type TMDBMovie,
  type TMDBTVShow,
  type TMDBPerson,
  getTitle,
  getReleaseDate,
  formatRating,
  getYear,
} from '@app/lib/tmdb';

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
}

interface SearchResultsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

// Constants
const MIN_QUERY_LENGTH = 2;
const MAX_SEARCH_RESULTS = 10;
const MAX_OVERVIEW_LENGTH = 120;
const DEBOUNCE_DELAY = 300;

export function SearchResults({
  query,
  isOpen,
  onClose,
}: SearchResultsProps): React.JSX.Element | null {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchContent = async (): Promise<void> => {
      if (!query.trim() || query.length < MIN_QUERY_LENGTH) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await tmdbApi.searchMulti(query);

        const searchResults: SearchResult[] = response.results
          .filter((item: any) => {
            // Filter out adult content and items without proper data
            if (item.adult) return false;
            if (item.media_type === 'person' && !item.profile_path) return false;
            if ((item.media_type === 'movie' || item.media_type === 'tv') && !item.poster_path) {
              return false;
            }
            return true;
          })
          .slice(0, MAX_SEARCH_RESULTS) // Limit to MAX_SEARCH_RESULTS
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
                    ?.slice(0, 2)
                    .map((work: any) => getTitle(work))
                    .join(', ') || 'Various works',
              };
            } else {
              const content = item as TMDBMovie | TMDBTVShow;
              return {
                id: content.id,
                title: getTitle(content),
                type: item.media_type as 'movie' | 'tv',
                image: tmdbApi.getImageUrl(content.poster_path, 'w185'),
                year: getYear(getReleaseDate(content)),
                rating: formatRating(content.vote_average),
                overview:
                  content.overview.slice(0, MAX_OVERVIEW_LENGTH) +
                  (content.overview.length > MAX_OVERVIEW_LENGTH ? '...' : ''),
              };
            }
          });

        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContent, DEBOUNCE_DELAY);
    return () => {
      clearTimeout(debounceTimer);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2">
      <Card className="bg-slate-800 border-slate-700 shadow-2xl max-h-96 overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">
                {loading ? 'Searching...' : `Search Results for "${query}"`}
              </span>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-purple-400" />}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {error ? (
              <div className="p-4 text-center text-red-400">
                <p>{error}</p>
              </div>
            ) : results.length === 0 && !loading && query.length >= MIN_QUERY_LENGTH ? (
              <div className="p-4 text-center text-slate-400">
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-1">Try searching for movies, TV shows, or people</p>
              </div>
            ) : results.length === 0 && query.length < MIN_QUERY_LENGTH ? (
              <div className="p-4 text-center text-slate-400">
                <p>Type at least 2 characters to search</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {results.map(result => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={`/${result.type}/${result.id}`}
                    onClick={onClose}
                  >
                    <div className="p-4 hover:bg-slate-700 transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          {result.type === 'person' ? (
                            <Avatar className="h-16 w-16">
                              <AvatarImage
                                src={result.image || '/placeholder.svg'}
                                alt={result.title}
                              />
                              <AvatarFallback className="bg-purple-500 text-white">
                                {result.title
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <img
                              src={result.image || '/placeholder.svg'}
                              alt={result.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-white truncate pr-2">{result.title}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {/* Type Badge */}
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  result.type === 'movie'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : result.type === 'tv'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : 'bg-green-500/20 text-green-300'
                                }`}
                              >
                                {result.type === 'movie' ? (
                                  <Film className="h-3 w-3 mr-1" />
                                ) : result.type === 'tv' ? (
                                  <Tv className="h-3 w-3 mr-1" />
                                ) : (
                                  <User className="h-3 w-3 mr-1" />
                                )}
                                {result.type === 'movie'
                                  ? 'Movie'
                                  : result.type === 'tv'
                                    ? 'TV Show'
                                    : 'Person'}
                              </Badge>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-sm text-slate-400 mb-2">
                            {result.type === 'person' ? (
                              <>
                                <span>{result.department}</span>
                                <span>•</span>
                                <span className="text-purple-400">{result.knownFor}</span>
                              </>
                            ) : (
                              <>
                                {result.year && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{result.year}</span>
                                    </div>
                                  </>
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
                              </>
                            )}
                          </div>

                          {/* Overview/Description */}
                          {result.overview && (
                            <p className="text-sm text-slate-300 line-clamp-2">{result.overview}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {results.length > 0 && (
            <div className="p-3 border-t border-slate-700 bg-slate-800/50">
              <p className="text-xs text-slate-400 text-center">
                Showing {results.length} results • Press Enter to see all results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
