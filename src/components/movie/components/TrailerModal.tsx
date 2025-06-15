import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@app/ui/dialog';
import { Button } from '@app/ui/button';
import { tmdbApi } from '@app/service/tmdb';
import type { TMDBVideo } from '@app/types/tmdb';
import { cn } from '@app/service/utils';
import { helperService } from '@app/service/helper';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
}

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)}>
    <div className="aspect-video w-full" />
  </div>
);

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, onLoad }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  return (
    <div ref={imgRef} className={`relative ${className || ''}`}>
      {/* Skeleton loader */}
      {!isLoaded && !hasError && <SkeletonLoader className="absolute inset-0" />}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-700/50 flex items-center justify-center">
          <div className="text-center">
            <X className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className || ''} transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle,
}) => {
  const [videos, setVideos] = useState<TMDBVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TMDBVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && contentId) {
      fetchVideos();
    }
  }, [isOpen, contentId, contentType]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        contentType === 'movie'
          ? await tmdbApi.getMovieVideos(contentId)
          : await tmdbApi.getTVShowVideos(contentId);

      // Filter for YouTube videos
      const youtubeVideos = response.results.filter(video => video.site === 'YouTube');
      setVideos(youtubeVideos);

      // Select the first trailer or teaser if available
      const trailer = youtubeVideos.find(video => video.type === 'Trailer') || youtubeVideos[0];
      setSelectedVideo(trailer || null);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectVideo = (video: TMDBVideo) => {
    setSelectedVideo(video);
  };

  const getVideoTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'trailer':
        return <Play className="w-3 h-3" />;
      case 'teaser':
        return <Clock className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  const getVideoTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'trailer':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'teaser':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'clip':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'featurette':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent
        className="sm:max-w-5xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 text-white max-h-[90vh] shadow-2xl flex flex-col"
        style={{
          backdropFilter: 'blur(20px)',
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        }}
        showCloseButton={false}
      >
        <div className="flex flex-col min-h-0 flex-1">
          <DialogHeader className="border-b border-slate-700/50 pb-4">
            <DialogTitle className="text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {contentTitle}
                  </h2>
                  <p className="text-sm text-slate-400 font-normal">Videos & Trailers</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="lg"
                onClick={onClose}
                className="hover:bg-slate-800/50 rounded-full p-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto min-h-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(100 116 139) transparent',
              msOverflowStyle: 'auto',
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                width: 6px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: rgb(100 116 139);
                border-radius: 3px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgb(148 163 184);
              }
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-700 animate-spin"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
                  </div>
                  <p className="text-slate-400 mt-4 font-medium">Loading videos...</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
                  <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Error Loading Videos</h3>
                  <p className="text-slate-400">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                    onClick={fetchVideos}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No Videos Available</h3>
                  <p className="text-slate-400">
                    There are no videos available for {contentTitle} at the moment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Selected Video */}
                {selectedVideo && (
                  <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={helperService.getEmbedUrl(selectedVideo.key)}
                      title={selectedVideo.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}

                {/* Video List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map(video => (
                    <button
                      key={video.id}
                      onClick={() => {
                        selectVideo(video);
                      }}
                      className={`group relative aspect-video rounded-lg overflow-hidden border ${
                        selectedVideo?.id === video.id
                          ? 'ring-2 ring-purple-500 border-purple-500/50'
                          : 'border-slate-700/50 hover:border-slate-600/50'
                      } transition-all duration-200`}
                    >
                      {/* Thumbnail */}
                      <LazyImage
                        src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                        alt={video.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getVideoTypeColor(
                                video.type,
                              )}`}
                            >
                              {getVideoTypeIcon(video.type)}
                              {video.type}
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-white line-clamp-2">
                            {video.name}
                          </h3>
                        </div>
                      </div>

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
