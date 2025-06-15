import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';

import {
  ArrowLeft,
  Play,
  Plus,
  Heart,
  Share2,
  Star,
  Clock,
  Calendar,
  Users,
  Bookmark,
  ExternalLink,
  DollarSign,
  Globe,
  Film,
  Loader2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ContentBackdrop } from '../show/components/ContentBackdrop';
import { ContentTitleLogo } from '../show/components/ContentTitleLogo';
import { TrailerModal } from './components/TrailerModal';
import { tmdbApi, formatRating, getYear } from '@app/service/tmdb';
import type { TMDBCredits, TMDBMovie, TMDBVideo } from '@app/types/tmdb';

export const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState<TMDBMovie | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  const fetchMovieData = async () => {
    try {
      if (movieId !== undefined) {
        setLoading(true);
        setError(null);

        const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
          tmdbApi.getMovieDetails(movieId as unknown as number),
          tmdbApi.getMovieCredits(movieId as unknown as number),
          tmdbApi.getMovieVideos(movieId as unknown as number),
        ]);

        setMovie(movieResponse);
        setCredits(creditsResponse);
        setVideos(videosResponse.results);
      }
    } catch (err) {
      console.error('Error fetching movie data:', err);
      setError('Failed to load movie details. Please try again.');
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

  const openTrailerModal = () => {
    setShowTrailerModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading movie details...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">{error || 'Movie not found'}</p>
          <Link to="/">
            <Button className="bg-purple-500 hover:bg-purple-600">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get main cast and crew
  const mainCast = credits?.cast.slice(0, 12) || [];
  const director = credits?.crew.find(person => person.job === 'Director');
  const writers =
    credits?.crew.filter(person => person.job === 'Writer' || person.job === 'Screenplay') || [];
  const producers = credits?.crew.filter(person => person.job === 'Producer') || [];

  // Get trailer
  const trailer = videos.find(video => video.site === 'YouTube' && video.type === 'Trailer');

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
        contentId={movie.id}
        contentType="movie"
        contentTitle={movie.title}
        className="relative h-[70vh] min-h-[500px]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/30"></div>

        <div className="container mx-auto px-4 h-full flex items-center relative">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={tmdbApi.getImageUrl(movie.poster_path) || '/placeholder.svg'}
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                {/* Movie Title with Logo */}
                <div className="mb-4">
                  <ContentTitleLogo
                    contentId={movie.id}
                    contentType="movie"
                    contentTitle={movie.title}
                    className="mb-2"
                    fallbackClassName="text-4xl md:text-5xl font-bold"
                  />
                </div>

                {movie.tagline && (
                  <p className="text-xl text-slate-300 italic mb-4">{movie.tagline}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {getYear(movie.release_date)}
                  </span>
                  {movie.runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {tmdbApi.formatRuntime(movie.runtime)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {formatRating(movie.vote_average)}
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      movie.status === 'Released'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-slate-700 text-slate-300'
                    }
                  >
                    {movie.status}
                  </Badge>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres?.map(genre => (
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
              {movie?.production_companies && movie.production_companies.length > 0 && (
                <div className="mb-6">
                  {(() => {
                    const primaryCompany = movie.production_companies[0];
                    return (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-600/30 to-purple-500/30 
                     text-purple-200 border border-purple-400/30 
                     flex items-center gap-3 px-4 py-2 rounded-lg
                     backdrop-blur-sm shadow-lg   
                     transition-all duration-300 "
                      >
                        {primaryCompany.logo_path && (
                          <div className="flex-shrink-0 bg-white/10 rounded-md p-1">
                            <img
                              src={`https://image.tmdb.org/t/p/w300${primaryCompany.logo_path}`}
                              alt={`${primaryCompany.name} logo`}
                              className="h-6 w-auto object-contain max-w-20 filter brightness-110"
                              onError={e => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <span className="font-medium text-sm tracking-wide">
                          {primaryCompany.name}
                        </span>
                      </Badge>
                    );
                  })()}
                </div>
              )}
              {/* Synopsis */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                <p className="text-slate-300 leading-relaxed">
                  {movie.overview || 'No synopsis available.'}
                </p>
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
                <h4 className="text-sm font-medium text-slate-300 mb-2">Rate this movie</h4>
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
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              Overview
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
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Synopsis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{movie.overview}</p>
                  </CardContent>
                </Card>

                {/* Key Crew */}
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Key Crew</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {director && (
                        <div className="flex justify-between items-center py-2 border-b border-slate-700">
                          <span className="text-slate-300">{director.name}</span>
                          <span className="text-slate-400 text-sm">Director</span>
                        </div>
                      )}
                      {writers.slice(0, 3).map((writer, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-slate-700"
                        >
                          <span className="text-slate-300">{writer.name}</span>
                          <span className="text-slate-400 text-sm">{writer.job}</span>
                        </div>
                      ))}
                      {producers.slice(0, 2).map((producer, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-slate-700"
                        >
                          <span className="text-slate-300">{producer.name}</span>
                          <span className="text-slate-400 text-sm">Producer</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Facts */}
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Release Date</span>
                      <span className="text-slate-300">
                        {tmdbApi.formatDate(movie.release_date)}
                      </span>
                    </div>
                    {movie.runtime && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Runtime</span>
                        <span className="text-slate-300">
                          {tmdbApi.formatRuntime(movie.runtime)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rating</span>
                      <span className="text-slate-300">{formatRating(movie.vote_average)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Votes</span>
                      <span className="text-slate-300">{movie.vote_count.toLocaleString()}</span>
                    </div>
                    {movie.budget && movie.budget > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Budget</span>
                        <span className="text-slate-300">
                          {tmdbApi.formatCurrency(movie.budget)}
                        </span>
                      </div>
                    )}
                    {movie.revenue && movie.revenue > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Revenue</span>
                        <span className="text-slate-300">
                          {tmdbApi.formatCurrency(movie.revenue)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* External Links */}
                {(movie.homepage || movie.imdb_id) && (
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">External Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {movie.homepage && (
                        <a
                          href={movie.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Globe className="h-4 w-4" />
                          Official Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {movie.imdb_id && (
                        <a
                          href={`https://www.imdb.com/title/${movie.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Film className="h-4 w-4" />
                          IMDb
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
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
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Original Title</h4>
                      <p className="text-slate-300">{movie.original_title}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Status</h4>
                      <p className="text-slate-300">{movie.status}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Original Language</h4>
                      <p className="text-slate-300">{movie.original_language?.toUpperCase()}</p>
                    </div>
                    {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">
                          Spoken Languages
                        </h4>
                        <p className="text-slate-300">
                          {movie.spoken_languages.map(lang => lang.english_name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Financial Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {movie.budget && movie.budget > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Budget</h4>
                        <p className="text-slate-300 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {tmdbApi.formatCurrency(movie.budget)}
                        </p>
                      </div>
                    )}
                    {movie.revenue && movie.revenue > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Box Office</h4>
                        <p className="text-slate-300 flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {tmdbApi.formatCurrency(movie.revenue)}
                        </p>
                      </div>
                    )}
                    {movie.budget && movie.revenue && movie.budget > 0 && movie.revenue > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Profit</h4>
                        <p
                          className={`flex items-center gap-1 ${
                            movie.revenue > movie.budget ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          <DollarSign className="h-4 w-4" />
                          {tmdbApi.formatCurrency(movie.revenue - movie.budget)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Production Companies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {movie.production_companies.map(company => (
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

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            {videos.length > 0 && (
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        contentId={movie.id}
        contentType="movie"
        contentTitle={movie.title}
      />
    </div>
  );
};
