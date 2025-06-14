import { useState, useEffect, useRef, useCallback, type JSX } from 'react';
import { X, Play, Clock, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@app/ui/dialog';
import { Button } from '@app/ui/button';
import { tmdbApi, type TMDBVideo } from '@app/lib/tmdb';
import { cn } from '@app/lib/utils';

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

function SkeletonLoader({ className }: { className?: string }): JSX.Element {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)}>
      <div className="aspect-video w-full" />
    </div>
  );
}

function LazyImage({ src, alt, className, onLoad }: LazyImageProps): JSX.Element {
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
}

export function TrailerModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle,
}: TrailerModalProps) {
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

  const getEmbedUrl = (key: string) => `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;

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
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-red-400 mb-4 font-medium">{error}</p>
                  <Button
                    onClick={fetchVideos}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center bg-slate-800/30 rounded-xl p-8 border border-slate-700/30">
                  <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 font-medium">
                    No videos available for this content.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Video Player */}
                {selectedVideo && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-white">{selectedVideo.name}</h3>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getVideoTypeColor(selectedVideo.type)}`}
                        >
                          {getVideoTypeIcon(selectedVideo.type)}
                          <span>{selectedVideo.type}</span>
                        </span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-xl shadow-2xl">
                      <div className="relative pb-[56.25%] h-0">
                        <iframe
                          src={getEmbedUrl(selectedVideo.key)}
                          className="absolute top-0 left-0 w-full h-full rounded-xl"
                          allowFullScreen
                          title={selectedVideo.name}
                        ></iframe>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video List */}
                {videos.length > 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">More Videos</h3>
                      <span className="text-sm text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                        {videos.length} total
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map(video => (
                        <div
                          key={video.id}
                          className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                            selectedVideo?.id === video.id
                              ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/25 h-fit'
                              : 'hover:shadow-xl hover:shadow-black/50'
                          }`}
                          onClick={() => {
                            selectVideo(video);
                          }}
                          style={{ height: 'fit-content' }}
                        >
                          <div className="relative bg-slate-800/50 backdrop-blur-sm">
                            <div className="relative overflow-hidden">
                              <LazyImage
                                src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                alt={video.name}
                                className="w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                    <Play className="w-5 h-5 text-white ml-0.5" />
                                  </div>
                                </div>
                              </div>
                              {selectedVideo?.id === video.id && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </div>

                            <div className="p-3 space-y-2">
                              <div className="flex items-start justify-between space-x-2">
                                <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                                  {video.name}
                                </p>
                                <span
                                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getVideoTypeColor(video.type)}`}
                                >
                                  {getVideoTypeIcon(video.type)}
                                  <span>{video.type}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
