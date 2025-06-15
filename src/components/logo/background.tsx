import { useState, useEffect } from 'react';
import { tmdbApi } from '@app/service/tmdb';
import type { TMDBImage } from '@app/types/tmdb';
import { cn } from '@app/service/utils';

interface BackgroundProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  className?: string;
  children?: React.ReactNode;
}

export const Background: React.FC<BackgroundProps> = ({
  contentId,
  contentType,
  className = '',
  children,
}) => {
  const [backdrop, setBackdrop] = useState<TMDBImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBackdrop = async () => {
      try {
        setLoading(true);
        setError(false);

        const imagesResponse = await tmdbApi.getTVShowImages(contentId);
        const bestBackdrop = tmdbApi.findBestBackdrop(imagesResponse.backdrops);

        setBackdrop(bestBackdrop);
      } catch (err) {
        console.error('Error fetching show backdrop:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchBackdrop();
    }
  }, [contentId]);

  if (loading) {
    return <div className={`bg-slate-800 animate-pulse ${className}`}>{children}</div>;
  }

  if (error || !backdrop) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 ${className}`}
        style={{
          backgroundImage: `url(/placeholder.svg?height=800&width=1200)`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full h-full', className)}
      style={{
        backgroundImage: `url(${tmdbApi.getBackdropUrl(backdrop.file_path, 'w1280')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  );
};
