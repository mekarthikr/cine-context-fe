const TMDB_API_KEY = '452777385104bb1696e163a7da57901f';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  original_name: string;
  popularity: number;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: Array<TMDBMovie | TMDBTVShow>;
  popularity: number;
  adult: boolean;
  gender: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

class TMDBApi {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
  }

  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDB API fetch error:', error);
      throw error;
    }
  }

  // Get trending movies and TV shows
  async getTrending(
    mediaType: 'movie' | 'tv' | 'all' = 'all',
    timeWindow: 'day' | 'week' = 'week',
  ): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
    return await this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  }

  // Get popular movies
  async getPopularMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/popular?page=${page}`);
  }

  // Get popular TV shows
  async getPopularTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/popular?page=${page}`);
  }

  // Get top rated movies
  async getTopRatedMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/top_rated?page=${page}`);
  }

  // Get top rated TV shows
  async getTopRatedTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/top_rated?page=${page}`);
  }

  // Get now playing movies
  async getNowPlayingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/now_playing?page=${page}`);
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/upcoming?page=${page}`);
  }

  // Get airing today TV shows
  async getAiringTodayTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/airing_today?page=${page}`);
  }

  // Get on the air TV shows
  async getOnTheAirTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/on_the_air?page=${page}`);
  }

  // Get trending people
  async getTrendingPeople(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBPerson>> {
    return await this.fetchFromTMDB(`/trending/person/${timeWindow}`);
  }

  // Get movie genres
  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    return await this.fetchFromTMDB('/genre/movie/list');
  }

  // Get TV genres
  async getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
    return await this.fetchFromTMDB('/genre/tv/list');
  }

  // Search multi (movies, TV shows, people)
  async searchMulti(
    query: string,
    page = 1,
  ): Promise<TMDBResponse<TMDBMovie | TMDBTVShow | TMDBPerson>> {
    return await this.fetchFromTMDB(
      `/search/multi?query=${encodeURIComponent(query)}&page=${page}`,
    );
  }

  // Discover movies with filters
  async discoverMovies(
    params: {
      page?: number;
      genre?: string;
      year?: number;
      sort_by?: string;
      vote_average_gte?: number;
      vote_average_lte?: number;
    } = {},
  ): Promise<TMDBResponse<TMDBMovie>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return await this.fetchFromTMDB(`/discover/movie?${queryParams.toString()}`);
  }

  // Discover TV shows with filters
  async discoverTVShows(
    params: {
      page?: number;
      genre?: string;
      first_air_date_year?: number;
      sort_by?: string;
      vote_average_gte?: number;
      vote_average_lte?: number;
    } = {},
  ): Promise<TMDBResponse<TMDBTVShow>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    return await this.fetchFromTMDB(`/discover/tv?${queryParams.toString()}`);
  }

  // Helper function to get full image URL
  getImageUrl(
    path: string | null,
    size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500',
  ): string {
    if (!path) return '/placeholder.svg?height=300&width=200';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Helper function to get backdrop URL
  getBackdropUrl(
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280',
  ): string {
    if (!path) return '/placeholder.svg?height=800&width=1200';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }
}

export const tmdbApi = new TMDBApi();

// Helper function to determine if item is a movie
export const isMovie = (item: TMDBMovie | TMDBTVShow): item is TMDBMovie =>
  'title' in item && 'release_date' in item;

// Helper function to determine if item is a TV show
export const isTVShow = (item: TMDBMovie | TMDBTVShow): item is TMDBTVShow =>
  'name' in item && 'first_air_date' in item;

// Helper function to get title from movie or TV show
export const getTitle = (item: TMDBMovie | TMDBTVShow): string =>
  isMovie(item) ? item.title : item.name;

// Helper function to get release date from movie or TV show
export const getReleaseDate = (item: TMDBMovie | TMDBTVShow): string =>
  isMovie(item) ? item.release_date : item.first_air_date;

// Helper function to format rating
export const formatRating = (rating: number): number => Math.round(rating * 10) / 10;

// Helper function to get year from date string
export const getYear = (dateString: string): string => {
  if (!dateString) return 'TBA';
  return new Date(dateString).getFullYear().toString();
};
