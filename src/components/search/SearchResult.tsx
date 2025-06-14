import React from 'react';
import { Link } from 'react-router';
import { tmdbApi } from '../../lib/tmdb';
import type { TMDBMovie, TMDBTVShow, TMDBPerson } from '../../lib/tmdb';
import { Card, CardContent } from '../../ui/card';

interface SearchResultProps {
  query: string;
}

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  profile_path?: string;
  media_type: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
  known_for?: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    media_type: 'movie' | 'tv';
  }>;
}

function isMovie(item: TMDBMovie | TMDBTVShow | TMDBPerson): item is TMDBMovie {
  return 'title' in item && 'release_date' in item;
}

function isTVShow(item: TMDBMovie | TMDBTVShow | TMDBPerson): item is TMDBTVShow {
  return 'name' in item && 'first_air_date' in item;
}

function isPerson(item: TMDBMovie | TMDBTVShow | TMDBPerson): item is TMDBPerson {
  return 'known_for_department' in item && 'profile_path' in item;
}

export default function SearchResult({ query }: SearchResultProps) {
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await tmdbApi.searchMulti(query);
        const filteredResults = data.results
          .filter(item => {
            if (isMovie(item)) {
              return !item.adult && item.poster_path;
            }
            if (isTVShow(item)) {
              return item.poster_path;
            }
            if (isPerson(item)) {
              return item.profile_path;
            }
            return false;
          })
          .map(item => {
            if (isMovie(item)) {
              return {
                id: item.id,
                title: item.title,
                overview: item.overview,
                poster_path: item.poster_path || '',
                media_type: 'movie' as const,
                release_date: item.release_date,
                vote_average: item.vote_average
              };
            }
            if (isTVShow(item)) {
              return {
                id: item.id,
                name: item.name,
                overview: item.overview,
                poster_path: item.poster_path || '',
                media_type: 'tv' as const,
                first_air_date: item.first_air_date,
                vote_average: item.vote_average
              };
            }
            if (isPerson(item)) {
              return {
                id: item.id,
                name: item.name,
                overview: item.biography || '',
                poster_path: '',
                profile_path: item.profile_path || '',
                media_type: 'person' as const,
                known_for_department: item.known_for_department,
                known_for: item.known_for?.map(work => {
                  if (isMovie(work)) {
                    return {
                      id: work.id,
                      title: work.title,
                      poster_path: work.poster_path || '',
                      media_type: 'movie' as const
                    };
                  }
                  return {
                    id: work.id,
                    name: work.name,
                    poster_path: work.poster_path || '',
                    media_type: 'tv' as const
                  };
                })
              };
            }
            throw new Error('Unexpected item type');
          })
          .slice(0, 10);
        setResults(filteredResults);
      } catch (err) {
        setError('Failed to fetch search results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query.trim()) {
      fetchResults();
    }
  }, [query]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (results.length === 0) return <div>No results found</div>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map(result => (
        <Link
          key={`${result.media_type}-${result.id}`}
          to={`/${result.media_type}/${result.id}`}
          className="block"
        >
          <Card className="overflow-hidden transition-transform hover:scale-105">
            <img
              src={`https://image.tmdb.org/t/p/w500${result.poster_path || result.profile_path}`}
              alt={result.title || result.name}
              className="h-48 w-full object-cover"
            />
            <CardContent className="p-4">
              <h3 className="font-semibold">{result.title || result.name}</h3>
              {result.media_type === 'person' && result.known_for_department && (
                <p className="text-sm text-muted-foreground">{result.known_for_department}</p>
              )}
              {result.media_type !== 'person' && result.vote_average && (
                <p className="text-sm text-muted-foreground">
                  Rating: {result.vote_average.toFixed(1)}/10
                </p>
              )}
              {result.media_type !== 'person' && (result.release_date || result.first_air_date) && (
                <p className="text-sm text-muted-foreground">
                  {new Date(result.release_date || result.first_air_date || '').getFullYear()}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
