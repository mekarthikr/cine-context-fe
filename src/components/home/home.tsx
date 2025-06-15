import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import {
  User,
  Play,
  Star,
  ChevronRight,
  Flame,
  Filter,
  ArrowRight,
  Calendar,
  Film,
  Tv,
  Sparkles,
  Award,
  Popcorn,
  Bookmark,
  Plus,
  Info,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@app/ui/button';
import { Badge } from '@app/ui/badge';
import { Card, CardContent } from '@app/ui/card';
import { Checkbox } from '@app/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@app/ui/dropdown-menu';
import { Progress } from '@app/ui/progress';
import { Slider } from '@app/ui/slider';
import { Label } from '@app/ui/label';
import { SearchBar } from '../search/components/SearchBar';
import { ContentBackdrop } from '../show/components/ContentBackdrop';
import { ContentTitleLogo } from '../show/components/ContentTitleLogo';
import { tmdbApi, isMovie, getTitle, formatRating, getYear } from '@app/service/tmdb';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import type { TMDBTVShow } from '@app/types/tmdb';
import { helperService } from '@app/service/helper';

// Types for our content
interface ContentItem {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  image: string;
  backdropImage: string;
  year: string;
  rating: number;
  duration?: string;
  tags: string[];
  description: string;
  isNew?: boolean;
  isTrending?: boolean;
  genres?: string[];
  voteCount?: number;
  popularity?: number;
  first_air_date?: string;
  name?: string;
}

interface PersonItem {
  id: number;
  name: string;
  image: string;
  role: string;
  knownFor: string;
  trending: boolean;
  popularity: number;
}

interface GenreItem {
  id: number;
  name: string;
}

interface FilterOptions {
  mediaType: string[];
  genres: number[];
  year: [number, number];
  rating: number;
  language: string;
}

// Mood collections for curated content
const moodCollections = [
  {
    id: 1,
    title: 'Rainy Day Comfort',
    description: 'Cozy stories for when you need warmth',
    image: '/placeholder.svg?height=200&width=300',
    count: 24,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'Late Night Contemplation',
    description: 'Deep, thoughtful content for quiet hours',
    image: '/placeholder.svg?height=200&width=300',
    count: 18,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'Weekend Binge',
    description: 'Series perfect for marathon viewing',
    image: '/placeholder.svg?height=200&width=300',
    count: 32,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 4,
    title: 'First Date Picks',
    description: 'Safe choices that spark conversation',
    image: '/placeholder.svg?height=200&width=300',
    count: 15,
    color: 'from-green-500 to-emerald-500',
  },
];

// Continue watching data (this would come from user data in a real app)
const continueWatching = [
  {
    id: 1,
    title: 'The Bear',
    type: 'tv' as const,
    image: '/placeholder.svg?height=120&width=80',
    progress: 65,
    episode: 'S3E4',
    timeLeft: '25 min left',
  },
  {
    id: 2,
    title: 'Succession',
    type: 'tv' as const,
    image: '/placeholder.svg?height=120&width=80',
    progress: 80,
    episode: 'S4E8',
    timeLeft: '15 min left',
  },
  {
    id: 3,
    title: 'Atlanta',
    type: 'tv' as const,
    image: '/placeholder.svg?height=120&width=80',
    progress: 30,
    episode: 'S2E3',
    timeLeft: '20 min left',
  },
];

// Constants for mood tags
// const MAX_MOOD_TAGS = 3;

// Add Skeleton component
const ContentSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-[70vh] min-h-[500px] bg-slate-800 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30"></div>
      <div className="container mx-auto px-4 h-full flex items-center relative">
        <div className="max-w-2xl">
          <div className="h-12 w-3/4 bg-slate-700 rounded mb-6"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-6 w-20 bg-slate-700 rounded"></div>
            <div className="h-6 w-16 bg-slate-700 rounded"></div>
            <div className="h-6 w-12 bg-slate-700 rounded"></div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 w-20 bg-slate-700 rounded"></div>
            ))}
          </div>
          <div className="h-20 w-full bg-slate-700 rounded mb-8"></div>
          <div className="flex flex-wrap gap-4">
            <div className="h-10 w-32 bg-slate-700 rounded"></div>
            <div className="h-10 w-40 bg-slate-700 rounded"></div>
            <div className="h-10 w-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HomePage: React.FC = () => {
  // const { theme, setTheme } = useTheme();

  // Content state
  const [, setHeroContent] = useState<ContentItem | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<ContentItem[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<ContentItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<ContentItem[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<ContentItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<ContentItem[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<ContentItem[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<ContentItem[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<ContentItem[]>([]);
  const [trendingPeople, setTrendingPeople] = useState<PersonItem[]>([]);
  const [movieGenres, setMovieGenres] = useState<GenreItem[]>([]);
  const [tvGenres, setTVGenres] = useState<GenreItem[]>([]);
  const [genreMap, setGenreMap] = useState<Map<number, string>>(new Map());
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    mediaType: ['movie', 'tv'],
    genres: [],
    year: [1990, new Date().getFullYear()],
    rating: 0,
    language: 'en',
  });

  // Refs for scroll containers
  const trendingMoviesRef = useRef<HTMLDivElement>(null);
  const trendingTVShowsRef = useRef<HTMLDivElement>(null);
  // const popularMoviesRef = useRef<HTMLDivElement>(null);
  // const popularTVShowsRef = useRef<HTMLDivElement>(null);
  const topRatedMoviesRef = useRef<HTMLDivElement>(null);
  // const topRatedTVShowsRef = useRef<HTMLDivElement>(null);
  const upcomingMoviesRef = useRef<HTMLDivElement>(null);
  const nowPlayingMoviesRef = useRef<HTMLDivElement>(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch genres first to use for mapping
        const [movieGenresResponse, tvGenresResponse] = await Promise.all([
          tmdbApi.getMovieGenres(),
          tmdbApi.getTVGenres(),
        ]);

        setMovieGenres(movieGenresResponse.genres);
        setTVGenres(tvGenresResponse.genres);

        // Create a map of genre IDs to names
        const genreMapTemp = new Map<number, string>();
        movieGenresResponse.genres.forEach((genre: { id: number; name: string }) =>
          genreMapTemp.set(genre.id, genre.name),
        );
        tvGenresResponse.genres.forEach((genre: { id: number; name: string }) =>
          genreMapTemp.set(genre.id, genre.name),
        );
        setGenreMap(genreMapTemp);

        // Fetch all content in parallel
        const [
          trendingMoviesResponse,
          trendingTVResponse,
          popularMoviesResponse,
          popularTVResponse,
          topRatedMoviesResponse,
          topRatedTVResponse,
          upcomingMoviesResponse,
          nowPlayingMoviesResponse,
          trendingPeopleResponse,
        ] = await Promise.all([
          tmdbApi.getTrending('movie', 'day'),
          tmdbApi.getTrending('tv', 'day'),
          tmdbApi.getPopularMovies(),
          tmdbApi.getPopularTVShows(),
          tmdbApi.getTopRatedMovies(),
          tmdbApi.getTopRatedTVShows(),
          tmdbApi.getUpcomingMovies(),
          tmdbApi.getNowPlayingMovies(),
          tmdbApi.getTrendingPeople(),
        ]);

        // Process trending movies
        const trendingMoviesData = trendingMoviesResponse.results.filter(isMovie).map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: helperService.getMoodTags(movie),
            description: movie.overview.slice(0, 150) + (movie.overview.length > 150 ? '...' : ''),
            isTrending: true,
            genres: helperService.mapGenreIdsToNames(movie.genre_ids, genreMapTemp),
            voteCount: movie.vote_count,
            popularity: movie.popularity,
          }),
        );
        setTrendingMovies(trendingMoviesData);

        // Set hero content from trending movies
        if (trendingMoviesData.length > 0) {
          setHeroContent(trendingMoviesData[Math.floor(Math.random() * 10)]);
        }

        // Process trending TV shows
        const trendingTVData = trendingTVResponse.results
          .filter((show): show is TMDBTVShow => !isMovie(show))
          .map(
            (show): ContentItem => ({
              id: show.id,
              title: show.name,
              type: 'tv',
              image: tmdbApi.getImageUrl(show.poster_path),
              backdropImage: tmdbApi.getBackdropUrl(show.backdrop_path),
              year: getYear(show.first_air_date),
              rating: formatRating(show.vote_average),
              tags: helperService.getMoodTags(show),
              description: show.overview.slice(0, 150) + (show.overview.length > 150 ? '...' : ''),
              isTrending: true,
              genres: helperService.mapGenreIdsToNames(show.genre_ids, genreMapTemp),
              voteCount: show.vote_count,
              popularity: show.popularity,
            }),
          );
        setTrendingTVShows(trendingTVData);

        // Process popular movies
        const popularMoviesData = popularMoviesResponse.results.map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: helperService.getMoodTags(movie),
            description: movie.overview.slice(0, 150) + (movie.overview.length > 150 ? '...' : ''),
            genres: helperService.mapGenreIdsToNames(movie.genre_ids, genreMapTemp),
            voteCount: movie.vote_count,
            popularity: movie.popularity,
          }),
        );
        setPopularMovies(popularMoviesData);

        // Process popular TV shows
        const popularTVData = popularTVResponse.results.map(
          (show): ContentItem => ({
            id: show.id,
            title: show.name,
            type: 'tv',
            image: tmdbApi.getImageUrl(show.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(show.backdrop_path),
            year: getYear(show.first_air_date),
            rating: formatRating(show.vote_average),
            tags: helperService.getMoodTags(show),
            description: show.overview.slice(0, 150) + (show.overview.length > 150 ? '...' : ''),
            genres: helperService.mapGenreIdsToNames(show.genre_ids, genreMapTemp),
            voteCount: show.vote_count,
            popularity: show.popularity,
          }),
        );
        setPopularTVShows(popularTVData);

        // Process top rated movies
        const topRatedMoviesData = topRatedMoviesResponse.results.map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: helperService.getMoodTags(movie),
            description: movie.overview.slice(0, 150) + (movie.overview.length > 150 ? '...' : ''),
            genres: helperService.mapGenreIdsToNames(movie.genre_ids, genreMapTemp),
            voteCount: movie.vote_count,
            popularity: movie.popularity,
          }),
        );
        setTopRatedMovies(topRatedMoviesData);

        // Process top rated TV shows
        const topRatedTVData = topRatedTVResponse.results.map(
          (show): ContentItem => ({
            id: show.id,
            title: show.name,
            type: 'tv',
            image: tmdbApi.getImageUrl(show.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(show.backdrop_path),
            year: getYear(show.first_air_date),
            rating: formatRating(show.vote_average),
            tags: helperService.getMoodTags(show),
            description: show.overview.slice(0, 150) + (show.overview.length > 150 ? '...' : ''),
            genres: helperService.mapGenreIdsToNames(show.genre_ids, genreMapTemp),
            voteCount: show.vote_count,
            popularity: show.popularity,
          }),
        );
        setTopRatedTVShows(topRatedTVData);

        // Process upcoming movies
        const upcomingMoviesData = upcomingMoviesResponse.results.map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: helperService.getMoodTags(movie),
            description: movie.overview.slice(0, 150) + (movie.overview.length > 150 ? '...' : ''),
            isNew: true,
            genres: helperService.mapGenreIdsToNames(movie.genre_ids, genreMapTemp),
            voteCount: movie.vote_count,
            popularity: movie.popularity,
          }),
        );
        setUpcomingMovies(upcomingMoviesData);

        // Process now playing movies
        const nowPlayingMoviesData = nowPlayingMoviesResponse.results.map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: helperService.getMoodTags(movie),
            description: movie.overview.slice(0, 150) + (movie.overview.length > 150 ? '...' : ''),
            isNew: true,
            genres: helperService.mapGenreIdsToNames(movie.genre_ids, genreMapTemp),
            voteCount: movie.vote_count,
            popularity: movie.popularity,
          }),
        );
        setNowPlayingMovies(nowPlayingMoviesData);

        // Process trending people
        const trendingPeopleData = trendingPeopleResponse.results.map(
          (person): PersonItem => ({
            id: person.id,
            name: person.name,
            image: tmdbApi.getImageUrl(person.profile_path),
            role: person.known_for_department,
            knownFor:
              person.known_for
                ?.slice(0, 2)
                .map(item => getTitle(item))
                .join(', ') || 'Various works',
            trending: person.popularity > 50,
            popularity: person.popularity,
          }),
        );
        setTrendingPeople(trendingPeopleData);

        // Set initial filtered content
        const allContent = [
          ...trendingMoviesData,
          ...trendingTVData,
          ...popularMoviesData,
          ...popularTVData,
          ...topRatedMoviesData,
          ...topRatedTVData,
          ...upcomingMoviesData,
          ...nowPlayingMoviesData,
        ];
        // Remove duplicates by ID and type
        const uniqueContent = Array.from(
          new Map(allContent.map(item => [`${item.type}-${item.id}`, item])).values(),
        );
        setFilteredContent(uniqueContent);
      } catch (err) {
        console.error('Error fetching TMDB data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(new Set(JSON.parse(savedWatchlist)));
    }

    fetchAllData();
  }, []);

  // Apply filters when filter options change
  useEffect(() => {
    if (loading) return;

    const allContent = [
      ...trendingMovies,
      ...trendingTVShows,
      ...popularMovies,
      ...popularTVShows,
      ...topRatedMovies,
      ...topRatedTVShows,
      ...upcomingMovies,
      ...nowPlayingMovies,
    ];

    // Remove duplicates by ID and type
    const uniqueContent = Array.from(
      new Map(allContent.map(item => [`${item.type}-${item.id}`, item])).values(),
    );

    // Apply filters
    const filtered = uniqueContent.filter(item => {
      // Filter by media type
      if (!filterOptions.mediaType.includes(item.type)) return false;

      // Filter by genre
      if (filterOptions.genres.length > 0 && item.genres) {
        const itemGenreIds = item.genres.map(genre => {
          // Find the genre ID by name
          for (const [id, name] of genreMap.entries()) {
            if (name === genre) return id;
          }
          return -1;
        });
        if (!filterOptions.genres.some(genreId => itemGenreIds.includes(genreId))) return false;
      }

      // Filter by year
      const itemYear = Number.parseInt(item.year);
      if (isNaN(itemYear) || itemYear < filterOptions.year[0] || itemYear > filterOptions.year[1]) {
        return false;
      }

      // Filter by rating
      if (item.rating < filterOptions.rating) return false;

      return true;
    });

    setFilteredContent(filtered);
  }, [
    filterOptions,
    loading,
    trendingMovies,
    trendingTVShows,
    popularMovies,
    popularTVShows,
    topRatedMovies,
    topRatedTVShows,
    upcomingMovies,
    nowPlayingMovies,
    genreMap,
  ]);

  // Handle watchlist toggle
  const toggleWatchlist = useCallback(
    (item: ContentItem) => {
      const itemKey = `${item.type}-${item.id}`;
      const newWatchlist = new Set(watchlist);

      if (newWatchlist.has(itemKey)) {
        newWatchlist.delete(itemKey);
      } else {
        newWatchlist.add(itemKey);
      }

      setWatchlist(newWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(Array.from(newWatchlist)));
    },
    [watchlist],
  );

  // Check if item is in watchlist
  const isInWatchlist = useCallback(
    (item: ContentItem) => watchlist.has(`${item.type}-${item.id}`),
    [watchlist],
  );

  // Scroll handlers for carousels
  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle media type filter change
  const handleMediaTypeChange = (type: string, checked: boolean) => {
    setFilterOptions(prev => ({
      ...prev,
      mediaType: checked ? [...prev.mediaType, type] : prev.mediaType.filter(t => t !== type),
    }));
  };

  // Handle genre filter change
  const handleGenreChange = (genreId: number, checked: boolean) => {
    setFilterOptions(prev => ({
      ...prev,
      genres: checked ? [...prev.genres, genreId] : prev.genres.filter(id => id !== genreId),
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      mediaType: ['movie', 'tv'],
      genres: [],
      year: [1990, new Date().getFullYear()],
      rating: 0,
      language: 'en',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mb-4 mx-auto"></div>
          <p className="text-slate-400 text-lg">Loading amazing content...</p>
          <div className="mt-8 flex flex-col gap-4 items-center">
            <div className="w-64 h-4 bg-slate-800 rounded animate-pulse"></div>
            <div className="w-48 h-4 bg-slate-800 rounded animate-pulse"></div>
            <div className="w-56 h-4 bg-slate-800 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <Button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <span className="text-xl font-bold">CineContext</span>
            </div>

            {/* Search Bar */}
            <SearchBar className="flex-1 max-w-2xl mx-8" />

            {/* User Controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                }}
                className="hover:bg-accent hover:text-accent-foreground"
              >
                {theme === 'dark' ? (
                  <SunMedium className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button> */}

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem className="text-white hover:bg-slate-700">
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-slate-700">
                    Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-slate-700">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-slate-700">
                    <Link to="/login">Sign Out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {loading ? (
        <ContentSkeleton />
      ) : (
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <Carousel
            showThumbs={false}
            showStatus={false}
            showIndicators={true}
            infiniteLoop={true}
            autoPlay={true}
            interval={5000}
            stopOnHover={true}
            className="h-full"
            renderArrowPrev={(onClickHandler, hasPrev, label) =>
              hasPrev && (
                <button
                  onClick={onClickHandler}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label={label}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )
            }
            renderArrowNext={(onClickHandler, hasNext, label) =>
              hasNext && (
                <button
                  onClick={onClickHandler}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  aria-label={label}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )
            }
          >
            {trendingMovies.slice(0, 5).map(movie => (
              <div key={movie.id} className="h-[70vh] min-h-[500px] relative">
                <ContentBackdrop
                  contentId={movie.id}
                  contentType={movie.type}
                  contentTitle={movie.title}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30"></div>
                </ContentBackdrop>

                <div className="container mx-auto px-4 h-full flex items-center relative">
                  <div className="max-w-2xl">
                    <div className="mb-6">
                      <ContentTitleLogo
                        contentId={movie.id}
                        contentType={movie.type}
                        contentTitle={movie.title}
                        className="mb-2"
                        fallbackClassName="text-4xl md:text-6xl font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="bg-purple-500 text-white border-none">
                        {movie.type === 'movie' ? 'Movie' : 'TV Show'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-white">{movie.rating}</span>
                      </div>
                      <span className="text-slate-300">{movie.year}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {movie.genres?.map(genre => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="bg-slate-800/80 text-slate-300"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-lg text-slate-300 mb-8 line-clamp-3">{movie.description}</p>

                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                        <Play className="h-4 w-4 mr-2" />
                        Watch Now
                      </Button>
                      <Button
                        variant="outline"
                        className={`border-slate-600 ${
                          isInWatchlist(movie)
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                            : 'text-slate-300'
                        }`}
                        onClick={() => {
                          toggleWatchlist(movie);
                        }}
                      >
                        {isInWatchlist(movie) ? (
                          <Bookmark className="h-4 w-4 mr-2 fill-current" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {isInWatchlist(movie) ? 'In Watchlist' : 'Add to Watchlist'}
                      </Button>
                      <Button variant="outline" className="border-slate-600 text-slate-300">
                        <Info className="h-4 w-4 mr-2" />
                        More Info
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {/* Continue Watching Section */}
      <section className="py-8 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {continueWatching.map(item => (
              <Card
                key={item.id}
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer group"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400 mb-2">{item.episode}</p>
                      <p className="text-xs text-slate-500 mb-2">{item.timeLeft}</p>
                      <Progress value={item.progress} className="h-2 bg-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </Progress>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Movies Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Trending Movies
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(trendingMoviesRef as React.RefObject<HTMLDivElement>, 'left');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(trendingMoviesRef as React.RefObject<HTMLDivElement>, 'right');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={trendingMoviesRef}
            className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              scrollbarColor: '#f97316 #1e293b',
            }}
          >
            {trendingMovies.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-[250px] snap-start">
                <Link to={`/movie/${movie.id}`}>
                  <div className="relative group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <LazyLoadImage
                        src={movie.image || '/placeholder.svg'}
                        alt={movie.title}
                        effect="blur"
                        className="w-full h-[375px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        placeholderSrc="/placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-orange-500 text-white border-none">Trending</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genres?.slice(0, 2).map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`mt-2 w-full ${
                    isInWatchlist(movie)
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => {
                    toggleWatchlist(movie);
                  }}
                >
                  {isInWatchlist(movie) ? (
                    <Bookmark className="h-4 w-4 mr-1 fill-current" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {isInWatchlist(movie) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending TV Shows Section */}
      <section className="py-8 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tv className="h-6 w-6 text-purple-500" />
              Trending TV Shows
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(trendingTVShowsRef as React.RefObject<HTMLDivElement>, 'left');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(trendingTVShowsRef as React.RefObject<HTMLDivElement>, 'right');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={trendingTVShowsRef}
            className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              scrollbarColor: '#f97316 #1e293b',
            }}
          >
            {trendingTVShows.map(show => (
              <div key={show.id} className="flex-shrink-0 w-[250px] snap-start">
                <Link to={`/show/${show.id}`}>
                  <div className="relative group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <LazyLoadImage
                        src={show.image || '/placeholder.svg'}
                        alt={show.title}
                        effect="blur"
                        className="w-full h-[375px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        placeholderSrc="/placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-purple-500 text-white border-none">TV Show</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {show.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{show.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{show.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {show.genres?.slice(0, 2).map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`mt-2 w-full ${
                    isInWatchlist(show)
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => {
                    toggleWatchlist(show);
                  }}
                >
                  {isInWatchlist(show) ? (
                    <Bookmark className="h-4 w-4 mr-1 fill-current" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {isInWatchlist(show) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Collections */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Mood Collections
            </h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {moodCollections.map(collection => (
              <Card
                key={collection.id}
                className="bg-slate-800 border-slate-700 overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                style={{ padding: 0, border: 0 }}
              >
                <div className="relative">
                  <img
                    src={collection.image || '/placeholder.svg'}
                    alt={collection.title}
                    className="w-full h-32 object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-60`}
                  ></div>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white mb-1">{collection.title}</h3>
                    <p className="text-xs text-slate-200 mb-2">{collection.description}</p>
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      {collection.count} titles
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Movies */}
      <section className="py-8 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-yellow-500" />
              Top Rated Movies
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(topRatedMoviesRef as React.RefObject<HTMLDivElement>, 'left');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(topRatedMoviesRef as React.RefObject<HTMLDivElement>, 'right');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={topRatedMoviesRef}
            className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              scrollbarColor: '#f97316 #1e293b',
            }}
          >
            {topRatedMovies.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-[250px] snap-start">
                <Link to={`/movie/${movie.id}`}>
                  <div className="relative group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <LazyLoadImage
                        src={movie.image || '/placeholder.svg'}
                        alt={movie.title}
                        effect="blur"
                        className="w-full h-[375px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        placeholderSrc="/placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-yellow-500 text-white border-none">Top Rated</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genres?.slice(0, 2).map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`mt-2 w-full ${
                    isInWatchlist(movie)
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => {
                    toggleWatchlist(movie);
                  }}
                >
                  {isInWatchlist(movie) ? (
                    <Bookmark className="h-4 w-4 mr-1 fill-current" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {isInWatchlist(movie) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Now Playing Movies */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Popcorn className="h-6 w-6 text-red-500" />
              Now Playing in Theaters
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(nowPlayingMoviesRef as React.RefObject<HTMLDivElement>, 'left');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(nowPlayingMoviesRef as React.RefObject<HTMLDivElement>, 'right');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={nowPlayingMoviesRef}
            className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              scrollbarColor: '#f97316 #1e293b',
            }}
          >
            {nowPlayingMovies.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-[250px] snap-start">
                <Link to={`/movie/${movie.id}`}>
                  <div className="relative group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <LazyLoadImage
                        src={movie.image || '/placeholder.svg'}
                        alt={movie.title}
                        effect="blur"
                        className="w-full h-[375px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        placeholderSrc="/placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
                          <Play className="h-4 w-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-green-500 text-white border-none">Now Playing</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genres?.slice(0, 2).map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`mt-2 w-full ${
                    isInWatchlist(movie)
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => {
                    toggleWatchlist(movie);
                  }}
                >
                  {isInWatchlist(movie) ? (
                    <Bookmark className="h-4 w-4 mr-1 fill-current" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {isInWatchlist(movie) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending People */}
      <section className="py-8 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="h-6 w-6 text-blue-500" />
              Trending People
            </h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingPeople.slice(0, 6).map(person => (
              <Link key={person.id} to={`/person/${person.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative">
                    {/* Main card with glass morphism effect */}
                    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-500/50">
                      {/* Profile Image Container */}
                      <div className="relative mb-3">
                        <div className="relative mx-auto w-20 h-20">
                          {/* Animated ring */}
                          <div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-spin"
                            style={{ animationDuration: '3s' }}
                          ></div>
                          <div className="absolute inset-[2px] rounded-full bg-slate-900"></div>

                          {/* Profile Image */}
                          <img
                            src={person.image}
                            alt={person.name}
                            className="absolute inset-[3px] w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full object-cover"
                            onError={e => {
                              const imgElement = e.target as HTMLImageElement;
                              const fallbackElement = imgElement.nextElementSibling as HTMLElement;
                              if (imgElement && fallbackElement) {
                                imgElement.style.display = 'none';
                                fallbackElement.style.display = 'flex';
                              }
                            }}
                          />

                          {/* Fallback Avatar */}
                          <div className="absolute inset-[3px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg hidden">
                            {person.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </div>
                        </div>

                        {/* Trending Badge */}
                        {person.trending && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                              <Flame className="h-3 w-3" />
                              Hot
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Person Info */}
                      <div className="text-center space-y-1.5">
                        <h4 className="font-semibold text-white text-sm line-clamp-1">
                          {person.name}
                        </h4>

                        <div className="flex items-center justify-center gap-1 text-slate-300">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <p className="text-xs font-medium">{person.role}</p>
                        </div>

                        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2 leading-relaxed">
                          {person.knownFor}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Movies */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-6 w-6 text-cyan-500" />
              Coming Soon
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(upcomingMoviesRef as React.RefObject<HTMLDivElement>, 'left');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  scroll(upcomingMoviesRef as React.RefObject<HTMLDivElement>, 'right');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div
            ref={upcomingMoviesRef}
            className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              scrollbarColor: '#f97316 #1e293b',
            }}
          >
            {upcomingMovies.map(movie => (
              <div key={movie.id} className="flex-shrink-0 w-[250px] snap-start">
                <Link to={`/movie/${movie.id}`}>
                  <div className="relative group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <LazyLoadImage
                        src={movie.image || '/placeholder.svg'}
                        alt={movie.title}
                        effect="blur"
                        className="w-full h-[375px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        placeholderSrc="/placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                        <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-cyan-500 text-white border-none">Coming Soon</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genres?.slice(0, 2).map(genre => (
                          <Badge
                            key={genre}
                            variant="secondary"
                            className="bg-slate-800 text-slate-300 text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`mt-2 w-full ${
                    isInWatchlist(movie)
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => {
                    toggleWatchlist(movie);
                  }}
                >
                  {isInWatchlist(movie) ? (
                    <Bookmark className="h-4 w-4 mr-1 fill-current" />
                  ) : (
                    <Plus className="h-4 w-4 mr-1" />
                  )}
                  {isInWatchlist(movie) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Genre */}
      <section className="py-8 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Filter className="h-6 w-6 text-green-500" />
              Explore by Genre
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setShowFilters(!showFilters);
              }}
              className="border-slate-700 text-slate-400 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Media Type Filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Media Type</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="movie-filter"
                        checked={filterOptions.mediaType.includes('movie')}
                        onCheckedChange={checked => {
                          handleMediaTypeChange('movie', checked as boolean);
                        }}
                        className="border-slate-600"
                      />
                      <Label
                        htmlFor="movie-filter"
                        className="text-sm text-slate-300 flex items-center gap-2"
                      >
                        <Film className="h-4 w-4" />
                        Movies
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tv-filter"
                        checked={filterOptions.mediaType.includes('tv')}
                        onCheckedChange={checked => {
                          handleMediaTypeChange('tv', checked as boolean);
                        }}
                        className="border-slate-600"
                      />
                      <Label
                        htmlFor="tv-filter"
                        className="text-sm text-slate-300 flex items-center gap-2"
                      >
                        <Tv className="h-4 w-4" />
                        TV Shows
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Genre Filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Genres</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[...movieGenres, ...tvGenres]
                      .filter(
                        (genre, index, self) => self.findIndex(g => g.id === genre.id) === index,
                      )
                      .slice(0, 8)
                      .map(genre => (
                        <div key={genre.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genre-${genre.id}`}
                            checked={filterOptions.genres.includes(genre.id)}
                            onCheckedChange={checked => {
                              handleGenreChange(genre.id, checked as boolean);
                            }}
                            className="border-slate-600"
                          />
                          <Label htmlFor={`genre-${genre.id}`} className="text-sm text-slate-300">
                            {genre.name}
                          </Label>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Year Range Filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Year Range</h4>
                  <div className="space-y-3">
                    <Slider
                      value={filterOptions.year}
                      onValueChange={value => {
                        handleFilterChange('year', value);
                      }}
                      min={1990}
                      max={new Date().getFullYear()}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{filterOptions.year[0]}</span>
                      <span>{filterOptions.year[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Minimum Rating</h4>
                  <div className="space-y-3">
                    <Slider
                      value={[filterOptions.rating]}
                      onValueChange={value => {
                        handleFilterChange('rating', value[0]);
                      }}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>0</span>
                      <span className="text-yellow-400">{filterOptions.rating}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-slate-600 text-slate-300"
                >
                  Reset Filters
                </Button>
                <div className="text-sm text-slate-400">
                  Showing {filteredContent.length} results
                </div>
              </div>
            </Card>
          )}

          {/* Filtered Content Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredContent.slice(0, 24).map(item => (
              <div key={`${item.type}-${item.id}`} className="group">
                <Link to={`/${item.type}/${item.id}`}>
                  <div className="relative cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <LazyLoadImage
                        src={item.image || '/placeholder.svg'}
                        alt={item.title}
                        effect="blur"
                        className="w-full h-[375px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        placeholderSrc="/placeholder.svg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <Button
                          size="sm"
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Watch
                        </Button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge
                          className={`${item.type === 'movie' ? 'bg-blue-500' : 'bg-purple-500'} text-white border-none text-xs`}
                        >
                          {item.type === 'movie' ? 'Movie' : 'TV'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-medium text-white text-sm line-clamp-2">{item.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <span>{item.year}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`mt-1 w-full text-xs ${
                    isInWatchlist(item)
                      ? 'text-purple-400 hover:text-purple-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => {
                    toggleWatchlist(item);
                  }}
                >
                  {isInWatchlist(item) ? (
                    <Bookmark className="h-3 w-3 mr-1 fill-current" />
                  ) : (
                    <Plus className="h-3 w-3 mr-1" />
                  )}
                  {isInWatchlist(item) ? 'In Watchlist' : 'Add'}
                </Button>
              </div>
            ))}
          </div>

          {filteredContent.length > 24 && (
            <div className="text-center mt-8">
              <Button className="bg-purple-500 hover:bg-purple-600">
                Load More Content
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <span className="text-xl font-bold text-white">CineContext</span>
              </div>
              <p className="text-slate-400 text-sm">
                Discover stories that feel right. Your personal guide to movies and TV shows.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/movies" className="hover:text-white transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/shows" className="hover:text-white transition-colors">
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link to="/genres" className="hover:text-white transition-colors">
                    Genres
                  </Link>
                </li>
                <li>
                  <Link to="/trending" className="hover:text-white transition-colors">
                    Trending
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/profile" className="hover:text-white transition-colors">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/watchlist" className="hover:text-white transition-colors">
                    Watchlist
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="hover:text-white transition-colors">
                    Settings
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    Help
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 CineContext. All rights reserved. Powered by TMDB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
