import httpClient from './http';
import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBPerson,
  TMDBCredits,
  TMDBPersonCredits,
  TMDBVideosResponse,
  TMDBExternalIds,
  TMDBResponse,
  TMDBImagesResponse,
  TMDBImage,
  TMDBGenre,
  TMDBVideo,
} from '../types/tmdb';
import { ApiError } from '@app/types/http';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Constants for logo and backdrop selection
const MIN_ASPECT_RATIO = 2;
const MAX_ASPECT_RATIO = 4;
const MAX_RANDOM_SELECTION = 3;

// Constants for image dimensions
const DEFAULT_POSTER_HEIGHT = 300;
const DEFAULT_POSTER_WIDTH = 200;
const DEFAULT_BACKDROP_HEIGHT = 800;
const DEFAULT_BACKDROP_WIDTH = 1200;

// Constants for time conversion
const MINUTES_PER_HOUR = 60;

// Constants for rating calculation
const RATING_MULTIPLIER = 10;

// Constants for HTTP status codes
const DEFAULT_ERROR_STATUS = 500;

export class TMDBApi {
  private readonly baseUrl: string;
  private readonly httpClient: typeof httpClient;

  constructor() {
    this.baseUrl = TMDB_BASE_URL;
    this.httpClient = httpClient;
  }

