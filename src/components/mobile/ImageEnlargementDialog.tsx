import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageEnlargementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export const ImageEnlargementDialog: React.FC<ImageEnlargementDialogProps> = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  title = "Image" 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/70 text-white h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center p-4">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};