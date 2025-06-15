import { useState, useEffect, useRef } from 'react';
import { tmdbApi } from '@app/service/tmdb';
import type { TMDBImage } from '@app/types/tmdb';

interface LogoProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
  className?: string;
  fallbackClassName?: string;
  rootMargin?: string; // For intersection observer
  threshold?: number; // For intersection observer
  minWidth?: string; // Minimal width for the logo
}

export const Logo: React.FC<LogoProps> = ({
  contentId,
  contentType,
  contentTitle,
  className = '',
  fallbackClassName = '',
  rootMargin = '50px',
  threshold = 0.1,
  minWidth = '120px',
}) => {
  const [logo, setLogo] = useState<TMDBImage | null>(null);
  const [loading, setLoading] = useState(false); // Start as false since we're lazy loading
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  // Fetch logo only when component becomes visible
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        setError(false);

        const imagesResponse = await tmdbApi.getTVShowImages(contentId);
        const bestLogo = tmdbApi.findBestLogo(imagesResponse.logos);

        setLogo(bestLogo);
      } catch (err) {
        console.error('Error fetching show logo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when visible and we have a showId
    if (isVisible && contentId && !logo && !loading && !error) {
      fetchLogo();
    }
  }, [isVisible, contentId, logo, loading, error]);

  // Render placeholder when not visible yet
  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        className={`animate-pulse bg-slate-700 rounded ${fallbackClassName}`}
        style={{ height: '120px', minWidth }}
      >
        <span className="sr-only">Loading {contentTitle} logo...</span>
      </div>
    );
  }

  // Render loading state when fetching
  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`animate-pulse bg-slate-700 rounded ${fallbackClassName}`}
        style={{ height: '120px', minWidth }}
      >
        <span className="sr-only">Loading {contentTitle} logo...</span>
      </div>
    );
  }

  // Render fallback on error or no logo
  if (error || !logo) {
    return (
      <div ref={containerRef}>
        <h1 className={`font-bold text-white ${fallbackClassName}`}>{contentTitle}</h1>
      </div>
    );
  }

  // Render the actual logo
  return (
    <div ref={containerRef} className={className}>
      <img
        src={tmdbApi.getLogoUrl(logo.file_path, 'w500') || '/placeholder.svg'}
        alt={`${contentTitle} logo`}
        className="max-w-full h-auto object-contain"
        loading="lazy" // Native lazy loading as additional optimization
        style={{
          aspectRatio: logo.aspect_ratio,
          maxHeight: '120px',
          minWidth,
        }}
        onError={() => {
          setError(true);
        }}
      />
      <span className="sr-only">{contentTitle}</span>
    </div>
  );
};
