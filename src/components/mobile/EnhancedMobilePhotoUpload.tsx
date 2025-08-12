import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X, CheckCircle, AlertCircle, ImageIcon, Maximize2, RotateCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CompressedPhoto {
  file: File;
  originalSize: number;
  compressedSize: number;
  preview: string;
}

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  requiredAngles?: string[];
  enableCompression?: boolean;
  compressionQuality?: number;
}

export const EnhancedMobilePhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 8,
  requiredAngles = ['Front', 'Rear', 'Left Side', 'Right Side', 'Hood', 'Roof'],
  enableCompression = true,
  compressionQuality = 0.8
}) => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<CompressedPhoto[]>([]);
  const [photoAngles, setPhotoAngles] = useState<{ [key: number]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewPhoto, setPreviewPhoto] = useState<CompressedPhoto | null>(null);
  const [galleryView, setGalleryView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Image compression utility
  const compressImage = async (file: File): Promise<CompressedPhoto> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1920px width/height)
        const maxDimension = 1920;
        let { width, height } = img;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                preview: URL.createObjectURL(blob)
              });
            }
          },
          'image/jpeg',
          compressionQuality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (photos.length + newFiles.length > maxPhotos) {
      toast({
        title: 'Too Many Photos',
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const processedPhotos: CompressedPhoto[] = [];
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        setUploadProgress(((i + 1) / newFiles.length) * 100);
        
        if (enableCompression) {
          const compressed = await compressImage(file);
          processedPhotos.push(compressed);
        } else {
          processedPhotos.push({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            preview: URL.createObjectURL(file)
          });
        }
      }

      const updatedPhotos = [...photos, ...processedPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos.map(p => p.file));

      const totalSaved = processedPhotos.reduce((acc, p) => acc + (p.originalSize - p.compressedSize), 0);
      
      toast({
        title: 'Photos Added',
        description: enableCompression 
          ? `${newFiles.length} photo(s) added, saved ${(totalSaved / 1024 / 1024).toFixed(1)}MB`
          : `${newFiles.length} photo(s) added successfully`
      });
    } catch (error) {
      toast({
        title: 'Upload Error',
        description: 'Failed to process some photos',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index];
    URL.revokeObjectURL(photoToRemove.preview);
    
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos.map(p => p.file));
    
    // Update angle assignments
    const updatedAngles = { ...photoAngles };
    delete updatedAngles[index];
    
    const reindexedAngles: { [key: number]: string } = {};
    Object.entries(updatedAngles).forEach(([oldIndex, angle]) => {
      const newIndex = parseInt(oldIndex) > index ? parseInt(oldIndex) - 1 : parseInt(oldIndex);
      reindexedAngles[newIndex] = angle;
    });
    
    setPhotoAngles(reindexedAngles);
  };

  const assignAngle = (photoIndex: number, angle: string) => {
    setPhotoAngles(prev => ({
      ...prev,
      [photoIndex]: angle
    }));
  };

  const getAvailableAngles = (currentIndex: number) => {
    const assignedAngles = Object.values(photoAngles);
    const currentAngle = photoAngles[currentIndex];
    
    return requiredAngles.filter(angle => 
      !assignedAngles.includes(angle) || angle === currentAngle
    );
  };

  const getCompletionStatus = () => {
    const assignedAngles = Object.values(photoAngles);
    const missing = requiredAngles.filter(angle => !assignedAngles.includes(angle));
    return {
      completed: missing.length === 0,
      missing,
      progress: ((requiredAngles.length - missing.length) / requiredAngles.length) * 100
    };
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Upload Instructions */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Photo Instructions</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Take clear photos of your vehicle from all angles. Photos are automatically optimized for faster uploads.
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Required Photos</span>
              <span className="text-muted-foreground">
                {requiredAngles.length - status.missing.length}/{requiredAngles.length}
              </span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

          {status.missing.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Still needed:</p>
              <div className="flex flex-wrap gap-1">
                {status.missing.map(angle => (
                  <Badge key={angle} variant="outline" className="text-xs">
                    {angle}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2"
          variant="outline"
          disabled={uploading}
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
          variant="outline"
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>

      {/* Gallery Toggle */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            Your Photos ({photos.length}/{maxPhotos})
            {status.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGalleryView(!galleryView)}
            className="flex items-center gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            {galleryView ? 'Grid' : 'Gallery'}
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing photos...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        </Card>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Photo Grid/Gallery */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className={galleryView ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
            {photos.map((photo, index) => {
              const assignedAngle = photoAngles[index];
              const availableAngles = getAvailableAngles(index);
              
              return (
                <Card key={index} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={photo.preview}
                      alt={`Vehicle photo ${index + 1}`}
                      className={`w-full object-cover cursor-pointer ${
                        galleryView ? 'h-48' : 'h-32'
                      }`}
                      onClick={() => setPreviewPhoto(photo)}
                    />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setPreviewPhoto(photo)}
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Angle Badge */}
                    {assignedAngle && (
                      <Badge 
                        className="absolute bottom-2 left-2 text-xs"
                        variant={requiredAngles.includes(assignedAngle) ? "default" : "secondary"}
                      >
                        {assignedAngle}
                      </Badge>
                    )}

                    {/* File Size Info */}
                    {enableCompression && (
                      <div className="absolute bottom-2 right-2">
                        <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                          {formatFileSize(photo.compressedSize)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Angle Assignment */}
                  <div className="p-3 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Assign View:
                    </label>
                    <select
                      value={assignedAngle || ''}
                      onChange={(e) => assignAngle(index, e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1 bg-background"
                    >
                      <option value="">Select angle...</option>
                      {availableAngles.map(angle => (
                        <option key={angle} value={angle}>{angle}</option>
                      ))}
                    </select>

                    {/* File Info */}
                    {enableCompression && photo.originalSize !== photo.compressedSize && (
                      <p className="text-xs text-muted-foreground">
                        Saved {formatFileSize(photo.originalSize - photo.compressedSize)} 
                        ({Math.round((1 - photo.compressedSize / photo.originalSize) * 100)}% smaller)
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Summary */}
      {photos.length > 0 && (
        <Card className={`p-4 ${status.completed ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'}`}>
          <div className="flex items-center gap-2">
            {status.completed ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Ready for Quote!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All required photos have been uploaded and labeled.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    {status.missing.length} more photo{status.missing.length !== 1 ? 's' : ''} needed
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Add photos for: {status.missing.join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Photo Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewPhoto && (
            <div className="space-y-4">
              <img
                src={previewPhoto.preview}
                alt="Photo preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Size: {formatFileSize(previewPhoto.compressedSize)}
                  {enableCompression && previewPhoto.originalSize !== previewPhoto.compressedSize && (
                    <span className="ml-2">
                      (Original: {formatFileSize(previewPhoto.originalSize)})
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};