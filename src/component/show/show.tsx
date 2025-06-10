import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  Play,
  Plus,
  Heart,
  Share2,
  Star,
  Calendar,
  Users,
  // Award,
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  // Eye,
  // Download,
  Loader2,
} from 'lucide-react';
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
// import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';

// TypeScript interfaces for TMDB API responses
interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

interface TMDBCreator {
  id: number;
  name: string;
  profile_path: string | null;
  credit_id: string;
}

interface TMDBSeason {
  id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  vote_average: number;
}

interface TMDBEpisode {
  id: number;
  name: string;
  overview: string | null;
  air_date: string | null;
  episode_number: number;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

interface TMDBSeasonDetails extends TMDBSeason {
  episodes: TMDBEpisode[];
}

interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface TMDBReview {
  id: string;
  author: string;
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface TMDBWatchProviders {
  results: {
    US?: {
      flatrate?: TMDBWatchProvider[];
    };
  };
}

interface TMDBExternalIds {
  imdb_id: string | null;
  tvdb_id: number | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

interface TMDBTVShowDetails {
  id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  last_air_date: string | null;
  status: string;
  vote_average: number;
  vote_count: number;
  number_of_episodes: number;
  number_of_seasons: number;
  genres: TMDBGenre[];
  networks: TMDBNetwork[];
  created_by: TMDBCreator[];
  seasons: TMDBSeason[];
  credits: TMDBCredits;
  videos: {
    results: TMDBVideo[];
  };
  reviews: {
    results: TMDBReview[];
  };
  'watch/providers': TMDBWatchProviders;
  external_ids: TMDBExternalIds;

  firstAired: string;
  country: string;
  network: string;
  language: string;
  totalEpisodes: string;
  totalSeasons: string;
  crew: Array<{ name: string; role: string }>;
  cast: Array<{
    id: number;
    name: string;
    character: string;
    image: string | null;
    episodes: number;
    isMain: boolean;
  }>;
}

interface TMDBSimilarShowsResponse {
  results: Array<{
    id: number;
    name: string;
    poster_path: string | null;
    first_air_date: string | null;
    vote_average: number;
    genre_ids: number[];
  }>;
}

interface SimilarShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string | null;
  vote_average: number;
  genre_ids: number[];
}

// TMDB API Configuration
const TMDB_API_KEY = '452777385104bb1696e163a7da57901f';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB API service functions
const tmdbApi = {
  async getTVShowDetails(id: string): Promise<TMDBTVShowDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,reviews,recommendations,external_ids,watch/providers`,
    );
    if (!response.ok) throw new Error('Failed to fetch TV show details');
    return await response.json();
  },

  async getSeasonDetails(showId: string, seasonNumber: number): Promise<TMDBSeasonDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`,
    );
    if (!response.ok) throw new Error('Failed to fetch season details');
    return await response.json();
  },

