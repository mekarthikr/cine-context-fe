import { useState, useEffect } from 'react';
import {
  User,
  Play,
  Star,
  Clock,
  TrendingUp,
  ChevronRight,
  Flame,
  Eye,
  Heart,
  // Loader2,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Progress } from '../../ui/progress';
import {
  tmdbApi,
  type TMDBMovie,
  type TMDBTVShow,
  isMovie,
  getTitle,
  getReleaseDate,
  formatRating,
  getYear,
} from '../../lib/tmdb';
import { Link } from 'react-router';
import { SearchBar } from '../search/SearchBar';

interface ContentItem {
  id: number;
  title: string;
  type: 'movie' | 'show';
  image: string;
  backdropImage: string;
  year: string;
  rating: number;
  duration?: string;
  tags: string[];
  description: string;
  isNew?: boolean;
  isTrending?: boolean;
}

interface TrendingItem {
  id: number;
  title: string;
  type: 'movie' | 'show';
  image: string;
  rating: number;
  change: string;
  viewers: string;
}

interface PersonItem {
  id: number;
  name: string;
  image: string;
  role: string;
  knownFor: string;
  trending: boolean;
}

const moodCollections = [
  {
    id: 1,
    title: 'Rainy Day Comfort',
    description: 'Cozy stories for when you need warmth',
    image: 'src/assets/image/cozy.png',
    count: 24,
    color: 'from-sky-600 to-indigo-500', // cool, comforting rainy-day palette
  },
  {
    id: 2,
    title: 'Late Night Contemplation',
    description: 'Deep, thoughtful content for quiet hours',
    image: 'src/assets/image/night.png',
    count: 18,
    color: 'from-gray-800 to-blue-900', // deep, quiet tones of night
  },
  {
    id: 3,
    title: 'Weekend Binge',
    description: 'Series perfect for marathon viewing',
    image: 'src/assets/image/binge.png',
    count: 32,
    color: 'from-rose-500 to-amber-400', // warm, inviting binge-night energy
  },
  {
    id: 4,
    title: 'First Date Picks',
    description: 'Safe choices that spark conversation',
    image: 'src/assets/image/date.png',
    count: 15,
    color: 'from-pink-400 to-rose-500', // romantic and light-hearted tones
  },
];

const continueWatching = [
  {
    id: 1,
    title: 'The Bear',
    type: 'show' as const,
    image: '/placeholder.svg?height=120&width=80',
    progress: 65,
    episode: 'S3E4',
    timeLeft: '25 min left',
  },
  {
    id: 2,
    title: 'Succession',
    type: 'show' as const,
    image: '/placeholder.svg?height=120&width=80',
    progress: 80,
    episode: 'S4E8',
    timeLeft: '15 min left',
  },
  {
    id: 3,
    title: 'Atlanta',
    type: 'show' as const,
    image: '/placeholder.svg?height=120&width=80',
    progress: 30,
    episode: 'S2E3',
    timeLeft: '20 min left',
  },
];

// Mock mood tags mapping for content
const getMoodTags = (item: TMDBMovie | TMDBTVShow): string[] => {
  // const title = getTitle(item).toLowerCase();
  const overview = item.overview.toLowerCase();

  const tags: string[] = [];

  // Simple keyword-based mood tagging
  if (overview.includes('love') || overview.includes('romance')) tags.push('Romance');
  if (overview.includes('family')) tags.push('Family');
  if (overview.includes('dark') || overview.includes('crime')) tags.push('Dark');
  if (overview.includes('comedy') || overview.includes('funny')) tags.push('Comedy');
  if (overview.includes('action') || overview.includes('fight')) tags.push('Action');
  if (overview.includes('mystery') || overview.includes('secret')) tags.push('Mystery');
  if (overview.includes('drama')) tags.push('Drama');
  if (overview.includes('adventure')) tags.push('Adventure');

  // Default tags if none found
  if (tags.length === 0) {
    if (isMovie(item)) {
      tags.push('Cinematic');
    } else {
      tags.push('Binge-worthy');
    }
  }

  return tags.slice(0, 3); // Limit to 3 tags
};

export default function CineContextPage() {
  const [featuredContent, setFeaturedContent] = useState<ContentItem[]>([]);
  const [popularContent, setPopularContent] = useState<ContentItem[]>([]);
  const [trendingContent, setTrendingContent] = useState<TrendingItem[]>([]);
  const [newReleases, setNewReleases] = useState<ContentItem[]>([]);
  const [upcomingContent, setUpcomingContent] = useState<ContentItem[]>([]);
  const [featuredPeople, setFeaturedPeople] = useState<PersonItem[]>([]);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trending content for featured section
        const trendingResponse = await tmdbApi.getTrending('all', 'week');
        const featured = trendingResponse.results.slice(0, 4).map(
          (item): ContentItem => ({
            id: item.id,
            title: getTitle(item),
            type: isMovie(item) ? 'movie' : 'show',
            image: tmdbApi.getBackdropUrl(item.backdrop_path, 'w780'),
            backdropImage: tmdbApi.getBackdropUrl(item.backdrop_path, 'w1280'),
            year: getYear(getReleaseDate(item)),
            rating: formatRating(item.vote_average),
            tags: getMoodTags(item),
            description: item.overview.slice(0, 100) + '...',
            isTrending: true,
          }),
        );
        setFeaturedContent(featured);

        // Fetch popular movies and TV shows for main content
        const [popularMoviesResponse, popularTVResponse] = await Promise.all([
          tmdbApi.getPopularMovies(),
          tmdbApi.getPopularTVShows(),
        ]);

        const popularMovies = popularMoviesResponse.results.slice(0, 3).map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            duration: '120 min', // Default duration
            tags: getMoodTags(movie),
            description: movie.overview.slice(0, 150) + '...',
            isTrending: movie.popularity > 100,
          }),
        );

        const popularTV = popularTVResponse.results.slice(0, 3).map(
          (show): ContentItem => ({
            id: show.id,
            title: show.name,
            type: 'show',
            image: tmdbApi.getImageUrl(show.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(show.backdrop_path),
            year: getYear(show.first_air_date),
            rating: formatRating(show.vote_average),
            duration: 'Multiple seasons',
            tags: getMoodTags(show),
            description: show.overview.slice(0, 150) + '...',
            isTrending: show.popularity > 100,
          }),
        );

        setPopularContent([...popularMovies, ...popularTV]);

        // Fetch trending for trending section
        const trending = trendingResponse.results.slice(4, 7).map(
          (item): TrendingItem => ({
            id: item.id,
            title: getTitle(item),
            type: isMovie(item) ? 'movie' : 'show',
            image: tmdbApi.getBackdropUrl(item.backdrop_path, 'w300'),
            rating: formatRating(item.vote_average),
            change: '+' + Math.floor(Math.random() * 20 + 5) + '%',
            viewers: (Math.random() * 3 + 1).toFixed(1) + 'M',
          }),
        );
        setTrendingContent(trending);

        // Fetch now playing movies for new releases
        const nowPlayingResponse = await tmdbApi.getNowPlayingMovies();
        const newMovies = nowPlayingResponse.results.slice(0, 3).map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: getMoodTags(movie),
            description: movie.overview.slice(0, 100) + '...',
            isNew: true,
          }),
        );
        setNewReleases(newMovies);

        // Fetch upcoming movies
        const upcomingResponse = await tmdbApi.getUpcomingMovies();
        const upcoming = upcomingResponse.results.slice(0, 2).map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: getMoodTags(movie),
            description: movie.overview.slice(0, 100) + '...',
          }),
        );
        setUpcomingContent(upcoming);

        // Fetch trending people
        const peopleResponse = await tmdbApi.getTrendingPeople();
        const people = peopleResponse.results.slice(0, 3).map(
          (person): PersonItem => ({
            id: person.id,
            name: person.name,
            image: tmdbApi.getImageUrl(person.profile_path),
            role: person.known_for_department,
            knownFor:
              person.known_for
                ?.slice(0, 2)
                .map(item => getTitle(item))
                .join(', ') ?? '',
            trending: person.popularity > 50,
          }),
        );
        setFeaturedPeople(people);

        // Set recommendations (using top rated for now)
        const topRatedResponse = await tmdbApi.getTopRatedMovies();
        const recs = topRatedResponse.results.slice(0, 4).map(
          (movie): ContentItem => ({
            id: movie.id,
            title: movie.title,
            type: 'movie',
            image: tmdbApi.getImageUrl(movie.poster_path),
            backdropImage: tmdbApi.getBackdropUrl(movie.backdrop_path),
            year: getYear(movie.release_date),
            rating: formatRating(movie.vote_average),
            tags: getMoodTags(movie),
            description: movie.overview.slice(0, 100) + '...',
          }),
        );
        setRecommendations(recs);
      } catch (err) {
        console.error('Error fetching TMDB data:', err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/95 backdrop-blur-md"
        style={{ borderBottomWidth: 0 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                CineContext
              </span>
            </div>
            {/* <div className="flex-1 max-w-2xl mx-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by emotion, theme, or title..."
                  className="pl-12 pr-4 py-3 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div> */}
            <SearchBar className="flex-1 max-w-2xl mx-8" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-slate-800/50 rounded-xl"
                >
                  <User className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-800/95 backdrop-blur-md border-slate-700/50 rounded-xl"
              >
                <DropdownMenuItem className="text-white hover:bg-slate-700/50 rounded-lg">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700/50 rounded-lg">
                  Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700/50 rounded-lg">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700/50 rounded-lg">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
            Discover Stories
            <br />
            That Feel Right
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Find the perfect movie or show for your mood, moment, and mindset
          </p>
          <div className="mb-16">
            <Select>
              <SelectTrigger className="w-96 mx-auto bg-slate-800/50 border-slate-700/50 text-white h-14 rounded-xl text-lg backdrop-blur-sm">
                <SelectValue placeholder="What are you in the mood for..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800/95 backdrop-blur-md border-slate-700/50 rounded-xl">
                <SelectItem value="heartbroken" className="text-white hover:bg-slate-700/50 py-3">
                  💔 When you're heartbroken
                </SelectItem>
                <SelectItem value="raining" className="text-white hover:bg-slate-700/50 py-3">
                  🌧️ When it's raining outside
                </SelectItem>
                <SelectItem value="starting-over" className="text-white hover:bg-slate-700/50 py-3">
                  🌱 When you're starting over
                </SelectItem>
                <SelectItem
                  value="need-motivation"
                  className="text-white hover:bg-slate-700/50 py-3"
                >
                  💪 When you need motivation
                </SelectItem>
                <SelectItem
                  value="feeling-nostalgic"
                  className="text-white hover:bg-slate-700/50 py-3"
                >
                  🕰️ When feeling nostalgic
                </SelectItem>
                <SelectItem value="cant-sleep" className="text-white hover:bg-slate-700/50 py-3">
                  🌙 When you can't sleep
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Watch When Dropdown */}
          {/* <div className="mb-12">
            <Select>
              <SelectTrigger className="w-80 mx-auto bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Watch When..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="heartbroken" className="text-white hover:bg-slate-700">
                  you're heartbroken
                </SelectItem>
                <SelectItem value="raining" className="text-white hover:bg-slate-700">
                  it's raining
                </SelectItem>
                <SelectItem value="starting-over" className="text-white hover:bg-slate-700">
                  you're starting over
                </SelectItem>
                <SelectItem value="need-motivation" className="text-white hover:bg-slate-700">
                  you need motivation
                </SelectItem>
                <SelectItem value="binge-watching" className="text-white hover:bg-slate-700">
                  you want to binge-watch
                </SelectItem>
                <SelectItem value="cant-sleep" className="text-white hover:bg-slate-700">
                  you can't sleep
                </SelectItem>
                <SelectItem value="weekend-vibes" className="text-white hover:bg-slate-700">
                  it's weekend time
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Featured Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredContent.map(title => (
              <Link key={title.id} to={`/${title.type}/${title.id}`}>
                {/* <Card className="bg-slate-800 border-slate-700 overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
                  <div className="relative">
                    <img
                      src={title.image || "/placeholder.svg"}
                      alt={title.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-2">{title.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {title.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}
                <Card
                  key={title.id}
                  style={{ padding: 0 }}
                  className="bg-slate-800/30 border-slate-700/30 overflow-hidden group cursor-pointer hover:scale-105 hover:bg-slate-800/50 transition-all duration-300 rounded-2xl backdrop-blur-sm"
                >
                  <div className="relative">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={title.image || '/placeholder.svg'}
                        alt={title.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6" style={{ paddingTop: 0 }}>
                    <h3
                      className="font-semibold text-white mb-3 text-lg"
                      style={{ textAlign: 'start' }}
                    >
                      {title.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {title.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-purple-500/20 text-purple-300 text-xs"
                          // key={tag}
                          // className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
                className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded"
                    />
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

      {/* Trending Now Section */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              Trending Now
            </h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingContent.map(item => (
              <Link key={item.id} to={`/${item.type}/${item.id}`}>
                <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-slate-300">{item.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-400" />
                            <span className="text-green-400">{item.change}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-400">{item.viewers}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mood Collections */}
      <section className="py-8 px-4 bg-slate-900/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mood Collections</h2>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>

              {/* Content Type */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Content Type</h4>
                <div className="space-y-2">
                  {['Movies', 'TV Shows', 'Documentaries', 'Limited Series'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox id={type} className="border-slate-600" />
                      <label htmlFor={type} className="text-sm text-slate-300">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Emotions</h4>
                <div className="space-y-2">
                  {['Happy', 'Sad', 'Anxious', 'Inspired', 'Nostalgic', 'Hopeful'].map(emotion => (
                    <div key={emotion} className="flex items-center space-x-2">
                      <Checkbox id={emotion} className="border-slate-600" />
                      <label htmlFor={emotion} className="text-sm text-slate-300">
                        {emotion}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Themes */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Themes</h4>
                <div className="space-y-2">
                  {['Redemption', 'Identity', 'Rebellion', 'Love', 'Family', 'Growth'].map(
                    theme => (
                      <div key={theme} className="flex items-center space-x-2">
                        <Checkbox id={theme} className="border-slate-600" />
                        <label htmlFor={theme} className="text-sm text-slate-300">
                          {theme}
                        </label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Life Moments */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Life Moments</h4>
                <div className="space-y-2">
                  {['Breakups', 'Moving On', 'Study Time', 'Family Bonding', 'New Beginnings'].map(
                    moment => (
                      <div key={moment} className="flex items-center space-x-2">
                        <Checkbox id={moment} className="border-slate-600" />
                        <label htmlFor={moment} className="text-sm text-slate-300">
                          {moment}
                        </label>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Character Arcs */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Character Arcs</h4>
                <div className="space-y-2">
                  {['Anti-Hero', 'Chosen One', 'Broken Genius', 'Underdog', 'Mentor'].map(arc => (
                    <div key={arc} className="flex items-center space-x-2">
                      <Checkbox id={arc} className="border-slate-600" />
                      <label htmlFor={arc} className="text-sm text-slate-300">
                        {arc}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularContent.map(content => (
                <Link key={content.id} to={`/${content.type}/${content.id}`}>
                  <Card
                    style={{ padding: 0 }}
                    className="bg-slate-800 border-slate-700 overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="relative">
                      <img
                        src={content.image || '/placeholder.svg'}
                        alt={content.title}
                        // className="w-full h-64 object-cover"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute top-2 left-2 flex gap-2">
                        <Badge
                          className={`${content.type === 'show' ? 'bg-purple-500' : 'bg-blue-500'} text-white text-xs`}
                        >
                          {content.type === 'show' ? 'TV Show' : 'Movie'}
                        </Badge>
                        {content.isNew && (
                          <Badge className="bg-green-500 text-white text-xs">New</Badge>
                        )}
                        {content.isTrending && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            <Flame className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{content.title}</h3>
                        <span className="text-sm text-slate-400">{content.year}</span>
                      </div>

                      <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{content.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{content.duration}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-300 mb-3">{content.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {content.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Recommendations */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {recommendations.map(rec => (
                  <Link key={rec.id} to={`/${rec.type}/${rec.id}`}>
                    <div className="flex gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded transition-colors">
                      <div className="relative">
                        <img
                          src={rec.image || '/placeholder.svg'}
                          alt={rec.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                        <Badge
                          className={`absolute -top-1 -right-1 ${
                            rec.type === 'show' ? 'bg-purple-500' : 'bg-blue-500'
                          } text-white text-xs px-1 py-0`}
                        >
                          {rec.type === 'show' ? 'TV' : 'M'}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{rec.title}</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-slate-600 text-slate-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* New Releases */}
            <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">New Releases</h3>
              <div className="space-y-4">
                {newReleases.map(release => (
                  <Link key={release.id} to={`/${release.type}/${release.id}`}>
                    <div className="flex gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded transition-colors">
                      <img
                        src={release.image || '/placeholder.svg'}
                        alt={release.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{release.title}</h4>
                        <p className="text-xs text-slate-400 mb-1">{release.year}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-slate-300">{release.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Featured People */}
            <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Featured People</h3>
              <div className="space-y-4">
                {featuredPeople.map(person => (
                  <Link key={person.id} to={`/person/${person.id}`}>
                    <div className="flex gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded transition-colors">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={person.image || '/placeholder.svg'} alt={person.name} />
                        <AvatarFallback className="bg-purple-500 text-white">
                          {person.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{person.name}</h4>
                          {person.trending && (
                            <Badge className="bg-orange-500 text-white text-xs">Trending</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{person.role}</p>
                        <p className="text-xs text-purple-400">{person.knownFor}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Upcoming Releases */}
            <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Coming Soon</h3>
              <div className="space-y-4">
                {upcomingContent.map(upcoming => (
                  <Link key={upcoming.id} to={`/${upcoming.type}/${upcoming.id}`}>
                    <div className="flex gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded transition-colors">
                      <img
                        src={upcoming.image || '/placeholder.svg'}
                        alt={upcoming.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-1">{upcoming.title}</h4>
                        <p className="text-xs text-slate-400 mb-1">{upcoming.year}</p>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-red-400" />
                          <span className="text-xs text-slate-300">{upcoming.rating} rating</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Trending Moods */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trending Moods</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Binge-Worthy Series</span>
                  <span className="text-purple-400">↗ 28%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Cozy Movie Nights</span>
                  <span className="text-purple-400">↗ 24%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Self-Discovery</span>
                  <span className="text-purple-400">↗ 18%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Workplace Drama</span>
                  <span className="text-purple-400">↗ 15%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
