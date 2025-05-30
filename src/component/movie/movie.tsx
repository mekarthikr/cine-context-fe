import { useState, useEffect } from "react"
import {Link, useParams} from "react-router"
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
  Award,
  Bookmark,
  ExternalLink,
  Loader2,
  Badge,
} from "lucide-react"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
// import type { Avatar, AvatarFallback } from "@radix-ui/react-avatar"
// import { Button } from "../../ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
// import { Avatar, AvatarFallback } from "../../ui/avatar"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
// import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Avatar, AvatarFallback } from "../../ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Button } from "../../ui/button"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// TMDB API Configuration
const TMDB_API_KEY = '452777385104bb1696e163a7da57901f'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

const movieData = {
  id: 1,
  title: "Eternal Sunshine of the Spotless Mind",
  year: 2004,
  runtime: 108,
  rating: 4.3,
  userRating: null,
  genres: ["Drama", "Romance", "Sci-Fi"],
  director: "Michel Gondry",
  writers: ["Charlie Kaufman", "Michel Gondry", "Pierre Bismuth"],
  synopsis:
    "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories forever. But it is only through the process of loss that they discover what they had to begin with.",
  fullSynopsis:
    "Joel Barish, heartbroken that his girlfriend underwent a procedure to erase him from her memory, decides to do the same. However, as he watches his memories of her fade away, he realises that he still loves her, and may be too late to correct his mistake. A story about memory, love, and the pain of letting go.",
  posterImage: "/placeholder.svg?height=600&width=400",
  backdropImage: "/placeholder.svg?height=800&width=1200",
  trailerUrl: "https://youtube.com/watch?v=trailer",
  releaseDate: "March 19, 2004",
  budget: "$20 million",
  boxOffice: "$74.0 million",
  language: "English",
  country: "USA",
  awards: ["Academy Award for Best Original Screenplay", "BAFTA Award for Best Editing"],
  moodTags: ["Melancholy", "Introspective", "Bittersweet", "Mind-bending", "Romantic"],
  watchProviders: ["Netflix", "Amazon Prime", "Hulu"],
  cast: [
    {
      id: 1,
      name: "Jim Carrey",
      character: "Joel Barish",
      image: "/placeholder.svg?height=200&width=150",
      knownFor: ["The Truman Show", "Dumb and Dumber"],
    },
    {
      id: 2,
      name: "Kate Winslet",
      character: "Clementine Kruczynski",
      image: "/placeholder.svg?height=200&width=150",
      knownFor: ["Titanic", "The Reader"],
    },
    {
      id: 3,
      name: "Kirsten Dunst",
      character: "Mary",
      image: "/placeholder.svg?height=200&width=150",
      knownFor: ["Spider-Man", "Marie Antoinette"],
    },
    {
      id: 4,
      name: "Mark Ruffalo",
      character: "Stan",
      image: "/placeholder.svg?height=200&width=150",
      knownFor: ["Avengers", "Spotlight"],
    },
    {
      id: 5,
      name: "Elijah Wood",
      character: "Patrick",
      image: "/placeholder.svg?height=200&width=150",
      knownFor: ["Lord of the Rings", "Sin City"],
    },
    {
      id: 6,
      name: "Tom Wilkinson",
      character: "Dr. Howard Mierzwiak",
      image: "/placeholder.svg?height=200&width=150",
      knownFor: ["The Full Monty", "Michael Clayton"],
    },
  ],
  crew: [
    { name: "Michel Gondry", role: "Director" },
    { name: "Charlie Kaufman", role: "Writer" },
    { name: "Anthony Bregman", role: "Producer" },
    { name: "Ellen Kuras", role: "Cinematographer" },
    { name: "Valdís Óskarsdóttir", role: "Editor" },
  ],
  reviews: [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      text: "A masterpiece that explores memory and love in the most beautiful way. Jim Carrey's performance is incredible.",
      date: "2024-01-15",
      helpful: 24,
    },
    {
      id: 2,
      author: "Mike R.",
      rating: 4,
      text: "Visually stunning and emotionally complex. The non-linear narrative keeps you engaged throughout.",
      date: "2024-01-10",
      helpful: 18,
    },
  ],
}


