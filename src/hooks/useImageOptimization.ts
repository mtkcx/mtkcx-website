import { useState, useCallback } from 'react';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface OptimizedImage {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dataUrl: string;
}

export const useImageOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);

  const optimizeImage = useCallback(
    async (
      file: File,
      options: ImageOptimizationOptions = {}
    ): Promise<OptimizedImage> => {
      const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        format = 'jpeg'
      } = options;

      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Apply image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'));
                return;
              }

              const optimizedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now()
              });

              const compressionRatio = 1 - (blob.size / file.size);
              const dataUrl = canvas.toDataURL(`image/${format}`, quality);

              resolve({
                file: optimizedFile,
                originalSize: file.size,
                optimizedSize: blob.size,
                compressionRatio,
                dataUrl
              });
            },
            `image/${format}`,
            quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const optimizeImages = useCallback(
    async (
      files: File[],
      options?: ImageOptimizationOptions
    ): Promise<OptimizedImage[]> => {
      setIsOptimizing(true);
      setProgress(0);

      try {
        const optimizedImages: OptimizedImage[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Only process image files
          if (!file.type.startsWith('image/')) {
            continue;
          }

          const optimized = await optimizeImage(file, options);
          optimizedImages.push(optimized);

          // Update progress
          setProgress(((i + 1) / files.length) * 100);
        }

        return optimizedImages;
      } finally {
        setIsOptimizing(false);
        setProgress(0);
      }
    },
    [optimizeImage]
  );

  const generateThumbnail = useCallback(
    async (
      file: File,
      size: number = 150
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        img.onload = () => {
          const { width, height } = img;
          const aspectRatio = width / height;

          let newWidth = size;
          let newHeight = size;

          if (aspectRatio > 1) {
            newHeight = size / aspectRatio;
          } else {
            newWidth = size * aspectRatio;
          }

          canvas.width = size;
          canvas.height = size;

          // Fill background with white
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);

          // Center the image
          const x = (size - newWidth) / 2;
          const y = (size - newHeight) / 2;

          ctx.drawImage(img, x, y, newWidth, newHeight);

          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.onerror = () => {
          reject(new Error('Failed to load image for thumbnail'));
        };

        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const calculateImageDimensions = useCallback(
    (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    optimizeImage,
    optimizeImages,
    generateThumbnail,
    calculateImageDimensions,
    formatFileSize,
    isOptimizing,
    progress
  };
};