  async getSimilarShows(id: string): Promise<TMDBSimilarShowsResponse> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}/similar?api_key=${TMDB_API_KEY}&page=1`,
    );
    if (!response.ok) throw new Error('Failed to fetch similar shows');
    return await response.json();
  },

  getImageUrl(path: string | null, size = 'w342'): string {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : '/placeholder.svg';
  },

  getBackdropUrl(path: string | null, size = 'w1280'): string {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : '/placeholder.svg';
  },
};

// Helper functions
const formatRuntime = (runtime: number | null): string => {
  if (!runtime) return 'N/A';
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusColor = (status: string | undefined): string => {
  switch (status?.toLowerCase()) {
    case 'returning series':
    case 'in production':
      return 'bg-green-500/20 text-green-300';
    case 'ended':
    case 'canceled':
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-slate-700 text-slate-300';
  }
};

export default function ShowDetailsPage(): React.JSX.Element {
  // Default to Game of Thrones for demo
  const { showId } = useParams<{ showId: string }>();
  const [showData, setShowData] = useState<TMDBTVShowDetails | null>(null);
  const [seasonDetails, setSeasonDetails] = useState<Record<number, TMDBSeasonDetails>>({});
  const [similarShows, setSimilarShows] = useState<SimilarShow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([1]);
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);

  // Load initial data
  useEffect(() => {
    const loadShowData = async (): Promise<void> => {
      if (!showId) return;

      try {
        setLoading(true);
        setError(null);

        // Load main show data
        const [showResponse, similarResponse] = await Promise.all([
          tmdbApi.getTVShowDetails(showId),
          tmdbApi.getSimilarShows(showId),
        ]);

        setShowData(showResponse);
        setSimilarShows(similarResponse.results.slice(0, 4));

        // Load first season details
        if (showResponse.seasons && showResponse.seasons.length > 0) {
          const firstSeason =
            showResponse.seasons.find(s => s.season_number === 1) || showResponse.seasons[0];
          if (firstSeason) {
            const seasonData = await tmdbApi.getSeasonDetails(showId, firstSeason.season_number);
            setSeasonDetails({ [firstSeason.season_number]: seasonData });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (showId) {
      loadShowData();
    }
  }, [showId]);

  // Load season details when expanded
  const toggleSeasonExpanded = async (seasonNumber: number): Promise<void> => {
    setExpandedSeasons(prev =>
      prev.includes(seasonNumber) ? prev.filter(s => s !== seasonNumber) : [...prev, seasonNumber],
    );

    // Load season details if not already loaded
    if (!seasonDetails[seasonNumber] && !expandedSeasons.includes(seasonNumber) && showId) {
      try {
        const seasonData = await tmdbApi.getSeasonDetails(showId, seasonNumber);
        setSeasonDetails(prev => ({ ...prev, [seasonNumber]: seasonData }));
      } catch (err) {
        console.error('Failed to load season details:', err);
      }
    }
  };

  const handleRating = (rating: number): void => {
    setUserRating(rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-300">Show not found</p>
      </div>
    );
  }

  // Extract useful data from TMDB response
  const backdropUrl = tmdbApi.getBackdropUrl(showData.backdrop_path);
  const posterUrl = tmdbApi.getImageUrl(showData.poster_path, 'w500');
  const totalEpisodes = showData.number_of_episodes || 0;
  const totalSeasons = showData.number_of_seasons || 0;
  const rating = showData.vote_average ? parseFloat(showData.vote_average.toFixed(1)) : 0;
  const genres = showData.genres || [];
  // const creators = showData.created_by || [];
  const networks = showData.networks || [];
  const cast = showData.credits?.cast?.slice(0, 12) || [];
  // const crew =
  //   showData.credits?.crew
  //     ?.filter(member =>
  //       ['Executive Producer', 'Creator', 'Director', 'Writer'].includes(member.job),
  //     )
  //     .slice(0, 6) || [];
  // const reviews = showData.reviews?.results?.slice(0, 5) || [];
  const trailer = showData.videos?.results?.find(
    video => video.type === 'Trailer' && video.site === 'YouTube',
  );
  const watchProviders = showData['watch/providers']?.results?.US?.flatrate || [];

  // Mock progress data (in real app, this would come from user's watch history)
  const watchedEpisodes = Math.floor(totalEpisodes * 0.3); // 30% watched for demo
  const watchProgress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Related Content */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Similar Shows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarShows.map(show => (
                    <div
                      key={show.id}
                      className="flex gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={tmdbApi.getImageUrl(show.poster_path, 'w92')}
                        alt={show.name}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate">{show.name}</h4>
                        <p className="text-xs text-slate-400">
                          {show.first_air_date
                            ? new Date(show.first_air_date).getFullYear()
                            : 'N/A'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-slate-300">
                            {show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {show.genre_ids?.slice(0, 2).map(genreId => (
                            <Badge
                              key={genreId}
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 text-xs"
                            >
                              {genreId}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {/* Show Header */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={posterUrl}
                    alt={showData.name}
                    className="w-64 h-96 object-cover rounded-lg shadow-2xl mx-auto md:mx-0"
                  />
                </div>

                {/* Show Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {showData.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {showData.first_air_date
                          ? new Date(showData.first_air_date).getFullYear()
                          : 'N/A'}
                        {showData.status !== 'Ended' &&
                          showData.last_air_date &&
                          ` - ${new Date(showData.last_air_date).getFullYear()}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {totalSeasons} seasons, {totalEpisodes} episodes
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {rating}
                      </span>
                      <Badge variant="secondary" className={getStatusColor(showData.status)}>
                        {showData.status}
                      </Badge>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {genres.map(genre => (
                        <Badge
                          key={genre.id}
                          variant="secondary"
                          className="bg-slate-700 text-slate-300"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Networks */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {networks.map(network => (
                        <Badge
                          key={network.id}
                          variant="secondary"
                          className="bg-purple-500/20 text-purple-300"
                        >
                          {network.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Watch Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-slate-300">Your Progress</h4>
                      <span className="text-sm text-slate-400">
                        {watchedEpisodes}/{totalEpisodes} episodes
                      </span>
                    </div>
                    <Progress value={watchProgress} className="h-2 bg-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                        style={{ width: `${watchProgress}%` }}
                      />
                    </Progress>
                  </div>

                  {/* Synopsis */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                    <p className="text-slate-300 leading-relaxed">
                      {showData.overview || 'No synopsis available.'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {trailer && (
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() =>
                          window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank')
                        }
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Trailer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className={`border-slate-600 ${isInWatchlist ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'text-slate-300'}`}
                      onClick={() => {
                        setIsInWatchlist(!isInWatchlist);
                      }}
                    >
                      {isInWatchlist ? (
                        <Bookmark className="h-4 w-4 mr-2 fill-current" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                    </Button>
                    <Button
                      variant="outline"
                      className={`border-slate-600 ${isLiked ? 'bg-red-500/20 border-red-500 text-red-300' : 'text-slate-300'}`}
                      onClick={() => {
                        setIsLiked(!isLiked);
                      }}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {isLiked ? 'Liked' : 'Like'}
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {/* User Rating */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Rate this show</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => {
                            handleRating(star);
                          }}
                          className="transition-colors"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= userRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-600 hover:text-yellow-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Where to Watch */}
                  {watchProviders.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Where to Watch</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchProviders.map(provider => (
                          <Badge
                            key={provider.provider_id}
                            className="bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer"
                          >
                            {provider.provider_name}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Information Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="episodes" className="data-[state=active]:bg-purple-500">
                    Episodes
                  </TabsTrigger>
                  <TabsTrigger value="cast" className="data-[state=active]:bg-purple-500">
                    Cast & Crew
                  </TabsTrigger>
                  <TabsTrigger value="details" className="data-[state=active]:bg-purple-500">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-500">
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">About the Show</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">
                        {showData.overview || 'No detailed description available.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Season Overview */}
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Seasons Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {showData.seasons
                          ?.filter(season => season.season_number > 0)
                          .map(season => (
                            <div
                              key={season.id}
                              className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <img
                                src={tmdbApi.getImageUrl(season.poster_path)}
                                alt={season.name}
                                className="w-full h-85 object-cover rounded mb-3"
                              />
                              <h4 className="font-medium text-white mb-1">{season.name}</h4>
                              <p className="text-sm text-slate-400 mb-2">
                                {season.air_date ? new Date(season.air_date).getFullYear() : 'N/A'}{' '}
                                • {season.episode_count} episodes
                              </p>
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-slate-300">
                                  {season.vote_average ? season.vote_average.toFixed(1) : 'N/A'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2">
                                {season.overview || 'No description available.'}
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Episodes Tab */}
                <TabsContent value="episodes" className="space-y-6">
                  <div className="space-y-4">
                    {showData.seasons
                      ?.filter(season => season.season_number > 0)
                      .map(season => (
                        <Card
                          key={season.id}
                          className="bg-slate-900/80 backdrop-blur border-slate-700"
                        >
                          <Collapsible
                            open={expandedSeasons.includes(season.season_number)}
                            onOpenChange={() => toggleSeasonExpanded(season.season_number)}
                          >
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                      {season.name}
                                      <Badge
                                        variant="secondary"
                                        className="bg-slate-700 text-slate-300"
                                      >
                                        {season.episode_count} episodes
                                      </Badge>
                                    </CardTitle>
                                    <p className="text-slate-400 text-sm mt-1">
                                      {season.air_date
                                        ? formatDate(season.air_date)
                                        : 'Air date TBA'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-slate-300">
                                        {season.vote_average
                                          ? season.vote_average.toFixed(1)
                                          : 'N/A'}
                                      </span>
                                    </div>
                                    {expandedSeasons.includes(season.season_number) ? (
                                      <ChevronDown className="h-5 w-5 text-slate-400" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-slate-400" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                {seasonDetails[season.season_number] ? (
                                  <div className="space-y-3">
                                    {seasonDetails[season.season_number].episodes?.map(episode => (
                                      <div
                                        key={episode.id}
                                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                                      >
                                        <div className="flex-shrink-0">
                                          <img
                                            src={tmdbApi.getImageUrl(episode.still_path, 'w300')}
                                            alt={episode.name}
                                            className="w-24 h-14 object-cover rounded"
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-white">
                                              {episode.episode_number}. {episode.name}
                                            </h4>
                                          </div>
                                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-1">
                                            <span>{formatRuntime(episode.runtime)}</span>
                                            <span>{formatDate(episode.air_date)}</span>
                                            <div className="flex items-center gap-1">
                                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                              <span>
                                                {episode.vote_average
                                                  ? episode.vote_average.toFixed(1)
                                                  : 'N/A'}
                                              </span>
                                            </div>
                                          </div>
                                          <p className="text-sm text-slate-300 line-clamp-2">
                                            {episode.overview || 'No description available.'}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-slate-600 text-slate-300"
                                          >
                                            <Play className="h-4 w-4 mr-1" />
                                            Watch
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    <p className="text-slate-400">Loading episodes...</p>
                                  </div>
                                )}
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                {/* Cast & Crew Tab */}
                <TabsContent value="cast" className="space-y-6">
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Cast
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {cast.map(actor => (
                          <div key={actor.id} className="text-center group cursor-pointer">
                            <div className="relative mb-2">
                              <img
                                src={tmdbApi.getImageUrl(actor.profile_path, 'w185')}
                                alt={actor.name}
                                className="w-full h-50 object-cover rounded-lg group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <h4 className="font-medium text-white text-sm">{actor.name}</h4>
                            <p className="text-xs text-slate-400">{actor.character}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Recurring Cast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {showData.cast
                          ?.filter(actor => !actor.isMain)
                          .map(actor => (
                            <div key={actor.id} className="text-center group cursor-pointer">
                              <div className="relative mb-2">
                                <img
                                  src={actor.image || '/placeholder.svg'}
                                  alt={actor.name}
                                  className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <h4 className="font-medium text-white text-sm">{actor.name}</h4>
                              <p className="text-xs text-slate-400">{actor.character}</p>
                              <p className="text-xs text-purple-400 mt-1">
                                {actor.episodes} episodes
                              </p>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Key Crew</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {showData.crew?.map((member, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-slate-700 last:border-b-0"
                          >
                            <span className="text-slate-300">{member.name}</span>
                            <span className="text-slate-400 text-sm">{member.role}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Production Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">First Aired</h4>
                            <p className="text-slate-300">{showData.firstAired}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Status</h4>
                            <p className="text-slate-300">{showData.status}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Language</h4>
                            <p className="text-slate-300">{showData.language}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Country</h4>
                            <p className="text-slate-300">{showData.country}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Network</h4>
                            <p className="text-slate-300">{showData.network}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">
                              Total Seasons
                            </h4>
                            <p className="text-slate-300">{showData.totalSeasons}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">
                              Total Episodes
                            </h4>
                            <p className="text-slate-300">{showData.totalEpisodes}</p>
                          </div>
                          {/* <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Creators</h4>
                            <p className="text-slate-300">{showData?.creators?.join(', ')}</p>
                          </div> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6">
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">User Reviews</CardTitle>
                    </CardHeader>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
