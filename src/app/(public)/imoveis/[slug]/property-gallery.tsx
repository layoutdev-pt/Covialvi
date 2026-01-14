'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building2, Play, ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyImage {
  id: string;
  url: string;
  is_cover: boolean;
  order: number;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  videoUrl: string | null;
  title: string;
  businessType: string;
}

const businessTypeLabels: Record<string, string> = {
  sale: 'Venda',
  rent: 'Arrendamento',
  transfer: 'Trespasse',
};

export function PropertyGallery({ images, videoUrl, title, businessType }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailStart, setThumbnailStart] = useState(0);
  
  const visibleThumbnails = 4;
  const sortedImages = [...images].sort((a, b) => b.order - a.order);
  const selectedImage = sortedImages[selectedIndex];

  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (direction === 'up' && thumbnailStart > 0) {
      setThumbnailStart(thumbnailStart - 1);
    } else if (direction === 'down' && thumbnailStart + visibleThumbnails < sortedImages.length) {
      setThumbnailStart(thumbnailStart + 1);
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setShowVideo(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Vertical Thumbnail Carousel */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {/* Scroll Up Button */}
          {sortedImages.length > visibleThumbnails && (
            <button
              onClick={() => scrollThumbnails('up')}
              disabled={thumbnailStart === 0}
              className="hidden lg:flex w-full h-8 items-center justify-center bg-secondary rounded-lg hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-2">
            {sortedImages.slice(thumbnailStart, thumbnailStart + visibleThumbnails).map((image, idx) => {
              const actualIndex = thumbnailStart + idx;
              return (
                <motion.button
                  key={image.id}
                  onClick={() => handleThumbnailClick(actualIndex)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-16 h-16 lg:w-full lg:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedIndex === actualIndex && !showVideo
                      ? 'border-yellow-500 ring-2 ring-yellow-500/20'
                      : 'border-transparent hover:border-yellow-500/50'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${title} - ${actualIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </motion.button>
              );
            })}
          </div>
          
          {/* Scroll Down Button */}
          {sortedImages.length > visibleThumbnails && (
            <button
              onClick={() => scrollThumbnails('down')}
              disabled={thumbnailStart + visibleThumbnails >= sortedImages.length}
              className="hidden lg:flex w-full h-8 items-center justify-center bg-secondary rounded-lg hover:bg-secondary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          
          {/* Video Thumbnail */}
          {videoUrl && (
            <motion.button
              onClick={() => setShowVideo(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-16 h-16 lg:w-full lg:h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all bg-gray-900 ${
                showVideo
                  ? 'border-yellow-500 ring-2 ring-yellow-500/20'
                  : 'border-transparent hover:border-yellow-500/50'
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
                </div>
              </div>
              <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white text-center font-medium">
                Vídeo
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Image/Video Display */}
      <div className="lg:col-span-11 order-1 lg:order-2">
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-secondary">
          <AnimatePresence mode="wait">
            {showVideo && videoUrl ? (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={getYouTubeEmbedUrl(videoUrl)}
                    title={`${title} - Video`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : videoUrl.includes('vimeo.com') ? (
                  <iframe
                    src={getVimeoEmbedUrl(videoUrl)}
                    title={`${title} - Video`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  >
                    O seu navegador não suporta vídeos.
                  </video>
                )}
              </motion.div>
            ) : selectedImage ? (
              <motion.div
                key={`image-${selectedIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <Image
                  src={selectedImage.url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 80vw"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </AnimatePresence>

          {/* Business Type Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white dark:bg-card px-4 py-2 rounded-full text-sm font-medium text-foreground shadow-lg">
              {businessTypeLabels[businessType] || businessType}
            </span>
          </div>

          {/* Toggle Buttons */}
          {videoUrl && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideo(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-lg ${
                  !showVideo
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground hover:bg-white dark:hover:bg-card'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Fotos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideo(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all shadow-lg ${
                  showVideo
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/90 dark:bg-card/90 backdrop-blur-sm text-foreground hover:bg-white dark:hover:bg-card'
                }`}
              >
                <Play className="h-4 w-4" />
                Vídeo
              </motion.button>
            </div>
          )}

          {/* Image Counter */}
          {!showVideo && sortedImages.length > 0 && (
            <div className="absolute bottom-4 right-4 z-10">
              <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedIndex + 1} / {sortedImages.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

function getVimeoEmbedUrl(url: string): string {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
}