  private async fetchFromTMDB<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.httpClient.get<T>(`${this.baseUrl}${endpoint}`);
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || DEFAULT_ERROR_STATUS,
        error.response?.data?.message || 'Failed to fetch from TMDB',
        error.response?.data,
        error,
      );
    }
  }

  // Movie related methods
  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    return await this.fetchFromTMDB(`/movie/${movieId}`);
  }

  async getMovieCredits(movieId: number): Promise<TMDBCredits> {
    return await this.fetchFromTMDB(`/movie/${movieId}/credits`);
  }

  async getMovieVideos(movieId: number): Promise<TMDBVideosResponse> {
    return await this.fetchFromTMDB(`/movie/${movieId}/videos`);
  }

  async getMovieImages(movieId: number): Promise<TMDBImagesResponse> {
    return await this.fetchFromTMDB(`/movie/${movieId}/images?include_image_language=en,null`);
  }

  // TV Show related methods
  async getTVShowDetails(tvId: number): Promise<TMDBTVShow> {
    return await this.fetchFromTMDB(`/tv/${tvId}`);
  }

  async getTVShowCredits(tvId: number): Promise<TMDBCredits> {
    return await this.fetchFromTMDB(`/tv/${tvId}/credits`);
  }

  async getTVShowVideos(tvId: number): Promise<TMDBVideosResponse> {
    return await this.fetchFromTMDB(`/tv/${tvId}/videos`);
  }

  async getTVShowImages(tvId: number): Promise<TMDBImagesResponse> {
    return await this.fetchFromTMDB(`/tv/${tvId}/images?include_image_language=en,null`);
  }

  // Person related methods
  async getPersonDetails(personId: number): Promise<TMDBPerson> {
    return await this.fetchFromTMDB(`/person/${personId}`);
  }

  async getPersonMovieCredits(personId: number): Promise<TMDBPersonCredits> {
    return await this.fetchFromTMDB(`/person/${personId}/movie_credits`);
  }

  async getPersonTVCredits(personId: number): Promise<TMDBPersonCredits> {
    return await this.fetchFromTMDB(`/person/${personId}/tv_credits`);
  }

  async getPersonCombinedCredits(personId: number): Promise<TMDBPersonCredits> {
    return await this.fetchFromTMDB(`/person/${personId}/combined_credits`);
  }

  async getPersonExternalIds(personId: number): Promise<TMDBExternalIds> {
    return await this.fetchFromTMDB(`/person/${personId}/external_ids`);
  }

  async getPersonImages(personId: number): Promise<{ id: number; profiles: TMDBImage[] }> {
    return await this.fetchFromTMDB(`/person/${personId}/images`);
  }

  // Trending and popular content methods
  async getTrending(
    mediaType: 'movie' | 'tv' | 'all' = 'all',
    timeWindow: 'day' | 'week' = 'week',
  ): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
    return await this.fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
  }

  async getPopularMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/popular?page=${page}`);
  }

  async getPopularTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/popular?page=${page}`);
  }

  async getTopRatedMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/top_rated?page=${page}`);
  }

  async getTopRatedTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/top_rated?page=${page}`);
  }

  async getNowPlayingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/now_playing?page=${page}`);
  }

  async getUpcomingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    return await this.fetchFromTMDB(`/movie/upcoming?page=${page}`);
  }

  async getAiringTodayTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/airing_today?page=${page}`);
  }

  async getOnTheAirTVShows(page = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return await this.fetchFromTMDB(`/tv/on_the_air?page=${page}`);
  }

  async getTrendingPeople(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBPerson>> {
    return await this.fetchFromTMDB(`/trending/person/${timeWindow}`);
  }

  // Genre methods
  async getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
    return await this.fetchFromTMDB('/genre/movie/list');
  }

  async getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
    return await this.fetchFromTMDB('/genre/tv/list');
  }

  // Search methods
  async searchMulti(
    query: string,
    page = 1,
  ): Promise<TMDBResponse<TMDBMovie | TMDBTVShow | TMDBPerson>> {
    return await this.fetchFromTMDB(
      `/search/multi?query=${encodeURIComponent(query)}&page=${page}`,
    );
  }

  // Discovery methods
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

  // Helper methods for image URLs
  getImageUrl(
    path: string | null,
    size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500',
  ): string {
    const imagePath = path ?? '';
    if (imagePath.trim() === '') {
      return `/placeholder.svg?height=${DEFAULT_POSTER_HEIGHT}&width=${DEFAULT_POSTER_WIDTH}`;
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
  }

  getBackdropUrl(
    path: string | null,
    size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280',
  ): string {
    const imagePath = path ?? '';
    if (imagePath.trim() === '') {
      return `/placeholder.svg?height=${DEFAULT_BACKDROP_HEIGHT}&width=${DEFAULT_BACKDROP_WIDTH}`;
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
  }

  getLogoUrl(
    path: string | null,
    size: 'w45' | 'w92' | 'w154' | 'w185' | 'w300' | 'w500' | 'original' = 'w300',
  ): string {
    const imagePath = path ?? '';
    if (imagePath.trim() === '') {
      return '';
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
  }

  // Helper methods for finding best images
  findBestLogo(logos: TMDBImage[]): TMDBImage | null {
    if (!logos || logos.length === 0) return null;

    const englishLogos = logos.filter(logo => logo.iso_639_1 === 'en');
    if (englishLogos.length > 0) {
      return this.sortLogosByQuality(englishLogos)[0];
    }

    const nullLanguageLogos = logos.filter(logo => logo.iso_639_1 === null);
    if (nullLanguageLogos.length > 0) {
      return this.sortLogosByQuality(nullLanguageLogos)[0];
    }

    return this.sortLogosByQuality(logos)[0] || null;
  }

  findBestBackdrop(backdrops: TMDBImage[]): TMDBImage | null {
    if (!backdrops || backdrops.length === 0) return null;

    const englishBackdrops = backdrops.filter(backdrop => backdrop.iso_639_1 === 'en');
    if (englishBackdrops.length > 0) {
      return this.getRandomBackdrop(englishBackdrops);
    }

    const nullLanguageBackdrops = backdrops.filter(backdrop => backdrop.iso_639_1 === null);
    if (nullLanguageBackdrops.length > 0) {
      return this.getRandomBackdrop(nullLanguageBackdrops);
    }

    const basicBackdrops = backdrops.filter(backdrop => !backdrop.iso_639_1);
    if (basicBackdrops.length > 0) {
      return this.getRandomBackdrop(basicBackdrops);
    }

    return this.getRandomBackdrop(backdrops);
  }

  // Helper methods for video URLs
  getYouTubeTrailerUrl(videos: TMDBVideo[]): string | null {
    if (!videos || videos.length === 0) return null;
    const trailers = videos.filter(video => video.type === 'Trailer');
    if (trailers.length === 0) return null;
    const sortedTrailers = [...trailers].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
    return `https://www.youtube.com/watch?v=${sortedTrailers[0].key}`;
  }

  getYouTubeEmbedUrl(videos: TMDBVideo[]): string | null {
    const trailerUrl = this.getYouTubeTrailerUrl(videos);
    if (!trailerUrl) return null;
    return trailerUrl.replace('watch?v=', 'embed/');
  }

  // Helper methods for formatting
  formatRuntime(minutes: number): string {
    if (!minutes) return 'TBA';
    const hours = Math.floor(minutes / MINUTES_PER_HOUR);
    const mins = minutes % MINUTES_PER_HOUR;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Private helper methods
  private sortLogosByQuality(logos: TMDBImage[]): TMDBImage[] {
    return logos.sort((a, b) => {
      const aRatioScore =
        a.aspect_ratio >= MIN_ASPECT_RATIO && a.aspect_ratio <= MAX_ASPECT_RATIO ? 1 : 0;
      const bRatioScore =
        b.aspect_ratio >= MIN_ASPECT_RATIO && b.aspect_ratio <= MAX_ASPECT_RATIO ? 1 : 0;

      if (aRatioScore !== bRatioScore) {
        return bRatioScore - aRatioScore;
      }

      return b.vote_average - a.vote_average;
    });
  }

  private getRandomBackdrop(backdrops: TMDBImage[]): TMDBImage | null {
    if (!backdrops.length) return null;
    const randomIndex = Math.floor(
      Math.random() * Math.min(MAX_RANDOM_SELECTION, backdrops.length),
    );
    return backdrops.sort((a, b) => b.width - a.width)[randomIndex] || null;
  }
}

// Export a singleton instance
export const tmdbApi = new TMDBApi();

// Type guard helpers
export const isMovie = (item: TMDBMovie | TMDBTVShow): item is TMDBMovie =>
  'title' in item && 'release_date' in item;

export const isTVShow = (item: TMDBMovie | TMDBTVShow): item is TMDBTVShow =>
  'name' in item && 'first_air_date' in item;

// Utility functions
export const getTitle = (item: TMDBMovie | TMDBTVShow): string =>
  isMovie(item) ? item.title : item.name;

export const getReleaseDate = (item: TMDBMovie | TMDBTVShow): string =>
  isMovie(item) ? item.release_date : item.first_air_date;

export const formatRating = (rating: number): number =>
  Math.round(rating * RATING_MULTIPLIER) / RATING_MULTIPLIER;

export const getYear = (dateString: string): string => {
  if (!dateString) return 'TBA';
  return new Date(dateString).getFullYear().toString();
};
