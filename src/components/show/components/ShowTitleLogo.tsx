import { useState, useEffect } from 'react';
import { tmdbApi } from '@app/service/tmdb';
import type { TMDBImage } from '@app/types/tmdb';

interface ShowTitleLogoProps {
  showId: number;
  showTitle: string;
  className?: string;
  fallbackClassName?: string;
}

export const ShowTitleLogo: React.FC<ShowTitleLogoProps> = ({
  showId,
  showTitle,
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

        const imagesResponse = await tmdbApi.getTVShowImages(showId);
        const bestLogo = tmdbApi.findBestLogo(imagesResponse.logos);

        setLogo(bestLogo);
      } catch (err) {
        console.error('Error fetching show logo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (showId) {
      fetchLogo();
    }
  }, [showId]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-slate-700 rounded ${fallbackClassName}`}>
        <span className="sr-only">Loading logo...</span>
      </div>
    );
  }

  if (error || !logo) {
    return <h1 className={`font-bold text-white ${fallbackClassName}`}>{showTitle}</h1>;
  }

  return (
    <div className={className}>
      <img
        src={tmdbApi.getLogoUrl(logo.file_path, 'w500') || '/placeholder.svg'}
        alt={`${showTitle} logo`}
        className="max-w-full h-auto object-contain"
        style={{
          aspectRatio: logo.aspect_ratio,
          maxHeight: '120px',
        }}
        onError={() => {
          setError(true);
        }}
      />
      <span className="sr-only">{showTitle}</span>
    </div>
  );
};
