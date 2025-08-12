import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ImageIcon, 
  Maximize2, 
  Download, 
  Share2, 
  Grid3X3, 
  List,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';

interface GalleryPhoto {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  date: Date;
  category: string;
  location?: string;
  tags: string[];
  size: number;
}

interface MobilePhotoGalleryProps {
  photos: GalleryPhoto[];
  categories?: string[];
  onPhotoSelect?: (photo: GalleryPhoto) => void;
  onPhotoShare?: (photo: GalleryPhoto) => void;
  onPhotoDownload?: (photo: GalleryPhoto) => void;
}

export const MobilePhotoGallery: React.FC<MobilePhotoGalleryProps> = ({
  photos,
  categories = ['All', 'Before', 'After', 'Process', 'Inspections'],
  onPhotoSelect,
  onPhotoShare,
  onPhotoDownload
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'size'>('date');

  const filteredPhotos = photos
    .filter(photo => selectedCategory === 'All' || photo.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.date.getTime() - a.date.getTime();
        case 'category':
          return a.category.localeCompare(b.category);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(1) + 'MB';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handlePhotoClick = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo);
    onPhotoSelect?.(photo);
  };

  const handleShare = async (photo: GalleryPhoto) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: `Check out this photo: ${photo.title}`,
          url: photo.url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
    onPhotoShare?.(photo);
  };

  const handleDownload = (photo: GalleryPhoto) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onPhotoDownload?.(photo);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="space-y-3">
        {/* View Toggle & Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'category' | 'size')}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="date">Sort by Date</option>
            <option value="category">Sort by Category</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex-shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Photos Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filteredPhotos.length} photos</span>
        <span>
          Total: {formatFileSize(filteredPhotos.reduce((acc, photo) => acc + photo.size, 0))}
        </span>
      </div>

      {/* Photo Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredPhotos.map(photo => (
            <Card key={photo.id} className="overflow-hidden cursor-pointer group">
              <div className="relative">
                <img
                  src={photo.thumbnail}
                  alt={photo.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  onClick={() => handlePhotoClick(photo)}
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePhotoClick(photo);
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(photo);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(photo);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Category Badge */}
                <Badge 
                  variant="secondary"
                  className="absolute top-2 left-2 text-xs"
                >
                  {photo.category}
                </Badge>

                {/* File Size */}
                <Badge 
                  variant="outline"
                  className="absolute top-2 right-2 text-xs bg-background/80 backdrop-blur-sm"
                >
                  {formatFileSize(photo.size)}
                </Badge>
              </div>
              
              <div className="p-2">
                <h4 className="font-medium text-sm truncate">{photo.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatDate(photo.date)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhotos.map(photo => (
            <Card key={photo.id} className="overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex gap-3 p-3" onClick={() => handlePhotoClick(photo)}>
                <img
                  src={photo.thumbnail}
                  alt={photo.title}
                  className="w-16 h-16 object-cover rounded flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{photo.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(photo.date)}</span>
                    <Badge variant="outline" className="text-xs">
                      {photo.category}
                    </Badge>
                  </div>
                  
                  {photo.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{photo.location}</span>
                    </div>
                  )}
                  
                  {photo.tags.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Tag className="h-3 w-3" />
                      <span>{photo.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(photo);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(photo);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredPhotos.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No photos found</h3>
          <p className="text-sm text-muted-foreground">
            {selectedCategory === 'All' 
              ? 'No photos have been uploaded yet.'
              : `No photos in the "${selectedCategory}" category.`
            }
          </p>
        </Card>
      )}

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{formatDate(selectedPhoto.date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p>{selectedPhoto.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p>{formatFileSize(selectedPhoto.size)}</p>
                </div>
                {selectedPhoto.location && (
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p>{selectedPhoto.location}</p>
                  </div>
                )}
              </div>
              
              {selectedPhoto.tags.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPhoto.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleShare(selectedPhoto)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedPhoto)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};