'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Play, ImageIcon, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrimmedImage } from '@/components/properties/trimmed-image';

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
  const [showVideo, setShowVideo] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Sort by order ascending, but put cover image first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_cover) return -1;
    if (b.is_cover) return 1;
    return a.order - b.order;
  });

  // Start with cover image (which is now first after sorting)
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = sortedImages[selectedIndex];

  // Direction of the last change, so the photo number rolls up when going forward and down when going back
  const previousIndex = useRef(0);
  const direction: 1 | -1 = selectedIndex >= previousIndex.current ? 1 : -1;
  useEffect(() => {
    previousIndex.current = selectedIndex;
  }, [selectedIndex]);
  const total = sortedImages.length;

  const goTo = (index: number) => {
    if (index < 0 || index >= total) return;
    setSelectedIndex(index);
    setShowVideo(false);
  };
  const goToPreviousImage = () => goTo(selectedIndex - 1);
  const goToNextImage = () => goTo(selectedIndex + 1);

  // Keep the selected thumbnail visible in the strip
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[data-active="true"]');
    if (strip && active) {
      strip.scrollTo({
        left: active.offsetLeft - strip.clientWidth / 2 + active.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, showVideo]);

  // Lightbox: keyboard navigation and page scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setSelectedIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setSelectedIndex((i) => Math.min(total - 1, i + 1));
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, total]);

  // Swipe on touch screens
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) goToNextImage();
    else goToPreviousImage();
  };

  const glassButton =
    'flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-gray-900 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 disabled:pointer-events-none disabled:opacity-0';

  return (
    <div role="region" aria-label={`Galeria de imagens: ${title}`} className="space-y-3">
      {/* Main Image/Video Display */}
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)] sm:aspect-[16/10] lg:aspect-[16/8]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          {showVideo && videoUrl ? (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            >
              {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  title={`${title} - Video`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl.includes('vimeo.com') ? (
                <iframe
                  src={getVimeoEmbedUrl(videoUrl)}
                  title={`${title} - Video`}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoUrl} controls className="h-full w-full object-cover">
                  O seu navegador não suporta vídeos.
                </video>
              )}
            </motion.div>
          ) : selectedImage ? (
            <motion.button
              key={`image-${selectedIndex}`}
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Ver foto em ecrã inteiro"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 block cursor-zoom-in"
            >
              <TrimmedImage
                src={selectedImage.url}
                alt={title}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
              />
            </motion.button>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </AnimatePresence>

        {/* Soft gradients so the controls stay readable on any photo */}
        {!showVideo && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/45 to-transparent" />
          </>
        )}

        {/* Business Type Badge */}
        <div className="absolute left-5 top-5 z-10">
          <span className="rounded-full bg-yellow-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg">
            {businessTypeLabels[businessType] || businessType}
          </span>
        </div>

        {/* Photos / Video toggle */}
        {videoUrl && (
          <div className="absolute right-5 top-5 z-10 flex gap-1 rounded-full bg-white/85 p-1 shadow-lg backdrop-blur-md">
            <button
              onClick={() => setShowVideo(false)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !showVideo ? 'bg-yellow-500 text-white' : 'text-gray-800 hover:bg-white'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Fotos
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                showVideo ? 'bg-yellow-500 text-white' : 'text-gray-800 hover:bg-white'
              }`}
            >
              <Play className="h-4 w-4" />
              Vídeo
            </button>
          </div>
        )}

        {/* Navigation Arrows */}
        {!showVideo && total > 1 && (
          <>
            <button
              onClick={goToPreviousImage}
              disabled={selectedIndex === 0}
              aria-label="Imagem anterior"
              className={`${glassButton} absolute left-5 top-1/2 z-10 -translate-y-1/2`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextImage}
              disabled={selectedIndex === total - 1}
              aria-label="Próxima imagem"
              className={`${glassButton} absolute right-5 top-1/2 z-10 -translate-y-1/2`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Big photo number, bottom left: 01 /24 */}
        {!showVideo && total > 0 && (
          <p
            aria-label={`Imagem ${selectedIndex + 1} de ${total}`}
            className="pointer-events-none absolute bottom-5 left-6 z-10 select-none text-3xl font-light leading-none tracking-tight text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.45)] md:bottom-6 md:left-8 md:text-5xl"
          >
            <span className="inline-flex items-baseline gap-[0.25em]"><RollingNumber value={selectedIndex + 1} direction={direction} /><span>/{pad(total)}</span></span>
          </p>
        )}

        {/* Full screen */}
        {!showVideo && total > 0 && (
          <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
            <button
              onClick={() => setLightboxOpen(true)}
              className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-md transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            >
              <Expand className="h-4 w-4" />
              Ver todas
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {(total > 1 || videoUrl) && (
        <div
          ref={stripRef}
          className="scrollbar-hide flex snap-x gap-3 overflow-x-auto scroll-smooth px-1 py-2"
        >
          {/* Video Thumbnail */}
          {videoUrl && (
            <button
              onClick={() => setShowVideo(true)}
              aria-label="Ver vídeo do imóvel"
              aria-current={showVideo ? 'true' : undefined}
              data-active={showVideo}
              className={`relative h-[72px] w-24 flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-900 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 sm:h-20 sm:w-28 ${
                showVideo ? 'ring-2 ring-yellow-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500">
                  <Play className="ml-0.5 h-4 w-4 text-white" fill="white" />
                </span>
              </span>
              <span className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-medium text-white">Vídeo</span>
            </button>
          )}

          {sortedImages.map((image, index) => {
            const active = selectedIndex === index && !showVideo;
            return (
              <button
                key={image.id}
                onClick={() => goTo(index)}
                aria-label={`Ver imagem ${index + 1} de ${total}`}
                aria-current={active ? 'true' : undefined}
                data-active={active}
                className={`relative h-[72px] w-24 flex-shrink-0 snap-start overflow-hidden rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 sm:h-20 sm:w-28 ${
                  active ? 'ring-2 ring-yellow-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <TrimmedImage
                  src={image.url}
                  alt={`${title} - ${index + 1}`}
                  className="object-cover"
                  sizes="112px"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Full screen viewer */}
      <AnimatePresence>
        {lightboxOpen && selectedImage && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Fotografias: ${title}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[150] flex flex-col bg-black/95"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="flex items-center justify-between px-5 py-4 text-white" onClick={(e) => e.stopPropagation()}>
              <span className="text-2xl font-light tracking-tight text-white">
                <span className="inline-flex items-baseline gap-[0.25em]"><RollingNumber value={selectedIndex + 1} direction={direction} /><span>/{pad(total)}</span></span>
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                aria-label="Fechar"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-4 sm:px-8" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`lightbox-${selectedIndex}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="relative inline-flex max-h-full max-w-full"
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                >
                  {/* The photo keeps its own proportions, with rounded corners; the arrows sit on top of it */}
                  <TrimmedImage
                    natural
                    src={selectedImage.url}
                    alt={title}
                    className="block h-auto max-h-[calc(100vh-120px)] w-auto max-w-[calc(100vw-24px)] rounded-3xl object-contain shadow-2xl sm:max-w-[calc(100vw-96px)]"
                  />

                  {total > 1 && (
                    <>
                      <button
                        onClick={() => goTo(selectedIndex - 1)}
                        disabled={selectedIndex === 0}
                        aria-label="Imagem anterior"
                        className={`${glassButton} absolute left-4 top-1/2 -translate-y-1/2`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => goTo(selectedIndex + 1)}
                        disabled={selectedIndex === total - 1}
                        aria-label="Próxima imagem"
                        className={`${glassButton} absolute right-4 top-1/2 -translate-y-1/2`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 1 -> "01"
function pad(value: number): string {
  return String(value).padStart(2, '0');
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

/** Number that slides out upwards while the next one slides in from below */
function RollingNumber({ value, direction }: { value: number; direction: 1 | -1 }) {
  return (
    <span className="relative inline-block overflow-hidden" style={{ height: '1.08em' }} aria-hidden="true">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          variants={{
            enter: (d: number) => ({ y: d > 0 ? '105%' : '-105%' }),
            center: { y: '0%' },
            exit: (d: number) => ({ y: d > 0 ? '-105%' : '105%' }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="block"
        >
          {pad(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