// Types for TMDB API responses
interface TMDBMovie {
  id: number
  title: string
  overview: string
  release_date: string
  runtime?: number
  vote_average: number
  vote_count: number
  genres: { id: number; name: string }[]
  poster_path: string
  backdrop_path: string
  production_countries: { name: string }[]
  spoken_languages: { english_name: string }[]
  budget: number
  revenue: number
  tagline: string
  status: string
}

interface TMDBCredits {
  cast: {
    id: number
    name: string
    character: string
    profile_path: string
    known_for_department: string
  }[]
  crew: {
    id: number
    name: string
    job: string
    department: string
    profile_path: string
  }[]
}

interface TMDBVideos {
  results: {
    id: string
    key: string
    name: string
    site: string
    type: string
    official: boolean
  }[]
}

interface TMDBReviews {
  results: {
    id: string
    author: string
    author_details: {
      rating?: number
      avatar_path?: string
    }
    content: string
    created_at: string
  }[]
}

interface TMDBWatchProviders {
  results: {
    [country: string]: {
      flatrate?: { provider_name: string; logo_path: string }[]
      rent?: { provider_name: string; logo_path: string }[]
      buy?: { provider_name: string; logo_path: string }[]
    }
  }
}

interface TMDBSimilarMovies {
  results: {
    id: number
    title: string
    poster_path: string
    release_date: string
    vote_average: number
    genre_ids: number[]
  }[]
}

