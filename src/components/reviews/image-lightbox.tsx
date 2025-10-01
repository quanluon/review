"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageLightboxProps {
  images: Array<{ id: string; image_url: string }>;
  initialIndex?: number;
}

export function ImageLightbox({ images, initialIndex = 0 }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((img, index) => (
          <button
            key={img.id}
            type="button"
            onClick={() => handleOpen(index)}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image_url}
              alt={`Review image ${index + 1}`}
              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </div>
            {/* Image counter for multiple images */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}/{images.length}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="max-w-4xl w-full p-0 overflow-hidden bg-black/95"
          onKeyDown={handleKeyDown}
        >
          <div className="relative">
            {/* Main Image */}
            <div className="flex items-center justify-center min-h-[60vh] max-h-[80vh] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex].image_url}
                alt={`Review image ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                  onClick={handlePrevious}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-12 h-12"
                  onClick={handleNext}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </>
            )}

            {/* Image Counter & Close */}
            <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4">
              <div className="bg-black/50 text-white text-sm px-3 py-1.5 rounded-full">
                {currentIndex + 1} / {images.length}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                onClick={() => setOpen(false)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>

            {/* Keyboard hints */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <div className="inline-block bg-black/50 text-white text-xs px-4 py-2 rounded-full">
                  Use ← → arrow keys to navigate
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

