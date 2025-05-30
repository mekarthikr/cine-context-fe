import { Search, User, Play, Star, Clock, Filter } from 'lucide-react';
// import { Button } from '../../ui/button';
// import { Card, CardContent } from '../../ui/card';
// import { Input } from '../../ui/input';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '../../ui/dropdown-menu';
// import { Checkbox } from '../../ui/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Input } from '../../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const API_KEY = '452777385104bb1696e163a7da57901f';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780';

type TMDbMovie = {
  image: string;
  year: ReactNode;
  rating: ReactNode;
  duration: ReactNode;
  description: ReactNode;
  tags: string[];
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
};

type TMDbMovies = {
  image: string;
  tags: string[];
  id: number;
  title: string;
  backdrop_path: string | null;
};

type TMDbMoviea = {
  image: string;
  tags: string[];
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
};

const SkeletonCard = () => (
  <Card className="bg-slate-800 border-slate-700 overflow-hidden">
    <div className="relative">
      <div className="w-full h-48 bg-slate-700 animate-pulse" />
    </div>
    <CardContent className="p-4">
      <div className="h-4 bg-slate-700 rounded animate-pulse mb-2" />
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-700 rounded animate-pulse" />
        <div className="h-5 w-16 bg-slate-700 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const MovieCardSkeleton = () => (
  <Card className="bg-slate-800 border-slate-700 overflow-hidden">
    <div className="relative">
      <div className="w-full h-80 bg-slate-700 animate-pulse" />
    </div>
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 bg-slate-700 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-slate-700 rounded animate-pulse w-12" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-4 bg-slate-700 rounded animate-pulse w-16" />
        <div className="h-4 bg-slate-700 rounded animate-pulse w-16" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-700 rounded animate-pulse w-full" />
        <div className="h-3 bg-slate-700 rounded animate-pulse w-4/5" />
        <div className="h-3 bg-slate-700 rounded animate-pulse w-3/5" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-slate-700 rounded animate-pulse" />
        <div className="h-5 w-16 bg-slate-700 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const RecommendationSkeleton = () => (
  <div className="flex gap-3 p-3">
    <div className="w-16 h-24 bg-slate-700 rounded animate-pulse" />
    <div className="flex-1">
      <div className="h-4 bg-slate-700 rounded animate-pulse mb-2 w-3/4" />
      <div className="flex gap-2">
        <div className="h-4 w-12 bg-slate-700 rounded animate-pulse" />
        <div className="h-4 w-12 bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

export default function Home() {
  const [featuredTitles, setFeaturedTitles] = useState<TMDbMovies[]>([]);
  const [movieCards, setMovieCards] = useState<TMDbMovie[]>([]);
  const [recommendations, setRecommendations] = useState<TMDbMoviea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch popular movies for featured titles
        const popularResponse = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`,
        );
        const popularData = await popularResponse.json();
        const featuredMovies = (popularData.results as TMDbMovies[]).slice(0, 4).map(movie => ({
          id: movie.id,
          title: movie.title,
          image: movie.backdrop_path
            ? `${IMAGE_BASE_URL}${movie.backdrop_path}`
            : '/placeholder.svg',
          tags: ['Popular', 'Trending'],
        }));
        setFeaturedTitles(featuredMovies as unknown as TMDbMovies[]);

        // Fetch top rated movies
        const topRatedResponse = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`,
        );
        const topRatedData = await topRatedResponse.json();
        const topMovies = (topRatedData.results as TMDbMovie[]).slice(0, 6).map(movie => ({
          id: movie.id,
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg',
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          rating: movie.vote_average,
          duration: '2h 15m',
          tags: ['Drama', 'Highly Rated'],
          description: movie.overview,
        }));
        setMovieCards(topMovies as unknown as TMDbMovie[]);

        // Fetch upcoming movies for recommendations
        const upcomingResponse = await fetch(
          `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`,
        );
        const upcomingData = await upcomingResponse.json();
        const upcomingMovies = (upcomingData.results as TMDbMoviea[]).slice(0, 4).map(movie => ({
          id: movie.id,
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg',
          tags: ['Upcoming', 'New'],
        }));
        setRecommendations(upcomingMovies as unknown as TMDbMoviea[]);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <div className="flex-1 max-w-2xl mx-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by emotion, theme, or title..."
                  className="pl-12 pr-4 py-3 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>
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
      <section className="py-20 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
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

          {/* Featured Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredTitles.map(title => (
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
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 rounded-full"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm rounded-2xl sticky top-24">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Filter className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Filters</h3>
                </div>

                {['Emotions', 'Themes', 'Life Moments', 'Character Arcs'].map((category, idx) => {
                  const items = [
                    ['Happy', 'Sad', 'Anxious', 'Inspired', 'Nostalgic', 'Hopeful'],
                    ['Redemption', 'Identity', 'Rebellion', 'Love', 'Family', 'Growth'],
                    ['Breakups', 'Moving On', 'Study Time', 'Family Bonding', 'New Beginnings'],
                    ['Anti-Hero', 'Chosen One', 'Broken Genius', 'Underdog', 'Mentor'],
                  ][idx];

                  return (
                    <div key={category} className="mb-8">
                      <h4 className="text-sm font-medium text-slate-300 mb-4 text-purple-300">
                        {category}
                      </h4>
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item} className="flex items-center space-x-3">
                            <Checkbox
                              id={item}
                              className="border-slate-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                            />
                            <label
                              htmlFor={item}
                              className="text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
                            >
                              {item}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Movie Cards */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Curated for You</h2>
              <p className="text-slate-400">Based on your preferences and mood</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)
                : movieCards.map(movie => (
                    <Card
                      key={movie.id}
                      style={{ padding: 0 }}
                      className="bg-slate-800/30 border-slate-700/30 overflow-hidden group cursor-pointer hover:scale-[1.02] hover:bg-slate-800/50 transition-all duration-300 rounded-2xl backdrop-blur-sm"
                    >
                      <div className="relative">
                        <div className="aspect-[2/3] overflow-hidden">
                          <img
                            src={movie.image || '/placeholder.svg'}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6" style={{ paddingTop: 1 }}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-white text-lg leading-tight">
                            {movie.title}
                          </h3>
                          <span className="text-sm text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                            {movie.year}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 mb-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-yellow-400 font-medium">
                              {Number(movie.rating).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{movie.duration}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 mb-4 leading-relaxed line-clamp-3">
                          {typeof movie.description === 'string' ? movie.description : ''}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {movie.tags.map(tag => (
                            <Badge
                              key={tag}
                              className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 rounded-full"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="lg:col-span-1">
            <Card
              style={{ paddingTop: 2, paddingBottom: 2 }}
              className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm rounded-2xl sticky top-24"
            >
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold text-white mb-6">Recommended</h3>
                <div className="space-y-4">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, i) => <RecommendationSkeleton key={i} />)
                    : recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex gap-4 cursor-pointer hover:bg-slate-700/30 p-3 rounded-xl transition-all duration-200"
                        >
                          <div className="w-16 h-24 overflow-hidden flex-shrink-0">
                            <img
                              src={rec.image || '/placeholder.svg'}
                              alt={rec.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-white mb-2 leading-tight">
                              {rec.title}
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {rec.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  className="bg-slate-600/50 text-slate-300 text-xs px-2 py-1 rounded-full"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                </div>

                <div className="mt-10">
                  <h3 className="text-xl font-semibold text-white mb-6">Trending Moods</h3>
                  <div className="space-y-4">
                    {[
                      { mood: 'Cozy Vibes', trend: '↗ 24%' },
                      { mood: 'Self-Discovery', trend: '↗ 18%' },
                      { mood: 'Heartbreak Healing', trend: '↗ 15%' },
                      { mood: 'Adventure Calling', trend: '↗ 12%' },
                    ].map(({ mood, trend }) => (
                      <div
                        key={mood}
                        className="flex justify-between items-center p-3 hover:bg-slate-700/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <span className="text-slate-300 text-sm">{mood}</span>
                        <span className="text-purple-400 text-sm font-medium">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
