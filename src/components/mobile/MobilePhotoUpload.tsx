import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  requiredAngles?: string[];
}

export const MobilePhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 8,
  requiredAngles = ['Front', 'Rear', 'Left Side', 'Right Side', 'Hood', 'Roof']
}) => {
  const { toast } = useToast();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoAngles, setPhotoAngles] = useState<{ [key: number]: string }>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
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

    const updatedPhotos = [...photos, ...newFiles];
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);

    toast({
      title: 'Photos Added',
      description: `${newFiles.length} photo(s) added successfully`
    });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
    
    // Remove angle assignment
    const updatedAngles = { ...photoAngles };
    delete updatedAngles[index];
    
    // Reindex remaining angles
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

  const status = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Upload Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Photo Instructions</h3>
          </div>
          <p className="text-sm text-blue-800">
            Take clear photos of your vehicle from all angles. Good lighting and multiple angles help us provide an accurate quote.
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Required Photos</span>
              <span className="text-blue-700">
                {requiredAngles.length - status.missing.length}/{requiredAngles.length}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          {status.missing.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-blue-700 font-medium">Still needed:</p>
              <div className="flex flex-wrap gap-1">
                {status.missing.map(angle => (
                  <Badge key={angle} variant="outline" className="text-xs bg-white">
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
        >
          <Camera className="h-4 w-4" />
          Take Photo
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>

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

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            Your Photos ({photos.length}/{maxPhotos})
            {status.completed && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => {
              const imageUrl = URL.createObjectURL(photo);
              const assignedAngle = photoAngles[index];
              const availableAngles = getAvailableAngles(index);
              
              return (
                <Card key={index} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={`Vehicle photo ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    {assignedAngle && (
                      <Badge 
                        className="absolute bottom-2 left-2 text-xs"
                        variant={requiredAngles.includes(assignedAngle) ? "default" : "secondary"}
                      >
                        {assignedAngle}
                      </Badge>
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
                      className="w-full text-xs border rounded px-2 py-1"
                    >
                      <option value="">Select angle...</option>
                      {availableAngles.map(angle => (
                        <option key={angle} value={angle}>{angle}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Summary */}
      {photos.length > 0 && (
        <Card className={`p-4 ${status.completed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-2">
            {status.completed ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Ready for Quote!</p>
                  <p className="text-sm text-green-700">
                    All required photos have been uploaded and labeled.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">
                    {status.missing.length} more photo{status.missing.length !== 1 ? 's' : ''} needed
                  </p>
                  <p className="text-sm text-yellow-700">
                    Add photos for: {status.missing.join(', ')}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};