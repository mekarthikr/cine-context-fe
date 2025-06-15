import { useState, useEffect } from 'react';
import { tmdbApi } from '@app/service/tmdb';
import type { TMDBImage } from '@app/types/tmdb';

interface TitleLogoProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
  className?: string;
  fallbackClassName?: string;
}

export const TitleLogo: React.FC<TitleLogoProps> = ({
  contentId,
  contentType,
  contentTitle,
  className = '',
  fallbackClassName = '',
}) => {
  const [logo, setLogo] = useState<TMDBImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        setError(false);

        const imagesResponse =
          contentType === 'movie'
            ? await tmdbApi.getMovieImages(contentId)
            : await tmdbApi.getTVShowImages(contentId);

        const bestLogo = tmdbApi.findBestLogo(imagesResponse.logos);

        setLogo(bestLogo);
      } catch (err) {
        console.error(`Error fetching ${contentType} logo:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (contentId && contentType) {
      fetchLogo();
    }
  }, [contentId, contentType]);

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-slate-700 rounded ${fallbackClassName}`}
        style={{ height: '120px' }}
      >
        <span className="sr-only">Loading logo...</span>
      </div>
    );
  }

  if (error || !logo) {
    return <h1 className={`font-bold text-white ${fallbackClassName}`}>{contentTitle}</h1>;
  }

  return (
    <div className={className}>
      <img
        src={tmdbApi.getLogoUrl(logo.file_path, 'w500') || '/placeholder.svg'}
        alt={`${contentTitle} logo`}
        className="max-w-full h-auto object-contain"
        style={{
          aspectRatio: logo.aspect_ratio,
          maxHeight: '120px', // Limit height to keep it reasonable
        }}
        onError={() => {
          setError(true);
        }}
      />
      <span className="sr-only">{contentTitle}</span>
    </div>
  );
};