// API Functions
const tmdbApi = {
  getMovie: async (movieId: string): Promise<TMDBMovie> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    )
    if (!response.ok) throw new Error('Failed to fetch movie details')
    return response.json()
  },

  getCredits: async (movieId: string): Promise<TMDBCredits> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
    )
    if (!response.ok) throw new Error('Failed to fetch credits')
    return response.json()
  },

  getVideos: async (movieId: string): Promise<TMDBVideos> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    )
    if (!response.ok) throw new Error('Failed to fetch videos')
    return response.json()
  },

  getReviews: async (movieId: string): Promise<TMDBReviews> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    )
    if (!response.ok) throw new Error('Failed to fetch reviews')
    return response.json()
  },

  getWatchProviders: async (movieId: string): Promise<TMDBWatchProviders> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/watch/providers?api_key=${TMDB_API_KEY}`
    )
    if (!response.ok) throw new Error('Failed to fetch watch providers')
    return response.json()
  },

  getSimilarMovies: async (movieId: string): Promise<TMDBSimilarMovies> => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    )
    if (!response.ok) throw new Error('Failed to fetch similar movies')
    return response.json()
  },
}

// Utility functions
const formatCurrency = (amount: number) => {
  if (amount === 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getImageUrl = (path: string, size: string = 'w500') => {
  if (!path) return '/placeholder.svg?height=600&width=400'
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

const getRating = (voteAverage: number) => {
  return Math.round(voteAverage * 10) / 10
}

// Generate mood tags based on genres
const generateMoodTags = (genres: { name: string }[]) => {
  const moodMap: { [key: string]: string[] } = {
    Drama: ['Emotional', 'Thought-provoking'],
    Romance: ['Romantic', 'Heartwarming'],
    'Science Fiction': ['Mind-bending', 'Futuristic'],
    Horror: ['Thrilling', 'Suspenseful'],
    Comedy: ['Light-hearted', 'Fun'],
    Action: ['Adrenaline-pumping', 'Exciting'],
    Thriller: ['Edge-of-your-seat', 'Intense'],
    Mystery: ['Intriguing', 'Puzzling'],
    Fantasy: ['Magical', 'Escapist'],
    Documentary: ['Educational', 'Eye-opening'],
  }

  const moods = new Set<string>()
  genres.forEach(genre => {
    const genreMoods = moodMap[genre.name] || []
    genreMoods.forEach(mood => moods.add(mood))
  })

  return Array.from(moods).slice(0, 5) // Limit to 5 mood tags
}

interface MovieDetailsPageProps {
  movieId?: string
}

export default function MovieDetailsPage() {
  // State
  const {movieId}=useParams()
  const [movie, setMovie] = useState<TMDBMovie | null>(null)
  const [credits, setCredits] = useState<TMDBCredits | null>(null)
  const [videos, setVideos] = useState<TMDBVideos | null>(null)
  const [reviews, setReviews] = useState<TMDBReviews | null>(null)
  const [watchProviders, setWatchProviders] = useState<TMDBWatchProviders | null>(null)
  const [similarMovies, setSimilarMovies] = useState<TMDBSimilarMovies | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [userRating, setUserRating] = useState(0)

const api=`https://api.themoviedb.org/3/movie/${movieId}/images?api_key=YOUR_API_KEY&include_image_language=en`


  // Load data on component mount
  useEffect(() => {
    const loadMovieData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load all movie data in parallel
        const [
          movieData,
          creditsData,
          videosData,
          reviewsData,
          watchProvidersData,
          similarMoviesData
        ] = await Promise.all([
          tmdbApi.getMovie(movieId),
          tmdbApi.getCredits(movieId),
          tmdbApi.getVideos(movieId),
          tmdbApi.getReviews(movieId),
          tmdbApi.getWatchProviders(movieId),
          tmdbApi.getSimilarMovies(movieId),
        ])

        setMovie(movieData)
        setCredits(creditsData)
        setVideos(videosData)
        setReviews(reviewsData)
        setWatchProviders(watchProvidersData)
        setSimilarMovies(similarMoviesData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadMovieData()
  }, [movieId])

  const handleRating = (rating: number) => {
    setUserRating(rating)
  }

  const getTrailerUrl = () => {
    const trailer = videos?.results.find(
      video => video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser') &&
      video.official
    )
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
  }

  const getDirector = () => {
    return credits?.crew.find(person => person.job === 'Director')?.name || 'N/A'
  }

  const getWriters = () => {
    const writers = credits?.crew.filter(person => 
      person.job === 'Writer' || person.job === 'Screenplay' || person.job === 'Story'
    ) || []
    return writers.map(writer => writer.name).slice(0, 3) // Limit to 3 writers
  }

  const getWatchProvidersList = () => {
    const countryProviders = watchProviders?.results?.US || watchProviders?.results?.IN || {}
    const providers = [
      ...(countryProviders.flatrate || []),
      ...(countryProviders.rent || []),
      ...(countryProviders.buy || [])
    ]
    
    // Remove duplicates
    const uniqueProviders = providers.filter((provider, index, self) => 
      index === self.findIndex(p => p.provider_name === provider.provider_name)
    )
    
    return uniqueProviders.slice(0, 6) // Limit to 6 providers
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading movie details...</span>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Movie</h1>
          <p className="text-slate-400">{error || 'Movie not found'}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const moodTags = generateMoodTags(movie.genres)
  const mainCast = credits?.cast.slice(0, 6) || []
  const keyCrewMembers = [
    { name: getDirector(), role: 'Director' },
    ...getWriters().map(writer => ({ name: writer, role: 'Writer' })),
    ...credits?.crew.filter(person => 
      ['Producer', 'Cinematographer', 'Editor', 'Music'].includes(person.job)
    ).slice(0, 4).map(person => ({ name: person.name, role: person.job })) || []
  ].slice(0, 8)

  // helpers/tmdb.ts
const getImageUrl = (path: string, size: string = 'original') =>
  `https://image.tmdb.org/t/p/${size}${path}`;

const fetchMovieLogo = async (movieId: number) => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${TMDB_API_KEY}&include_image_language=en,null`
  );
  const data = await res.json();
  const logo = data.logos?.[0]; // Pick the first logo
  return logo ? getImageUrl(logo.file_path, 'w500') : null;
};



  // useEffect(() => {
  // }, [movie.id]);
  // const loadLogo = async () => {
  //   const logo = await fetchMovieLogo(movie.id);
  //   setLogoUrl(logo);
  // };
  // loadLogo();
  // console.log(fetchMovieLogo(movieId))

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'w1280')})` }}
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
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
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
                  <CardTitle className="text-white text-lg">Similar Movies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {similarMovies?.results.slice(0, 4).map((item) => (
                    <Link key={item.id} to={`/movie/${item.id}`}>
                      <div className="flex gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <img
                          src={getImageUrl(item.poster_path, 'w92')}
                          alt={item.title}
                          className="w-12 h-18 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm truncate">{item.title}</h4>
                          <p className="text-xs text-slate-400">
                            {item.release_date ? new Date(item.release_date).getFullYear() : 'N/A'}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-slate-300">{getRating(item.vote_average)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Mood Tags */}
              <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Perfect For</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moodTags.map((mood, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">{mood}</span>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                        Match
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {/* Movie Header */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={getImageUrl(movie.poster_path, 'w500')}
                    alt={movie.title}
                    className="w-64 h-96 object-cover rounded-lg shadow-2xl mx-auto md:mx-0"
                  />
                  {/* <img
      src={logoUrl || getImageUrl(movie.poster_path, 'w500')}
      alt={movie.title}
      className="w-64 h-96 object-contain bg-white rounded-lg shadow-2xl mx-auto md:mx-0 p-4"
    /> */}
                </div>

                {/* Movie Info */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{movie.title}</h1>
                    {movie.tagline && (
                      <p className="text-lg text-slate-300 italic mb-4">"{movie.tagline}"</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-slate-300 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </span>
                      {movie.runtime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {movie.runtime} min
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {getRating(movie.vote_average)} ({movie.vote_count} votes)
                      </span>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map((genre) => (
                        <Badge key={genre.id} variant="secondary" className="bg-slate-700 text-slate-300">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>

                    {/* Mood Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {moodTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-purple-500/20 text-purple-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Synopsis */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                    <p className="text-slate-300 leading-relaxed">{movie.overview || 'No synopsis available.'}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {getTrailerUrl() && (
                      <Button 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        onClick={() => window.open(getTrailerUrl(), '_blank')}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Trailer
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className={`border-slate-600 ${isInWatchlist ? "bg-purple-500/20 border-purple-500 text-purple-300" : "text-slate-300"}`}
                      onClick={() => setIsInWatchlist(!isInWatchlist)}
                    >
                      {isInWatchlist ? (
                        <Bookmark className="h-4 w-4 mr-2 fill-current" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
                    </Button>
                    <Button
                      variant="outline"
                      className={`border-slate-600 ${isLiked ? "bg-red-500/20 border-red-500 text-red-300" : "text-slate-300"}`}
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {isLiked ? "Liked" : "Like"}
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
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleRating(star)} className="transition-colors">
                          <Star
                            className={`h-6 w-6 ${
                              star <= userRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-600 hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Where to Watch */}
                  {getWatchProvidersList().length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Where to Watch</h4>
                      <div className="flex flex-wrap gap-2">
                        {getWatchProvidersList().map((provider, index) => (
                          <Badge key={index} className="bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer">
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
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-500">
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 leading-relaxed">{movie.overview || 'No detailed overview available.'}</p>
                    </CardContent>
                  </Card>

                  {videos && videos.results.length > 0 && (
                    <Card className="bg-slate-900/80 backdrop-blur border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white">Videos & Trailers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {videos.results.slice(0, 4).map((video) => (
                            <div key={video.id} className="space-y-2">
                              <h4 className="font-medium text-white text-sm">{video.name}</h4>
                              <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                                {video.type}
                              </Badge>
                              {video.site === 'YouTube' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 text-slate-300"
                                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank')}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Watch
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
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
                        {mainCast.map((actor) => (
                          <div key={actor.id} className="text-center group cursor-pointer">
                            <div className="relative mb-2">
                              <img
                                src={getImageUrl(actor.profile_path, 'w185')}
                                alt={actor.name}
                                className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform"
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
                      <CardTitle className="text-white">Key Crew</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {keyCrewMembers.map((member, index) => (
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
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Release Date</h4>
                            <p className="text-slate-300">{formatDate(movie.release_date)}</p>
                          </div>
                          {movie.runtime && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-400 mb-1">Runtime</h4>
                              <p className="text-slate-300">{movie.runtime} minutes</p>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Languages</h4>
                            <p className="text-slate-300">
                              {movie.spoken_languages.map(lang => lang.english_name).join(', ') || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Country</h4>
                            <p className="text-slate-300">{movie.budget}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Budget</h4>
                            <p className="text-slate-300">{movie.budget}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Box Office</h4>
                            <p className="text-slate-300">{movie.budget}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Director</h4>
                            <p className="text-slate-300">{movie.revenue}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-1">Writers</h4>
                            <p className="text-slate-300">{movie.revenue}</p>
                          </div>
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
                    <CardContent className="space-y-6">
                      {movieData.reviews.map((review) => (
                        <div key={review.id} className="border-b border-slate-700 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-500 text-white text-sm">
                                  {review.author
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-white">{review.author}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-slate-400">{review.date}</span>
                          </div>
                          <p className="text-slate-300 mb-2">{review.text}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <button className="hover:text-white transition-colors">
                              👍 Helpful ({review.helpful})
                            </button>
                            <button className="hover:text-white transition-colors">Reply</button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
      )
}
