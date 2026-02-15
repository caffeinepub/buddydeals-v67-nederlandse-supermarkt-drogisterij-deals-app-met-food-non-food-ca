import { useState, useMemo } from 'react';
import { useSearchOffers, useGetFavoriteOffers } from '../hooks/useQueries';
import { useAutoRetryOffers } from '../hooks/useAutoRetryOffers';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import OfferCard from '../components/OfferCard';
import FilterSidebar from '../components/FilterSidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Heart, RefreshCw, Zap, Loader2, SlidersHorizontal } from 'lucide-react';
import { Supermarket, ProductCategory } from '../backend';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function OffersPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [searchText, setSearchText] = useState('');
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20]);
  const [activeTab, setActiveTab] = useState('all');
  const { cartItems } = useCart();

  const isAuthenticated = !!identity;

  const filters = useMemo(
    () => ({
      supermarket: selectedSupermarket || undefined,
      category: selectedCategory || undefined,
      brand: undefined,
    }),
    [selectedSupermarket, selectedCategory]
  );

  const { 
    offers: allOffers, 
    isLoading: offersLoading, 
    retryState,
    manualRefresh,
    isRefreshing 
  } = useAutoRetryOffers({ filters, maxRetries: 3, enabled: true });

  const { data: searchResults = [], isLoading: searchLoading } = useSearchOffers(searchText);
  const { data: favoriteOffers = [], isLoading: favoritesLoading } = useGetFavoriteOffers();

  const displayedOffers = searchText.length >= 2 ? searchResults : allOffers;
  
  const filteredOffers = displayedOffers.filter(offer => {
    const actionPrice = offer.originalPrice / 2;
    return actionPrice >= priceRange[0] && actionPrice <= priceRange[1];
  });

  const isLoading = searchText.length >= 2 ? searchLoading : offersLoading;

  const hasActiveFilters = selectedSupermarket !== null || selectedCategory !== null || priceRange[0] !== 0 || priceRange[1] !== 20;

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-6 supermarket-texture relative z-10">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            1+1 Gratis Aanbiedingen
          </h1>
          <p className="text-muted-foreground text-lg">
            Ontdek de beste deals van Albert Heijn, Jumbo en Lidl
          </p>
        </div>

        {/* Alert */}
        <Alert className="mb-6 border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-soft rounded-2xl animate-slide-up backdrop-blur-sm supermarket-card">
          <Zap className="h-5 w-5 text-primary" />
          <AlertDescription className="text-sm">
            <strong className="text-primary">Altijd actueel:</strong> Alle aanbiedingen worden automatisch opgehaald van www.ahfolder en www.lidlfolder.
          </AlertDescription>
        </Alert>

        {retryState.isRetrying && (
          <Alert className="mb-6 border-orange-500/30 bg-orange-500/10 shadow-soft rounded-2xl animate-slide-up backdrop-blur-sm supermarket-card">
            <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
            <AlertDescription className="text-sm">
              <strong className="text-orange-600 dark:text-orange-400">{retryState.message}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Search Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Zoek naar producten..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-12 h-12 rounded-xl border-border/50 supermarket-card"
            />
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 h-12 rounded-xl lg:hidden supermarket-card">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {(selectedSupermarket ? 1 : 0) + (selectedCategory ? 1 : 0) + (priceRange[0] !== 0 || priceRange[1] !== 20 ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <FilterSidebar
                  selectedSupermarket={selectedSupermarket}
                  selectedCategory={selectedCategory}
                  priceRange={priceRange}
                  onSupermarketChange={setSelectedSupermarket}
                  onCategoryChange={setSelectedCategory}
                  onPriceRangeChange={setPriceRange}
                />
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              onClick={manualRefresh}
              disabled={isRefreshing}
              title="Ververs aanbiedingen"
              className="h-12 w-12 rounded-xl supermarket-card"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="rounded-xl bg-muted/50 p-1 backdrop-blur-sm supermarket-card">
            <TabsTrigger value="all" className="rounded-lg">
              Alle Aanbiedingen
            </TabsTrigger>
            {isAuthenticated && userProfile && (
              <TabsTrigger value="favorites" className="gap-2 rounded-lg">
                <Heart className="h-4 w-4" />
                Favorieten
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="flex gap-6">
              {/* Desktop Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar
                    selectedSupermarket={selectedSupermarket}
                    selectedCategory={selectedCategory}
                    priceRange={priceRange}
                    onSupermarketChange={setSelectedSupermarket}
                    onCategoryChange={setSelectedCategory}
                    onPriceRangeChange={setPriceRange}
                  />
                </div>
              </aside>

              {/* Product Grid */}
              <div className="flex-1">
                {isLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-[420px] rounded-2xl bg-gradient-to-br from-muted/30 to-muted/60 animate-pulse backdrop-blur-sm" />
                    ))}
                  </div>
                ) : filteredOffers.length === 0 ? (
                  <div className="text-center py-20 animate-fade-in">
                    <div className="inline-block p-6 rounded-3xl bg-muted/30 mb-6 backdrop-blur-sm">
                      <Search className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      Geen aanbiedingen gevonden met de huidige filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredOffers.map((offer) => (
                      <OfferCard key={Number(offer.id)} offer={offer} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {isAuthenticated && userProfile && (
            <TabsContent value="favorites" className="mt-6">
              <div className="flex gap-6">
                <aside className="hidden lg:block w-64 flex-shrink-0">
                  <div className="sticky top-24">
                    <FilterSidebar
                      selectedSupermarket={selectedSupermarket}
                      selectedCategory={selectedCategory}
                      priceRange={priceRange}
                      onSupermarketChange={setSelectedSupermarket}
                      onCategoryChange={setSelectedCategory}
                      onPriceRangeChange={setPriceRange}
                    />
                  </div>
                </aside>

                <div className="flex-1">
                  {favoritesLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-[420px] rounded-2xl bg-gradient-to-br from-muted/30 to-muted/60 animate-pulse backdrop-blur-sm" />
                      ))}
                    </div>
                  ) : favoriteOffers.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in">
                      <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-6 backdrop-blur-sm">
                        <Heart className="h-16 w-16 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-3 text-lg">
                        Geen favoriete aanbiedingen gevonden.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {favoriteOffers.map((offer) => (
                        <OfferCard key={Number(offer.id)} offer={offer} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
