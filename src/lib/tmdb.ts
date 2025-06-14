import { config } from '../config';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Constants for logo and backdrop selection
const MIN_ASPECT_RATIO = 2;
const MAX_ASPECT_RATIO = 4;
const MAX_RANDOM_SELECTION = 3;

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
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  homepage?: string;
  imdb_id?: string;
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  spoken_languages?: TMDBSpokenLanguage[];
  genres?: TMDBGenre[];
  first_air_date: string;
  name: string;
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
  episode_run_time?: number[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
  type?: string;
  homepage?: string;
  in_production?: boolean;
  last_air_date?: string;
  networks?: TMDBNetwork[];
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  spoken_languages?: TMDBSpokenLanguage[];
  genres?: TMDBGenre[];
  created_by?: TMDBCreatedBy[];
  seasons?: TMDBSeason[];
  release_date?: string;
  title: string;
  // first_air_date?: string
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
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  also_known_as?: string[];
  homepage?: string | null;
  imdb_id?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBNetwork {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBCreatedBy {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TMDBSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TMDBCastMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface TMDBCrewMember {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBVideo {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBExternalIds {
  imdb_id: string | null;
  freebase_mid: string | null;
  freebase_id: string | null;
  tvdb_id: number | null;
  tvrage_id: number | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

export interface TMDBPersonCredits {
  cast: TMDBPersonCastCredit[];
  crew: TMDBPersonCrewCredit[];
}

export interface TMDBPersonCastCredit {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  character: string;
  credit_id: string;
  order?: number;
  media_type: 'movie' | 'tv';
  first_credit_air_date: string;
}

export interface TMDBPersonCrewCredit {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  credit_id: string;
  department: string;
  job: string;
  media_type: 'movie' | 'tv';
  first_credit_air_date: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBImagesResponse {
  id: number;
  backdrops: TMDBImage[];
  logos: TMDBImage[];
  posters: TMDBImage[];
}

class TMDBApi {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = config.TMDB_API_KEY;
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

  // Get movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return await this.fetchFromTMDB(`/movie/${movieId}`);
  }

  // Get TV show details
  async getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
    return await this.fetchFromTMDB(`/tv/${tvId}`);
  }

  // Get person details
  async getPersonDetails(personId: number): Promise<TMDBPerson> {
    return await this.fetchFromTMDB(`/person/${personId}`);
  }

  // Get movie credits
  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    return await this.fetchFromTMDB(`/movie/${movieId}/credits`);
  }

  // Get TV show credits
  async getTVShowCredits(tvId: number): Promise<TMDBCredits> {
    return await this.fetchFromTMDB(`/tv/${tvId}/credits`);
  }

  // Get person movie credits
  async getPersonMovieCredits(personId: number): Promise<TMDBPersonCredits> {
    return await this.fetchFromTMDB(`/person/${personId}/movie_credits`);
  }

  // Get person TV credits
  async getPersonTVCredits(personId: number): Promise<TMDBPersonCredits> {
    return await this.fetchFromTMDB(`/person/${personId}/tv_credits`);
  }

  // Get person combined credits
  async getPersonCombinedCredits(personId: number): Promise<TMDBPersonCredits> {
    return await this.fetchFromTMDB(`/person/${personId}/combined_credits`);
  }

  // Get movie videos (trailers, etc.)
  async getMovieVideos(movieId: number): Promise<TMDBVideosResponse> {
    return await this.fetchFromTMDB(`/movie/${movieId}/videos`);
  }

  // Get TV show videos
  async getTVShowVideos(tvId: number): Promise<TMDBVideosResponse> {
    return await this.fetchFromTMDB(`/tv/${tvId}/videos`);
  }

  // Get external IDs for a person
  async getPersonExternalIds(personId: number): Promise<TMDBExternalIds> {
    return await this.fetchFromTMDB(`/person/${personId}/external_ids`);
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

  // Get movie images
  async getMovieImages(movieId: number): Promise<TMDBImagesResponse> {
    return await this.fetchFromTMDB(`/movie/${movieId}/images?include_image_language=en,null`);
  }

  // Get TV show images
  async getTVShowImages(tvId: number): Promise<TMDBImagesResponse> {
    return await this.fetchFromTMDB(`/tv/${tvId}/images?include_image_language=en,null`);
  }

  // Get person images
  async getPersonImages(personId: number): Promise<{ id: number; profiles: TMDBImage[] }> {
    return await this.fetchFromTMDB(`/person/${personId}/images`);
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
      queryParams.append(key, value.toString());
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

  // Helper function to get logo URL
  getLogoUrl(
    path: string | null,
    size: 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original' = 'w300',
  ): string {
    if (!path) return '';
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Helper function to find best logo
  findBestLogo(logos: TMDBImage[]): TMDBImage | null {
    if (!logos || logos.length === 0) return null;

    // First, try to find English logos
    const englishLogos = logos.filter(logo => logo.iso_639_1 === 'en');

    if (englishLogos.length > 0) {
      // Sort by vote average and aspect ratio (prefer wider logos)
      return englishLogos.sort((a, b) => {
        // Prefer logos with good aspect ratio (between MIN_ASPECT_RATIO:1 and MAX_ASPECT_RATIO:1)
        const aRatioScore =
          a.aspect_ratio >= MIN_ASPECT_RATIO && a.aspect_ratio <= MAX_ASPECT_RATIO ? 1 : 0;
        const bRatioScore =
          b.aspect_ratio >= MIN_ASPECT_RATIO && b.aspect_ratio <= MAX_ASPECT_RATIO ? 1 : 0;

        if (aRatioScore !== bRatioScore) {
          return bRatioScore - aRatioScore;
        }

        // Then by vote average
        return b.vote_average - a.vote_average;
      })[0];
    }

    // If no English logos, try null language (usually means no text/universal)
    const nullLanguageLogos = logos.filter(logo => logo.iso_639_1 === null);

    if (nullLanguageLogos.length > 0) {
      return nullLanguageLogos.sort((a, b) => {
        const aRatioScore =
          a.aspect_ratio >= MIN_ASPECT_RATIO && a.aspect_ratio <= MAX_ASPECT_RATIO ? 1 : 0;
        const bRatioScore =
          b.aspect_ratio >= MIN_ASPECT_RATIO && b.aspect_ratio <= MAX_ASPECT_RATIO ? 1 : 0;

        if (aRatioScore !== bRatioScore) {
          return bRatioScore - aRatioScore;
        }

        return b.vote_average - a.vote_average;
      })[0];
    }

    // Fallback to any logo
    return logos.sort((a, b) => b.vote_average - a.vote_average)[0] || null;
  }

  // Helper function to find best backdrop with random selection
  findBestBackdrop(backdrops: TMDBImage[]): TMDBImage | null {
    if (!backdrops || backdrops.length === 0) return null;

    // First, try to find English backdrops
    const englishBackdrops = backdrops.filter(backdrop => backdrop.iso_639_1 === 'en');

    if (englishBackdrops.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * Math.min(MAX_RANDOM_SELECTION, englishBackdrops.length),
      );
      return englishBackdrops.sort((a, b) => b.width - a.width)[randomIndex];
    }

    // If no English backdrops, try null language
    const nullLanguageBackdrops = backdrops.filter(backdrop => backdrop.iso_639_1 === null);

    if (nullLanguageBackdrops.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * Math.min(MAX_RANDOM_SELECTION, nullLanguageBackdrops.length),
      );
      return nullLanguageBackdrops.sort((a, b) => b.width - a.width)[randomIndex];
    }

    // Try basic backdrops (no language specified)
    const basicBackdrops = backdrops.filter(backdrop => !backdrop.iso_639_1);

    if (basicBackdrops.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * Math.min(MAX_RANDOM_SELECTION, basicBackdrops.length),
      );
      return basicBackdrops.sort((a, b) => b.width - a.width)[randomIndex];
    }

    // Last resort: any backdrop
    const randomIndex = Math.floor(
      Math.random() * Math.min(MAX_RANDOM_SELECTION, backdrops.length),
    );
    return backdrops.sort((a, b) => b.width - a.width)[randomIndex] || null;
  }

  // Helper function to get YouTube trailer URL
  getYouTubeTrailerUrl(videos: TMDBVideo[]): string | null {
    if (!videos || videos.length === 0) return null;
    const trailers = videos.filter(video => video.type === 'Trailer');
    if (trailers.length === 0) return null;
    const sortedTrailers = [...trailers].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    return `https://www.youtube.com/watch?v=${sortedTrailers[0].key}`;
  }

  // Helper function to get YouTube embed URL
  getYouTubeEmbedUrl(videos: TMDBVideo[]): string | null {
    const trailerUrl = this.getYouTubeTrailerUrl(videos);
    if (!trailerUrl) return null;
    return trailerUrl.replace('watch?v=', 'embed/');
  }

  // Helper function to format runtime
  formatRuntime(minutes: number): string {
    if (!minutes) return 'TBA';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Helper function to format date
  formatDate(dateString: string): string {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
