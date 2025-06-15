import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  ExternalLink,
  Share2,
  Heart,
  Film,
  Grid,
  List,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Link, useParams } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  tmdbApi,
  // type TMDBPerson,
  // type TMDBPersonCredits,
  // type TMDBExternalIds,
  formatRating,
  getYear,
} from '@app/service/tmdb';
import type { TMDBPerson, TMDBPersonCredits, TMDBExternalIds } from '@app/types/tmdb';

export const PersonDetailsPage: React.FC = () => {
  const { personId } = useParams();
  // const personId = Number(params.id)

  // State
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [credits, setCredits] = useState<TMDBPersonCredits | null>(null);
  const [externalIds, setExternalIds] = useState<TMDBExternalIds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (personId) {
      fetchPersonData();
    }
  }, [personId]);

  const fetchPersonData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [personResponse, creditsResponse, externalIdsResponse] = await Promise.all([
        tmdbApi.getPersonDetails(Number(personId)),
        tmdbApi.getPersonCombinedCredits(Number(personId)),
        tmdbApi.getPersonExternalIds(Number(personId)),
      ]);

      setPerson(personResponse);
      setCredits(creditsResponse);
      setExternalIds(externalIdsResponse);
    } catch (err) {
      console.error('Error fetching person data:', err);
      setError('Failed to load person details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mb-4 mx-auto"></div>
          <p className="text-slate-400 text-lg">Loading person details...</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4 text-lg">{error || 'Person not found'}</p>
          <Link to="/">
            <Button className="bg-purple-500 hover:bg-purple-600">Go Back Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Process credits
  const allCredits = [
    ...(credits?.cast || []).map(credit => ({ ...credit, role_type: 'cast' as const })),
    ...(credits?.crew || []).map(credit => ({ ...credit, role_type: 'crew' as const })),
  ];

  // Filter and sort credits
  const filteredCredits = allCredits
    .filter(credit => {
      if (filterType === 'all') return true;
      return credit.media_type === filterType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'year':
          const aYear = a.release_date || a.first_air_date || '0000';
          const bYear = b.release_date || b.first_air_date || '0000';
          return bYear.localeCompare(aYear);
        case 'title':
          const aTitle = a.title || a.name || '';
          const bTitle = b.title || b.name || '';
          return aTitle.localeCompare(bTitle);
        default:
          return 0;
      }
    });

  // Get known for credits (highest rated/most popular)
  const knownForCredits = allCredits
    .filter(credit => credit.vote_average > 6 && credit.vote_count > 100)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  // Calculate age
  const calculateAge = (birthDate: string, deathDate?: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const age = calculateAge(person.birthday || '', person.deathday);

  // Get backdrop from most popular credit
  const backdropCredit = allCredits
    .filter(credit => credit.backdrop_path)
    .sort((a, b) => b.popularity - a.popularity)[0];

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

      {/* Background Image */}
      {backdropCredit?.backdrop_path ? (
        <div
          className="relative h-[50vh] min-h-[400px] bg-cover bg-center"
          style={{
            backgroundImage: `url(${tmdbApi.getBackdropUrl(backdropCredit.backdrop_path)})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-transparent to-slate-950/30"></div>
        </div>
      ) : (
        <div className="h-[50vh] min-h-[400px] bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"></div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Person Header */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8 -mt-32 relative z-10">
          {/* Profile Picture */}
          <div className="flex-shrink-0 relative">
            <div className="relative h-72 w-72 mx-auto lg:mx-0">
              <img
                src={tmdbApi.getImageUrl(person.profile_path, 'w500')}
                alt={person.name}
                className="w-full h-full object-cover rounded-2xl border-4 border-slate-700 shadow-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">{person.name}</h1>
                {person.known_for_department && (
                  <p className="text-sm text-slate-300">{person.known_for_department}</p>
                )}
              </div>
            </div>
          </div>

          {/* Person Info */}
          <div className="flex-1 space-y-6 bg-slate-900/80 backdrop-blur rounded-lg p-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{person.name}</h1>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  {person.birthday && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {tmdbApi.formatDate(person.birthday)}
                        {age && ` (Age ${age})`}
                        {person.deathday && ` - ${tmdbApi.formatDate(person.deathday)}`}
                      </span>
                    </div>
                  )}
                  {person.place_of_birth && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-4 w-4" />
                      <span>{person.place_of_birth}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-slate-300">
                    <span className="text-slate-400">Known for:</span> {person.known_for_department}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-400">Popularity:</span>{' '}
                    {Math.round(person.popularity)}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{allCredits.length}</div>
                  <div className="text-xs text-slate-400">Total Credits</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-400">
                    {allCredits.filter(c => c.media_type === 'movie').length}
                  </div>
                  <div className="text-xs text-slate-400">Movies</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {allCredits.filter(c => c.media_type === 'tv').length}
                  </div>
                  <div className="text-xs text-slate-400">TV Shows</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {allCredits.length > 0
                      ? (
                          allCredits.reduce((sum, c) => sum + c.vote_average, 0) / allCredits.length
                        ).toFixed(1)
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-slate-400">Avg Rating</div>
                </div>
              </div>

              {/* Biography */}
              {person.biography && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Biography</h3>
                  <p className="text-slate-300 leading-relaxed line-clamp-4">{person.biography}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className={`border-slate-600 ${
                    isFollowing
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'text-slate-300'
                  }`}
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                  }}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {externalIds?.imdb_id && (
                  <Button variant="outline" className="border-slate-600 text-slate-300" asChild>
                    <a
                      href={`https://www.imdb.com/name/${externalIds.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      IMDb
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500">
              Overview
            </TabsTrigger>
            <TabsTrigger value="filmography" className="data-[state=active]:bg-purple-500">
              Filmography
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-purple-500">
              Photos
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-purple-500">
              Details
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Full Biography */}
                {person.biography && (
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Biography</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                        {person.biography}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Known For */}
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Known For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {knownForCredits
                        .filter(credit => credit.vote_average > 7 && credit.vote_count > 500)
                        .slice(0, 6)
                        .map(credit => (
                          <Link key={credit.credit_id} to={`/${credit.media_type}/${credit.id}`}>
                            <div className="group cursor-pointer">
                              <div className="relative aspect-[2/3]">
                                <img
                                  src={tmdbApi.getImageUrl(credit.poster_path, 'w342')}
                                  alt={credit.title || credit.name || 'Unknown'}
                                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <h4 className="font-medium text-white text-sm line-clamp-2">
                                      {credit.title || credit.name || 'Unknown'}
                                    </h4>
                                    <p className="text-xs text-slate-300 mt-1">
                                      {credit.role_type === 'cast' ? credit.character : credit.job}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-400">
                                    {getYear(credit.release_date || credit.first_air_date || '')}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs text-slate-300">
                                      {formatRating(credit.vote_average)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Personal Details */}
                <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Known For</span>
                      <p className="text-slate-300">{person.known_for_department}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Gender</span>
                      <p className="text-slate-300">
                        {person.gender === 1
                          ? 'Female'
                          : person.gender === 2
                            ? 'Male'
                            : 'Not specified'}
                      </p>
                    </div>
                    {person.birthday && (
                      <div>
                        <span className="text-slate-400 text-sm">Birthday</span>
                        <p className="text-slate-300">
                          {tmdbApi.formatDate(person.birthday)}
                          {age && ` (${age} years old)`}
                        </p>
                      </div>
                    )}
                    {person.deathday && (
                      <div>
                        <span className="text-slate-400 text-sm">Day of Death</span>
                        <p className="text-slate-300">{tmdbApi.formatDate(person.deathday)}</p>
                      </div>
                    )}
                    {person.place_of_birth && (
                      <div>
                        <span className="text-slate-400 text-sm">Place of Birth</span>
                        <p className="text-slate-300">{person.place_of_birth}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Also Known As */}
                {person.also_known_as && person.also_known_as.length > 0 && (
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Also Known As</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {person.also_known_as.slice(0, 5).map((name, index) => (
                          <p key={index} className="text-slate-300 text-sm">
                            {name}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* External Links */}
                {externalIds && (
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">External Links</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {externalIds.imdb_id && (
                        <a
                          href={`https://www.imdb.com/name/${externalIds.imdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Film className="h-4 w-4" />
                          IMDb
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {externalIds.instagram_id && (
                        <a
                          href={`https://www.instagram.com/${externalIds.instagram_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Instagram
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {externalIds.twitter_id && (
                        <a
                          href={`https://www.twitter.com/${externalIds.twitter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Twitter
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Filmography Tab */}
          <TabsContent value="filmography" className="space-y-6">
            {/* Filters and Controls */}
            <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="movie">Movies</SelectItem>
                        <SelectItem value="tv">TV Shows</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setViewMode('grid');
                      }}
                      className="border-slate-600"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setViewMode('list');
                      }}
                      className="border-slate-600"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filmography Grid/List */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
                  : 'space-y-4'
              }
            >
              {filteredCredits
                .filter(credit => credit.vote_count > 100)
                .map(credit => (
                  <Link key={credit.credit_id} to={`/${credit.media_type}/${credit.id}`}>
                    {viewMode === 'grid' ? (
                      <div className="group cursor-pointer">
                        <div className="relative aspect-[2/3]">
                          <img
                            src={tmdbApi.getImageUrl(credit.poster_path, 'w342')}
                            alt={credit.title || credit.name || 'Unknown'}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2">
                              <h4 className="font-medium text-white text-sm line-clamp-2">
                                {credit.title || credit.name || 'Unknown'}
                              </h4>
                              <p className="text-xs text-slate-300 mt-1">
                                {credit.role_type === 'cast' ? credit.character : credit.job}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={`absolute top-2 right-2 text-xs ${
                              credit.media_type === 'movie' ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                          >
                            {credit.media_type === 'movie' ? 'Movie' : 'TV'}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                              {getYear(credit.release_date || credit.first_air_date || '')}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-slate-300">
                                {formatRating(credit.vote_average)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative w-16 h-24 flex-shrink-0">
                              <img
                                src={tmdbApi.getImageUrl(credit.poster_path, 'w342')}
                                alt={credit.title || credit.name || 'Unknown'}
                                className="w-full h-full object-cover rounded"
                                loading="lazy"
                              />
                              <Badge
                                className={`absolute top-1 right-1 text-xs ${
                                  credit.media_type === 'movie' ? 'bg-blue-500' : 'bg-purple-500'
                                }`}
                              >
                                {credit.media_type === 'movie' ? 'Movie' : 'TV'}
                              </Badge>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="min-w-0">
                                  <h4 className="font-medium text-white truncate">
                                    {credit.title || credit.name || 'Unknown'}
                                  </h4>
                                  <p className="text-sm text-slate-400">
                                    {getYear(credit.release_date || credit.first_air_date || '')}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-slate-300">
                                      {formatRating(credit.vote_average)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-purple-400 mb-2 truncate">
                                {credit.role_type === 'cast' ? credit.character : credit.job}
                              </p>
                              {credit.overview && (
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {credit.overview}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Link>
                ))}
            </div>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <p>Photo gallery would be loaded from TMDB person images API</p>
                  <p className="text-sm mt-2">
                    This would require additional API calls for person images
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Career Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Total Credits</h4>
                      <p className="text-slate-300">{allCredits.length}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Movies</h4>
                      <p className="text-slate-300">
                        {allCredits.filter(c => c.media_type === 'movie').length}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">TV Shows</h4>
                      <p className="text-slate-300">
                        {allCredits.filter(c => c.media_type === 'tv').length}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Average Rating</h4>
                      <p className="text-slate-300">
                        {allCredits.length > 0
                          ? (
                              allCredits.reduce((sum, c) => sum + c.vote_average, 0) /
                              allCredits.length
                            ).toFixed(1)
                          : 'N/A'}
                        /10
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Most Popular Work</h4>
                      <p className="text-slate-300">
                        {allCredits.length > 0
                          ? allCredits.sort((a, b) => b.popularity - a.popularity)[0].title ||
                            allCredits.sort((a, b) => b.popularity - a.popularity)[0].name ||
                            'Unknown'
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Professional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">
                        Primary Department
                      </h4>
                      <p className="text-slate-300">{person.known_for_department}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Popularity Score</h4>
                      <p className="text-slate-300">{Math.round(person.popularity)}</p>
                    </div>
                    {person.homepage && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">
                          Official Website
                        </h4>
                        <a
                          href={person.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {person.homepage}
                        </a>
                      </div>
                    )}
                    {externalIds?.imdb_id && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">IMDb ID</h4>
                        <p className="text-slate-300">{externalIds.imdb_id}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Career Timeline */}
            <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Career Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Acting Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Acting Career</h3>
                    <div className="space-y-4">
                      {Object.entries(
                        allCredits
                          .filter(
                            credit =>
                              credit.role_type === 'cast' &&
                              (credit.release_date || credit.first_credit_air_date),
                          )
                          .sort((a, b) => {
                            const aDate = a.release_date || a.first_credit_air_date || '0000';
                            const bDate = b.release_date || b.first_credit_air_date || '0000';
                            return bDate.localeCompare(aDate);
                          })
                          .reduce<Record<string, typeof allCredits>>((acc, credit) => {
                            const year = getYear(
                              credit.release_date || credit.first_credit_air_date || '',
                            );
                            acc[year] ||= [];
                            acc[year].push(credit);
                            return acc;
                          }, {}),
                      ).map(([year, credits]: [string, typeof allCredits]) => (
                        <div key={year} className="flex gap-4">
                          <div className="flex-shrink-0 w-16 text-right">
                            <span className="text-sm font-medium text-purple-400">{year}</span>
                          </div>
                          <div className="flex-shrink-0 w-px bg-slate-700 relative">
                            <div className="absolute -left-1 top-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="space-y-2">
                              {credits.map(credit => (
                                <div key={credit.credit_id} className="flex items-center gap-2">
                                  <h4 className="font-medium text-white">
                                    {credit.title || credit.name || 'Unknown'}
                                  </h4>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      credit.media_type === 'movie'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : 'bg-purple-500/20 text-purple-300'
                                    }`}
                                  >
                                    {credit.media_type === 'movie' ? 'Movie' : 'TV Show'}
                                  </Badge>
                                  <span className="text-sm text-slate-400">
                                    {credit.role_type === 'cast' ? credit.character : credit.job}
                                  </span>
                                  {credit.vote_average > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs text-slate-300">
                                        {formatRating(credit.vote_average)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Crew Timeline by Department */}
                  {(() => {
                    // Get unique departments from crew credits
                    const departments = Array.from(
                      new Set(
                        allCredits
                          .filter(credit => credit.role_type === 'crew')
                          .map(credit => credit.department),
                      ),
                    ).sort();

                    return departments.map(department => (
                      <div key={department}>
                        <h3 className="text-lg font-semibold text-white mb-4">{department}</h3>
                        <div className="space-y-4">
                          {Object.entries(
                            allCredits
                              .filter(
                                credit =>
                                  credit.role_type === 'crew' &&
                                  credit.department === department &&
                                  (credit.release_date || credit.first_credit_air_date),
                              )
                              .sort((a, b) => {
                                const aDate = a.release_date || a.first_credit_air_date || '0000';
                                const bDate = b.release_date || b.first_credit_air_date || '0000';
                                return bDate.localeCompare(aDate);
                              })
                              .reduce<Record<string, typeof allCredits>>((acc, credit) => {
                                const year = getYear(
                                  credit.release_date || credit.first_credit_air_date || '',
                                );
                                acc[year] ||= [];
                                acc[year].push(credit);
                                return acc;
                              }, {}),
                          ).map(([year, credits]: [string, typeof allCredits]) => (
                            <div key={year} className="flex gap-4">
                              <div className="flex-shrink-0 w-16 text-right">
                                <span className="text-sm font-medium text-purple-400">{year}</span>
                              </div>
                              <div className="flex-shrink-0 w-px bg-slate-700 relative">
                                <div className="absolute -left-1 top-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="space-y-2">
                                  {credits.map(credit => (
                                    <div key={credit.credit_id} className="flex items-center gap-2">
                                      <h4 className="font-medium text-white">
                                        {credit.title || credit.name || 'Unknown'}
                                      </h4>
                                      <Badge
                                        variant="secondary"
                                        className={`text-xs ${
                                          credit.media_type === 'movie'
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'bg-purple-500/20 text-purple-300'
                                        }`}
                                      >
                                        {credit.media_type === 'movie' ? 'Movie' : 'TV Show'}
                                      </Badge>
                                      <span className="text-sm text-slate-400">
                                        {credit.role_type === 'cast'
                                          ? credit.character
                                          : credit.job}
                                      </span>
                                      {credit.vote_average > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                          <span className="text-xs text-slate-300">
                                            {formatRating(credit.vote_average)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
