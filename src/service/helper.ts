import type { TMDBMovie, TMDBTVShow, TMDBPerson } from '@app/types/tmdb';

export class HelperService {
  private static instance: HelperService;

  private readonly MAX_MOOD_TAGS = 3;

  private constructor() {}

  public static getInstance(): HelperService {
    HelperService.instance ||= new HelperService();
    return HelperService.instance;
  }

  // Type guards for content types
  isMovie(item: TMDBMovie | TMDBTVShow | TMDBPerson): item is TMDBMovie {
    return 'title' in item && 'release_date' in item;
  }

  isTVShow(item: TMDBMovie | TMDBTVShow | TMDBPerson): item is TMDBTVShow {
    return 'name' in item && 'first_air_date' in item;
  }

  isPerson(item: TMDBMovie | TMDBTVShow | TMDBPerson): item is TMDBPerson {
    return 'known_for_department' in item && 'profile_path' in item;
  }

  // Helper function to get mood tags for content
  getMoodTags(item: TMDBMovie | TMDBTVShow): string[] {
    const overview = item.overview.toLowerCase();
    const tags: string[] = [];

    if (overview.includes('love') || overview.includes('romance')) tags.push('Romance');
    if (overview.includes('family')) tags.push('Family');
    if (overview.includes('dark') || overview.includes('crime')) tags.push('Dark');
    if (overview.includes('comedy') || overview.includes('funny')) tags.push('Comedy');
    if (overview.includes('action') || overview.includes('fight')) tags.push('Action');
    if (overview.includes('mystery') || overview.includes('secret')) tags.push('Mystery');
    if (overview.includes('drama')) tags.push('Drama');
    if (overview.includes('adventure')) tags.push('Adventure');

    if (tags.length === 0) {
      if (this.isMovie(item)) {
        tags.push('Cinematic');
      } else {
        tags.push('Binge-worthy');
      }
    }

    return tags.slice(0, this.MAX_MOOD_TAGS);
  }

  // Helper function to map genre IDs to names
  mapGenreIdsToNames(genreIds: number[], genreMap: Map<number, string>): string[] {
    return genreIds.map(id => genreMap.get(id) || '').filter(Boolean);
  }

  // Helper function to get YouTube embed URL
  getEmbedUrl(key: string): string {
    return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
  }

  // Helper function to truncate text
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
}

// Export singleton instance
export const helperService = HelperService.getInstance();
