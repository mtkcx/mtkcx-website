import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Menu, X, Search, User, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CartButton from '@/components/CartButton';

interface SearchResult {
  id: string;
  name: string;
  name_ar?: string;
  name_he?: string;
  product_code: string;
  image_url: string;
  category?: {
    name: string;
    name_ar?: string;
    name_he?: string;
  } | null;
}
const Header = () => {
  const navigate = useNavigate();
  const {
    user,
    profile,
    isAdmin,
    signOut
  } = useAuth();
  const {
    currentLanguage,
    setLanguage,
    t,
    isRTL
  } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const languages = [{
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }, {
    code: 'ar',
    name: 'العربية',
    flag: '🇸🇦'
  }, {
    code: 'he',
    name: 'עברית',
    flag: '🇮🇱'
  }] as const;
  const navigationItems = [{
    key: 'nav.home',
    href: '/'
  }, {
    key: 'nav.products',
    href: '/products'
  }, {
    key: 'nav.courses',
    href: '/courses'
  }, 
  // Temporarily hidden - will be used later
  // {
  //   key: 'nav.wrapping',
  //   href: '/gallery'
  // }, 
  {
    key: 'nav.about',
    href: '/about'
  }, {
    key: 'nav.contact',
    href: '/contact'
  }];

  // Search products function
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          name_ar,
          name_he,
          product_code,
          image_url,
          product_categories!product_categories_product_id_fkey (
            categories!product_categories_category_id_fkey (
              name,
              name_ar,
              name_he
            )
          ),
          product_images!product_images_product_id_fkey (
            image_url,
            is_primary
          )
        `)
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,name_ar.ilike.%${query}%,name_he.ilike.%${query}%,product_code.ilike.%${query}%`)
        .limit(8);

      if (!error && productsData) {
        const transformedResults = productsData.map(product => {
          const primaryImage = product.product_images?.find(img => img.is_primary);
          const categoryData = product.product_categories?.[0]?.categories;
          
          return {
            id: product.id,
            name: product.name,
            name_ar: product.name_ar,
            name_he: product.name_he,
            product_code: product.product_code,
            image_url: primaryImage?.image_url || product.image_url || '/placeholder.svg',
            category: categoryData ? {
              name: categoryData.name,
              name_ar: categoryData.name_ar,
              name_he: categoryData.name_he
            } : null
          };
        });
        
        setSearchResults(transformedResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(value);
    }, 300);
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    navigate(`/products/${productId}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Handle form submit (Enter key or search button)
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setShowResults(false);
      setIsMenuOpen(false);
      window.scrollTo(0, 0);
    }
  };

  // Handle search without form event
  const handleSearchClick = () => {
    handleSearch();
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };

    if (showResults) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showResults]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full px-4 sm:px-6 py-2 sm:py-4">
        <div className="flex items-center justify-between w-full">
          {/* Logo - Left */}
          <div className="flex items-center">
            <Link to="/">
              <img 
                src="/lovable-uploads/28ead321-c3c4-47fe-90f1-4c9e71157479.png" 
                alt="MT KCx Logo" 
                className="h-24 sm:h-32 md:h-36 lg:h-40 w-auto"
                loading="eager"
                decoding="async"
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-8">
            <div className="flex items-center space-x-4">
              {navigationItems.map(item => <Link key={item.key} to={item.href} className="text-foreground hover:text-primary transition-colors font-medium py-2 rounded-md hover:bg-primary/5 px-3 whitespace-nowrap" onClick={() => window.scrollTo(0, 0)}>
                {t(item.key)}
              </Link>)}
            </div>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Cart Button */}
            <CartButton />
            
            {/* Authentication Controls */}
            {user ? <div className="relative group">
                <Button variant="ghost" size="lg" className="flex items-center space-x-2 px-2 sm:px-4 py-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">
                    {profile?.full_name || user.email?.split('@')[0] || 'Account'}
                  </span>
                </Button>
                <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[180px] z-50">
                  {isAdmin ? (
                    <Link to="/dashboard" className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg" onClick={() => window.scrollTo(0, 0)}>
                      <Settings className="w-4 h-4 mr-3" />
                      {t('auth.admin_dashboard')}
                    </Link>
                  ) : (
                    <Link to="/profile" className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg" onClick={() => window.scrollTo(0, 0)}>
                      <User className="w-4 h-4 mr-3" />
                      {t('auth.my_profile')}
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/my-orders" className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors" onClick={() => window.scrollTo(0, 0)}>
                      <ShoppingBag className="w-4 h-4 mr-3" />
                      My Orders
                    </Link>
                  )}
                  <button onClick={signOut} className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors last:rounded-b-lg">
                    <LogOut className="w-4 h-4 mr-3" />
                    {t('auth.sign_out')}
                  </button>
                </div>
              </div> : <Button variant="ghost" size="lg" onClick={() => { navigate('/auth'); window.scrollTo(0, 0); }} className="flex items-center space-x-2 px-2 sm:px-4 py-2">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">{t('auth.sign_in')}</span>
              </Button>}

            {/* Search Button */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="flex items-center space-x-2 px-2 sm:px-4 py-2"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                  <span className="hidden sm:inline text-sm">{t('common.search')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('common.search')}</DialogTitle>
                </DialogHeader>
                <div className="relative">
                  <form onSubmit={handleSearch} className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        className="flex-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                    <Button type="submit" disabled={!searchQuery.trim()}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                  
                  {/* Search Results Dropdown */}
                  {showResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                      {searchResults.length > 0 ? (
                        <div className="p-2">
                          <div className="text-sm text-muted-foreground mb-2 px-2">
                            Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                          </div>
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductSelect(product.id)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-accent rounded-lg transition-colors text-left"
                            >
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {currentLanguage === 'ar' ? (product.name_ar || product.name) :
                                   currentLanguage === 'he' ? (product.name_he || product.name) :
                                   product.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {product.product_code}
                                  {product.category && (
                                    <span className="ml-2">
                                      • {currentLanguage === 'ar' ? (product.category.name_ar || product.category.name) :
                                          currentLanguage === 'he' ? (product.category.name_he || product.category.name) :
                                          product.category.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                          {searchQuery.trim() && (
                            <div className="border-t border-border mt-2 pt-2">
                              <button
                                onClick={handleSearchClick}
                                className="w-full flex items-center justify-center space-x-2 p-3 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <Search className="h-4 w-4" />
                                <span className="text-sm">View all results for "{searchQuery}"</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : searchQuery.trim() && !isSearching ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <p className="text-sm">No products found for "{searchQuery}"</p>
                          <button
                            onClick={handleSearchClick}
                            className="mt-2 text-primary hover:underline text-sm"
                          >
                            Search anyway
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Language Dropdown */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                onMouseEnter={() => setIsLanguageDropdownOpen(true)}
                onMouseLeave={() => setIsLanguageDropdownOpen(false)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 min-w-[100px] sm:min-w-[120px]"
              >
                <Globe className="h-5 w-5" />
                <span className="flex items-center space-x-2">
                  <span className="text-lg">
                    {languages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                  <span className="hidden sm:inline font-medium text-sm">
                    {languages.find(lang => lang.code === currentLanguage)?.name}
                  </span>
                </span>
              </Button>
              <div className={`absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg transition-all duration-200 min-w-[160px] z-50 ${
                isLanguageDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              onMouseEnter={() => setIsLanguageDropdownOpen(true)}
              onMouseLeave={() => setIsLanguageDropdownOpen(false)}>
                 {languages.map(lang => 
                  <button 
                    key={lang.code} 
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLanguageDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center space-x-3 ${
                      currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="lg" className="px-3 py-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map(item => <Link key={item.key} to={item.href} className="text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}>
                      {t(item.key)}
                    </Link>)}
                  
                   {/* Mobile Auth */}
                   {user ? <>
                       {isAdmin ? (
                         <Link to="/dashboard" className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}>
                           <Settings className="w-4 h-4 mr-3" />
                           {t('auth.admin_dashboard')}
                         </Link>
                       ) : (
                         <Link to="/profile" className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}>
                           <User className="w-4 h-4 mr-3" />
                           {t('auth.my_profile')}
                         </Link>
                       )}
                       {!isAdmin && (
                         <Link to="/my-orders" className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border" onClick={() => { setIsMenuOpen(false); window.scrollTo(0, 0); }}>
                           <ShoppingBag className="w-4 h-4 mr-3" />
                           My Orders
                         </Link>
                       )}
                       <button onClick={() => {
                     setIsMenuOpen(false);
                     signOut();
                   }} className="flex items-center text-foreground hover:text-primary transition-colors font-medium py-3 px-2 border-b border-border w-full text-left">
                         <LogOut className="w-4 h-4 mr-3" />
                         {t('auth.sign_out')}
                       </button>
                     </> : <Button variant="ghost" onClick={() => {
                   setIsMenuOpen(false);
                   navigate('/auth');
                   window.scrollTo(0, 0);
                 }} className="justify-start py-3 px-2 border-b border-border">
                       <User className="w-4 h-4 mr-3" />
                       {t('auth.sign_in')}
                     </Button>}
                  
                  {/* Mobile Search */}
                  <Button 
                    variant="ghost" 
                    className="justify-start py-3 px-2 border-b border-border"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-5 w-5 mr-3" />
                    {t('common.search')}
                  </Button>
                  
                  {/* Mobile Language Selector */}
                  <div className="py-3 px-2 border-b border-border">
                    <div className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <Globe className="h-5 w-5 mr-3" />
                      {t('common.language')}
                    </div>
                    <div className="space-y-2">
                      {languages.map(lang => (
                        <button 
                          key={lang.code} 
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} 
                          className={`w-full text-left px-3 py-2 text-sm transition-colors rounded-md flex items-center space-x-3 ${
                            currentLanguage === lang.code ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;