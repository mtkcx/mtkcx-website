import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Mic, 
  ScanLine, 
  Filter, 
  Star, 
  Clock, 
  TrendingUp, 
  Heart,
  ShoppingCart,
  Eye,
  X
} from 'lucide-react';
import { useVoiceCommands } from '@/hooks/useAdvancedFeatures';
import { useHaptics } from '@/hooks/useMobileFeatures';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  popularity: number;
}

interface EnhancedSearchProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onSearch: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  category?: string;
  priceRange?: [number, number];
  rating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: string;
}

export const EnhancedMobileSearch: React.FC<EnhancedSearchProps> = ({
  products,
  onProductSelect,
  onSearch
}) => {
  const { toast } = useToast();
  const { impact, selection } = useHaptics();
  const { isSupported: voiceSupported, isListening, startListening, stopListening } = useVoiceCommands();
  
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showBarcodeScan, setShowBarcodeScan] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Koch-Chemie shampoo',
    'tire shine',
    'microfiber cloths'
  ]);
  const [popularSearches] = useState<string[]>([
    'car wax',
    'interior cleaner',
    'polishing compound',
    'glass cleaner'
  ]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [quickActions, setQuickActions] = useState<QuickAction[]>([
    {
      id: 'cart',
      label: 'Cart',
      icon: <ShoppingCart className="h-4 w-4" />,
      action: () => window.dispatchEvent(new CustomEvent('open-cart')),
      badge: '3'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Heart className="h-4 w-4" />,
      action: () => setShowFilters(true),
      badge: favorites.size.toString()
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: <Clock className="h-4 w-4" />,
      action: () => setShowFilters(true)
    },
    {
      id: 'trending',
      label: 'Trending',
      icon: <TrendingUp className="h-4 w-4" />,
      action: () => setShowFilters(true)
    }
  ]);

  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  const handleVoiceSearch = useCallback(() => {
    if (!voiceSupported) {
      toast({
        title: 'Voice Search Unavailable',
        description: 'Voice recognition is not supported on this device',
        variant: 'destructive'
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      impact('light');
      startListening(
        (transcript) => {
          setQuery(transcript);
          addToRecentSearches(transcript);
          onSearch(transcript, filters);
          selection();
          
          toast({
            title: 'Voice Search',
            description: `Searching for: "${transcript}"`,
            duration: 2000
          });
        },
        (error) => {
          toast({
            title: 'Voice Search Error',
            description: error,
            variant: 'destructive'
          });
        }
      );
    }
  }, [voiceSupported, isListening, startListening, stopListening, filters, onSearch, impact, selection, toast]);

  const handleBarcodeSearch = useCallback(async () => {
    // Check if device supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: 'Camera Not Available',
        description: 'Barcode scanning requires camera access',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setShowBarcodeScan(true);
      impact('medium');
    } catch (error) {
      toast({
        title: 'Camera Access Denied',
        description: 'Please allow camera access to scan barcodes',
        variant: 'destructive'
      });
    }
  }, [impact, toast]);

  const addToRecentSearches = useCallback((searchTerm: string) => {
    setRecentSearches(prev => {
      const updated = [searchTerm, ...prev.filter(term => term !== searchTerm)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery);
      onSearch(searchQuery, filters);
      selection();
    }
  }, [addToRecentSearches, onSearch, filters, selection]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const updated = new Set(prev);
      if (updated.has(productId)) {
        updated.delete(productId);
      } else {
        updated.add(productId);
      }
      localStorage.setItem('favorites', JSON.stringify(Array.from(updated)));
      return updated;
    });
    impact('light');
  }, [impact]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    impact('medium');
    toast({
      title: 'Search History Cleared',
      duration: 1500
    });
  }, [impact, toast]);

  return (
    <div className="space-y-4">
      {/* Enhanced Search Bar */}
      <Card className="p-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products, brands, or codes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                className="pl-10 pr-4"
              />
            </div>
            
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size="sm"
              onClick={handleVoiceSearch}
              disabled={!voiceSupported}
              className="px-3"
            >
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBarcodeSearch}
              className="px-3"
            >
              <ScanLine className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  action.action();
                  selection();
                }}
                className="flex items-center gap-1 flex-shrink-0 relative"
              >
                {action.icon}
                <span className="text-xs">{action.label}</span>
                {action.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
                  >
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Search Suggestions */}
      {query === '' && (
        <Card className="p-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Recent Searches</h4>
              {recentSearches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery(search);
                    handleSearch(search);
                  }}
                  className="w-full justify-start text-left h-8"
                >
                  <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                  {search}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Popular Searches</h4>
              <div className="flex flex-wrap gap-1">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                      selection();
                    }}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Filters & Sorting</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'price', label: 'Price' },
                  { value: 'rating', label: 'Rating' },
                  { value: 'name', label: 'Name' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sortBy: option.value as 'name' | 'price' | 'rating' | 'popularity' }));
                      selection();
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, sortOrder: 'asc' }));
                    selection();
                  }}
                >
                  Ascending
                </Button>
                <Button
                  variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilters(prev => ({ ...prev, sortOrder: 'desc' }));
                    selection();
                  }}
                >
                  Descending
                </Button>
              </div>
            </div>

            {/* Apply Filters */}
            <Button
              onClick={() => {
                onSearch(query, filters);
                setShowFilters(false);
                impact('medium');
                toast({
                  title: 'Filters Applied',
                  duration: 1500
                });
              }}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Barcode Scanner Modal */}
      <Dialog open={showBarcodeScan} onOpenChange={setShowBarcodeScan}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Product Barcode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ScanLine className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Position barcode within the frame
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBarcodeScan(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Simulate barcode scan result
                  setQuery('KC-ABC123');
                  handleSearch('KC-ABC123');
                  setShowBarcodeScan(false);
                  impact('medium');
                  toast({
                    title: 'Barcode Scanned',
                    description: 'Product found: KC-ABC123',
                    duration: 2000
                  });
                }}
                className="flex-1"
              >
                Simulate Scan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};