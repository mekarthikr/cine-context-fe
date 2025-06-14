import { useState, useEffect } from 'react';
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
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
  Loader2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../..//ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../..//ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../..//ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Progress } from '../../ui/progress';
import { ContentTitleLogo } from '../ContentTitleLogo';
import { ContentBackdrop } from '../ContentBackdrop';
import { TrailerModal } from '../TrailerModal';
import {
  tmdbApi,
  type TMDBTVShow,
  type TMDBCredits,
  type TMDBVideo,
  formatRating,
  getYear,
  type TMDBSeason,
} from '../../lib/tmdb';
import { config } from '../../config';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
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
export default function ShowDetailsPage() {
  const { showId } = useParams<{ showId: string }>();

  async function getSeasonDetails(
    showId: string,
    seasonNumber: number,
  ): Promise<TMDBSeasonDetails> {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${config.TMDB_API_KEY}`,
    );
    if (!response.ok) throw new Error('Failed to fetch season details');
    return await response.json();
  }
  const [show, setShow] = useState<TMDBTVShow | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
  const [seasonDetails, setSeasonDetails] = useState<Record<number, TMDBSeasonDetails>>({});
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>();
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    if (showId) {
      fetchShowData();
    }
  }, [showId]);

  const fetchShowData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [showResponse, creditsResponse, videosResponse] = await Promise.all([
        tmdbApi.getTVShowDetails(Number(showId)),
        tmdbApi.getTVShowCredits(Number(showId)),
        tmdbApi.getTVShowVideos(Number(showId)),
      ]);

      setShow(showResponse);
      setCredits(creditsResponse);
      setVideos(videosResponse.results);
    } catch (err) {
      console.error('Error fetching show data:', err);
      setError('Failed to load show details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
  };

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleSeasonExpanded = async (seasonNumber: number): Promise<void> => {
    setExpandedSeasons(prev =>
      Array.isArray(prev)
        ? prev.includes(seasonNumber)
          ? prev.filter(s => s !== seasonNumber)
          : [...prev, seasonNumber]
        : [seasonNumber],
    );

    // Load season details if not already loaded
    if (!seasonDetails[seasonNumber] && !expandedSeasons?.includes(seasonNumber) && showId) {
      try {
        const seasonData = await getSeasonDetails(showId, seasonNumber);
        setSeasonDetails(prev => ({ ...prev, [seasonNumber]: seasonData }));
      } catch (err) {
        console.error('Failed to load season details:', err);
      }
    }
  };

  const openTrailerModal = () => {
    setShowTrailerModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mb-4 mx-auto"></div>
          <p className="text-slate-400 text-lg">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">{error || 'Show not found'}</p>
          <Link to="/">
            <Button className="bg-purple-500 hover:bg-purple-600">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get main cast and crew
  const mainCast = credits?.cast.slice(0, 12) || [];
  const creators = show.created_by || [];
  const producers = credits?.crew.filter(person => person.job === 'Executive Producer') || [];
  const networks = show.networks || [];
  // Get trailer
  const trailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');

  // Calculate watch progress (mock data - would come from user data in real app)
  const watchedEpisodes = 0;
  const totalEpisodes = show.number_of_episodes || 0;
  const watchProgress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

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

      {/* Background Image with TMDB Integration */}
      <ContentBackdrop
        contentId={show.id}
        contentType="tv"
        contentTitle={show.name}
        className="relative h-[70vh] min-h-[500px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/30"></div>

        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={tmdbApi.getImageUrl(show.poster_path) || '/placeholder.svg'}
                alt={show.name}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Show Info */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                {/* Show Title with Logo */}
                <div className="mb-4">
                  <ContentTitleLogo
                    contentId={show.id}
                    contentType="tv"
                    contentTitle={show.name}
                    className="mb-2"
                    fallbackClassName="text-4xl md:text-5xl font-bold"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {getYear(show.first_air_date)} -{' '}
                    {show.last_air_date ? getYear(show.last_air_date) : 'Present'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {show.number_of_seasons} seasons, {show.number_of_episodes} episodes
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {formatRating(show.vote_average)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      show.status === 'Returning Series' || show.in_production
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-slate-700 text-slate-300'
                    }
                  >
                    {show.status}
                  </Badge>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {show.genres?.map(genre => (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {networks.map(network => (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-600/30 to-purple-500/30 
                     text-purple-200 border border-purple-400/30 
                     flex items-center gap-3 px-4 py-2 rounded-lg
                     backdrop-blur-sm shadow-lg   
                     transition-all duration-300 "
                  >
                    {network.logo_path && (
                      <div className="flex-shrink-0 bg-white/10 rounded-md p-1">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${network.logo_path}`}
                          alt={`${network.name} logo`}
                          className="h-6 w-auto object-contain max-w-20 filter brightness-110"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <span className="font-medium text-sm tracking-wide">{network.name}</span>
                  </Badge>
                ))}
              </div>

              {/* Watch Progress */}
              {totalEpisodes > 0 && (
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
              )}

              {/* Synopsis */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                <p className="text-slate-300 leading-relaxed">{show.overview}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <Button
                    onClick={openTrailerModal}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Trailer
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={`border-slate-600 ${
                    isInWatchlist
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'text-slate-300'
                  }`}
                  onClick={toggleWatchlist}
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
                  className={`border-slate-600 ${
                    isLiked ? 'bg-red-500/20 border-red-500 text-red-300' : 'text-slate-300'
                  }`}
                  onClick={toggleLike}
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
            </div>
          </div>
        </div>
      </ContentBackdrop>

      <div className="container mx-auto px-4 py-8">
        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700"
            style={{ marginBottom: '10px' }}
          >
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
            <TabsTrigger value="media" className="data-[state=active]:bg-purple-500">
              Media
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Synopsis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{show.overview}</p>
                  </CardContent>
                </Card> */}

                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Seasons Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {show.seasons
                        ?.filter(season => season.season_number > 0)
                        .map(season => (
                          <div
                            key={season.id}
                            className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <img
                              src={tmdbApi.getImageUrl(season.poster_path)}
                              alt={season.name}
                              className="w-full object-cover rounded mb-3"
                            />
                            <h4 className="font-medium text-white mb-1">{season.name}</h4>
                            <p className="text-sm text-slate-400 mb-2">
                              {season.air_date ? new Date(season.air_date).getFullYear() : 'N/A'} •{' '}
                              {season.episode_count} episodes
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

                {/* Creators & Key Crew */}
                {/* <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Creators & Key Crew</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {creators.map((creator, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-300">{creator.name}</span>
                          <span className="text-slate-400 text-sm">Creator</span>
                        </div>
                      ))}
                      {producers.slice(0, 4).map((producer, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-slate-700"
                        >
                          <span className="text-slate-300">{producer.name}</span>
                          <span className="text-slate-400 text-sm">Executive Producer</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Facts */}
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Creators & Key Crew</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                      {creators.map((creator, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-slate-700"
                        >
                          <span className="text-slate-300">{creator.name}</span>
                          <span className="text-slate-400 text-sm">Creator</span>
                        </div>
                      ))}
                      {producers.slice(0, 4).map((producer, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-slate-700"
                        >
                          <span className="text-slate-300">{producer.name}</span>
                          <span className="text-slate-400 text-sm">Executive Producer</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">First Aired</span>
                      <span className="text-slate-300">
                        {tmdbApi.formatDate(show.first_air_date)}
                      </span>
                    </div>
                    {show.last_air_date && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Aired</span>
                        <span className="text-slate-300">
                          {tmdbApi.formatDate(show.last_air_date)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status</span>
                      <span className="text-slate-300">{show.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rating</span>
                      <span className="text-slate-300">{formatRating(show.vote_average)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Votes</span>
                      <span className="text-slate-300">{show.vote_count.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seasons</span>
                      <span className="text-slate-300">{show.number_of_seasons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Episodes</span>
                      <span className="text-slate-300">{show.number_of_episodes}</span>
                    </div>
                    {show.episode_run_time && show.episode_run_time.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Runtime</span>
                        <span className="text-slate-300">{show.episode_run_time[0]} min</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Networks */}
                {/* {show.networks && show.networks.length > 0 && (
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Networks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {show.networks.map((network) => (
                        <div key={network.id} className="flex items-center gap-2">
                          {network.logo_path ? (
                            <img
                              src={tmdbApi.getImageUrl(network.logo_path) || "/placeholder.svg"}
                              alt={network.name}
                              className="h-6 w-auto object-contain"
                            />
                          ) : (
                            <Tv className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="text-slate-300">{network.name}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )} */}

                {/* External Links */}
                {show.homepage && (
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">External Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <a
                        href={show.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Official Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Episodes Tab */}
          <TabsContent value="episodes" className="space-y-6">
            {show.seasons && show.seasons.length > 0 ? (
              <div className="space-y-4">
                {show.seasons
                  .filter(season => season.season_number > 0) // Filter out specials
                  .map(season => (
                    <Card
                      key={season.id}
                      className="bg-slate-900/80 backdrop-blur border-slate-700"
                      style={{ padding: '0' }}
                    >
                      <Collapsible
                        open={expandedSeasons?.includes(season.season_number) ?? false}
                        onOpenChange={() => toggleSeasonExpanded(season.season_number)}
                      >
                        <CollapsibleTrigger asChild>
                          <CardHeader
                            className={`cursor-pointer ${expandedSeasons?.includes(season.season_number) ? '' : 'hover:bg-slate-800/50 '}transition-colors`}
                          >
                            {/* expandedSeasons.includes(season.season_number) */}
                            <div
                              className="flex items-center justify-between"
                              style={{ margin: '15px 0 15px 0' }}
                            >
                              <div className="flex items-center gap-4">
                                {/* <img
                                  src={tmdbApi.getImageUrl(season.poster_path) || "/placeholder.svg"}
                                  alt={season.name}
                                  className="w-16 h-24 object-cover rounded"
                                /> */}
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
                                    {season.air_date ? tmdbApi.formatDate(season.air_date) : 'TBA'}
                                  </p>
                                  {season.overview && (
                                    <p className="text-slate-300 text-sm mt-2 line-clamp-2">
                                      {season.overview}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-md">
                                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                  <span className="text-slate-200 font-medium">
                                    {season.vote_average ? season.vote_average.toFixed(1) : 'N/A'}
                                  </span>
                                </div>
                                {expandedSeasons?.includes(season.season_number) ? (
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
                                        src={tmdbApi.getImageUrl(episode.still_path, 'w342')}
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
            ) : (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardContent className="text-center py-8">
                  <p className="text-slate-400">No season information available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cast & Crew Tab */}
          <TabsContent value="cast" className="space-y-6">
            <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Main Cast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* {mainCast.map((actor) => (
                    <Link key={actor.id} to={`/person/${actor.id}`}>
                      <div className="text-center group cursor-pointer">
                        <div className="relative mb-2">
                           <img
                                src={tmdbApi.getImageUrl(actor.profile_path, 'w185')}
                                alt={actor.name}
                                className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                              />
                        </div>
                        <h4 className="font-medium text-white text-sm group-hover:text-purple-400 transition-colors">
                          {actor.name}
                        </h4>
                        <p className="text-xs text-slate-400">{actor.character}</p>
                      </div>
                    </Link>
                  ))} */}
                  {mainCast.map(actor => (
                    <Link key={actor.id} to={`/person/${actor.id}`}>
                      <div className="group cursor-pointer bg-slate-900/50 backdrop-blur-sm rounded-xl p-3 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 border border-slate-700/30 hover:border-purple-500/30">
                        {/* Actor Image */}
                        <div className="relative mb-3 overflow-hidden rounded-lg">
                          <div className="aspect-[4/5] relative">
                            <img
                              src={
                                tmdbApi.getImageUrl(actor.profile_path, 'w185') ||
                                '/placeholder-avatar.svg'
                              }
                              alt={actor.name}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500 ease-out"
                            />

                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-purple-400/20 transition-all duration-300" />
                          </div>
                        </div>

                        {/* Actor Information */}
                        <div className="text-center space-y-1.5">
                          <h4 className="font-semibold text-white text-sm leading-tight group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
                            {actor.name}
                          </h4>

                          <div className="relative">
                            <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300 italic line-clamp-2">
                              {actor.character}
                            </p>

                            {/* Subtle underline effect */}
                            {/* <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent group-hover:w-full transition-all duration-300" /> */}
                          </div>
                        </div>

                        {/* Optional: Add a subtle "View Profile" indicator */}
                        <div className="mt-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
                            <span>View Profile</span>
                            <svg
                              className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Production Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Original Name</h4>
                      <p className="text-slate-300">{show.original_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Type</h4>
                      <p className="text-slate-300">{show.type || 'Scripted'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Original Language</h4>
                      <p className="text-slate-300">{show.original_language?.toUpperCase()}</p>
                    </div>
                    {show.spoken_languages && show.spoken_languages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">
                          Spoken Languages
                        </h4>
                        <p className="text-slate-300">
                          {show.spoken_languages.map(lang => lang.english_name).join(', ')}
                        </p>
                      </div>
                    )}
                    {show.origin_country && show.origin_country.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Origin Country</h4>
                        <p className="text-slate-300">{show.origin_country.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Series Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Status</h4>
                      <p className="text-slate-300">{show.status}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">In Production</h4>
                      <p className="text-slate-300">{show.in_production ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Number of Seasons</h4>
                      <p className="text-slate-300">{show.number_of_seasons}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">
                        Number of Episodes
                      </h4>
                      <p className="text-slate-300">{show.number_of_episodes}</p>
                    </div>
                    {show.episode_run_time && show.episode_run_time.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Episode Runtime</h4>
                        <p className="text-slate-300">
                          {show.episode_run_time.map(runtime => `${runtime} min`).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Production Companies */}
            {show.production_companies && show.production_companies.length > 0 && (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Production Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {show.production_companies.map(company => (
                      <div key={company.id} className="text-center">
                        {company.logo_path ? (
                          <img
                            src={tmdbApi.getImageUrl(company.logo_path) || '/placeholder.svg'}
                            alt={company.name}
                            className="h-12 w-auto mx-auto mb-2 object-contain"
                          />
                        ) : (
                          <div className="h-12 w-full bg-slate-700 rounded flex items-center justify-center mb-2">
                            <span className="text-slate-400 text-xs">{company.name}</span>
                          </div>
                        )}
                        <p className="text-slate-300 text-sm">{company.name}</p>
                        <p className="text-slate-500 text-xs">{company.origin_country}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          {/* loading */}
          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {loading ? (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="relative">
                        <div className="w-full aspect-video bg-slate-800 rounded-lg animate-pulse" />
                        <div className="mt-2 space-y-2">
                          <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                          <div className="h-3 bg-slate-800 rounded animate-pulse w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : videos.length > 0 ? (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.slice(0, 6).map(video => (
                      <div
                        key={video.id}
                        className="relative group cursor-pointer"
                        onClick={openTrailerModal}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                          alt={video.name}
                          className="w-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center rounded-lg">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <h4 className="text-white text-sm font-medium line-clamp-1">
                            {video.name}
                          </h4>
                          <p className="text-slate-300 text-xs">{video.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardContent className="text-center py-8">
                  <p className="text-slate-400">No videos available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={showTrailerModal}
        onClose={() => {
          setShowTrailerModal(false);
        }}
        contentId={show.id}
        contentType="tv"
        contentTitle={show.name}
      />
    </div>
  );
}
