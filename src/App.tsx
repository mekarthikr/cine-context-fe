/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search, User, Play, Star, Clock } from "lucide-react"
import { Button } from "./component/ui/button"
import { Card, CardContent } from "./component/ui/card"
import { Input } from "./component/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./component/ui/dropdown-menu"
import { Checkbox } from "./component/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./component/ui/select"
import { Badge } from "./component/ui/badge"
import { useEffect, useState, type ReactNode } from "react"

const API_KEY = '452777385104bb1696e163a7da57901f';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';


type TMDbMovie = {
  image: string
  year: ReactNode
  rating: ReactNode
  duration: ReactNode
  description: ReactNode
  tags: string[]
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
};

type TMDbMovies = {
  image: string
  tags: string[]
  id: number;
  title: string;
  backdrop_path: string | null;
};
type TMDbMoviea = {
  image: string
  tags: string[]
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  overview?: string;
};
export default function App() {
  const [featuredTitles, setFeaturedTitles] = useState<TMDbMovies[]>([]);
  const [movieCards, setMovieCards] = useState<TMDbMovie[]>([]);
  const [recommendations, setRecommendations] = useState<TMDbMoviea[]>([]);

  useEffect(() => {
    // Fetch popular movies for featured titles
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`)
      .then(response => response.json())
      .then(data => {
        const movies = (data.results as TMDbMovies[]).slice(0, 4).map(movie => ({
          id: movie.id,
          title: movie.title,
          image: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : '/placeholder.svg',
          tags: ['Popular', 'Trending'] // Placeholder tags
        }));
        setFeaturedTitles(movies as unknown as TMDbMovies[]);
      });
    
    fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`)
      .then(response => response.json())
      .then(data => {
        const movies = (data.results as TMDbMovie[]).slice(0, 6).map((movie) => ({
          id: movie.id,
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg',
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          rating: movie.vote_average,
          duration: 'N/A',
          tags: ['Drama', 'Action'],
          description: movie.overview
        }));
        setMovieCards(movies as unknown as TMDbMovie[]);
      });
    

    // Fetch upcoming movies for recommendations
    fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`)
      .then(response => response.json())
      .then(data => {
        const movies = (data.results as TMDbMoviea[]).slice(0, 3).map(movie => ({
          title: movie.title,
          image: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.svg',
          tags: ['Upcoming', 'New'] // Placeholder tags
        }));
        setRecommendations(movies as unknown as TMDbMoviea[]);
      });
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-br from-purple-500 to-pink-500"></div>
              <span className="text-xl font-bold">CineContext</span>
            </div>
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by emotion, theme, or title"
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem className="text-white hover:bg-slate-700">Profile</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700">Watchlist</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700">Settings</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-slate-700">Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Discover Stories That Feel Right
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Find the perfect movie or show for your mood or moment
          </p>
          <div className="mb-12">
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
                <SelectItem value="feeling-nostalgic" className="text-white hover:bg-slate-700">
                  you're feeling nostalgic
                </SelectItem>
                <SelectItem value="cant-sleep" className="text-white hover:bg-slate-700">
                  you can't sleep
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTitles.map((title) => (
              <Card
                key={title.id}
                className="bg-slate-800 border-slate-700 overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="relative">
                  <img src={title.image || "/placeholder.svg"} alt={title.title} className="w-full h-48 object-cover" />
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
              </Card>
            ))}
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Emotions</h4>
                <div className="space-y-2">
                  {["Happy", "Sad", "Anxious", "Inspired", "Nostalgic", "Hopeful"].map((emotion) => (
                    <div key={emotion} className="flex items-center space-x-2">
                      <Checkbox id={emotion} className="border-slate-600" />
                      <label htmlFor={emotion} className="text-sm text-slate-300">
                        {emotion}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Themes</h4>
                <div className="space-y-2">
                  {["Redemption", "Identity", "Rebellion", "Love", "Family", "Growth"].map((theme) => (
                    <div key={theme} className="flex items-center space-x-2">
                      <Checkbox id={theme} className="border-slate-600" />
                      <label htmlFor={theme} className="text-sm text-slate-300">
                        {theme}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Life Moments</h4>
                <div className="space-y-2">
                  {["Breakups", "Moving On", "Study Time", "Family Bonding", "New Beginnings"].map((moment) => (
                    <div key={moment} className="flex items-center space-x-2">
                      <Checkbox id={moment} className="border-slate-600" />
                      <label htmlFor={moment} className="text-sm text-slate-300">
                        {moment}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Character Arcs</h4>
                <div className="space-y-2">
                  {["Anti-Hero", "Chosen One", "Broken Genius", "Underdog", "Mentor"].map((arc) => (
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
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movieCards.map((movie) => (
                <Card
                  key={movie.id}
                  className="bg-slate-800 border-slate-700 overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="relative">
                    <img
                      src={movie.image || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white">{movie.title}</h3>
                      <span className="text-sm text-slate-400">{movie.year}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{movie.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{movie.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {movie.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended for You</h3>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded transition-colors"
                  >
                    <img
                      src={rec.image || "/placeholder.svg"}
                      alt={rec.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white mb-1">{rec.title}</h4>
                      <div className="flex flex-wrap gap-1">
                        {rec.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-slate-600 text-slate-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Trending Moods</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Cozy Vibes</span>
                    <span className="text-purple-400">↗ 24%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Self-Discovery</span>
                    <span className="text-purple-400">↗ 18%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Heartbreak Healing</span>
                    <span className="text-purple-400">↗ 15%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Adventure Calling</span>
                    <span className="text-purple-400">↗ 12%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
