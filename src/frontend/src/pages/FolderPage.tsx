import { useMemo } from 'react';
import { useAutoRetryOffers } from '../hooks/useAutoRetryOffers';
import { FolderOffer, Supermarket } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Tag, Loader2, RefreshCw, Database } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { getImageProps } from '../lib/imageUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

const supermarketLabels: Record<Supermarket, string> = {
  [Supermarket.albertHeijn]: 'Albert Heijn',
  [Supermarket.jumbo]: 'Jumbo',
  [Supermarket.lidl]: 'Lidl',
  [Supermarket.dekamarkt]: 'Dekamarkt',
  [Supermarket.aldi]: 'Aldi',
  [Supermarket.spar]: 'Spar',
  [Supermarket.dirk]: 'Dirk',
  [Supermarket.deen]: 'Deen',
};

const supermarketLogos: Record<Supermarket, string> = {
  [Supermarket.albertHeijn]: '/assets/generated/albert-heijn-logo.dim_200x200.png',
  [Supermarket.jumbo]: '/assets/generated/jumbo-logo.dim_200x200.png',
  [Supermarket.lidl]: '/assets/generated/lidl-logo.dim_200x200.png',
  [Supermarket.dekamarkt]: '/assets/generated/dekamarkt-logo.dim_200x200.png',
  [Supermarket.aldi]: '/assets/generated/aldi-logo.dim_200x200.png',
  [Supermarket.spar]: '/assets/generated/spar-logo.dim_200x200.png',
  [Supermarket.dirk]: '/assets/generated/dirk-logo.dim_200x200.png',
  [Supermarket.deen]: '/assets/generated/deen-logo.dim_200x200.png',
};

const folderEndpoints: Record<Supermarket, string> = {
  [Supermarket.albertHeijn]: 'www.ahfolder',
  [Supermarket.jumbo]: 'www.jumbofolder',
  [Supermarket.lidl]: 'www.lidlfolder',
  [Supermarket.dekamarkt]: 'www.dekamarktfolder',
  [Supermarket.aldi]: 'www.aldi-folder',
  [Supermarket.spar]: 'www.sparfolder',
  [Supermarket.dirk]: 'www.dirkfolder',
  [Supermarket.deen]: 'www.deenfolder',
};

interface FolderOfferCardProps {
  offer: FolderOffer;
}

function FolderOfferCard({ offer }: FolderOfferCardProps) {
  const navigate = useNavigate();

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleClick = () => {
    navigate({ to: '/aanbieding/$offerId', params: { offerId: offer.id.toString() } });
  };

  const actionPrice = offer.originalPrice / 2;

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer h-full supermarket-card"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-muted to-muted/50">
          <img
            {...getImageProps(offer.imageUrl, offer.productName)}
            className="w-full h-full object-contain p-4"
          />
          <div className="absolute top-3 right-3">
            <img
              src={supermarketLogos[offer.supermarket]}
              alt={supermarketLabels[offer.supermarket]}
              className="h-12 w-12 object-contain bg-white rounded-full p-2 shadow-lg"
            />
          </div>
          <div className="absolute top-3 left-3">
            <img
              src="/assets/generated/one-plus-one-badge-transparent.dim_80x30.png"
              alt="1+1 Gratis"
              className="h-10 drop-shadow-xl"
            />
          </div>
        </div>

        <div className="p-5 bg-card">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 min-h-[3rem]">{offer.productName}</h3>
            {offer.brand && (
              <p className="text-sm text-muted-foreground font-medium">{offer.brand}</p>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(actionPrice)}
                </span>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(offer.originalPrice)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Per stuk bij 1+1 gratis</p>
            </div>
            <Badge className="flex items-center gap-1 bg-success text-success-foreground px-2 py-1 text-xs">
              <Tag className="h-3 w-3" />
              1+1 GRATIS
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs px-2 py-1">
                {supermarketLabels[offer.supermarket]}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>t/m {formatDate(offer.validUntil)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
              <Database className="h-3 w-3" />
              <span>Bron: {folderEndpoints[offer.supermarket]}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FolderPage() {
  const filters = useMemo(
    () => ({
      supermarket: undefined,
      category: undefined,
      brand: undefined,
    }),
    []
  );

  const { 
    offers: allOffers, 
    isLoading, 
    retryState 
  } = useAutoRetryOffers({ filters, maxRetries: 3, enabled: true });

  const offersBySupermarket = useMemo(() => {
    const grouped: Record<Supermarket, FolderOffer[]> = {
      [Supermarket.albertHeijn]: [],
      [Supermarket.jumbo]: [],
      [Supermarket.lidl]: [],
      [Supermarket.dekamarkt]: [],
      [Supermarket.aldi]: [],
      [Supermarket.spar]: [],
      [Supermarket.dirk]: [],
      [Supermarket.deen]: [],
    };

    allOffers.forEach(offer => {
      grouped[offer.supermarket].push(offer);
    });

    return grouped;
  }, [allOffers]);

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-8 supermarket-texture relative z-10">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Folder</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Alle wekelijkse 1+1 gratis aanbiedingen rechtstreeks van de officiële folder endpoints van alle acht supermarkten
          </p>
        </div>

        <Alert className="mb-6 border-primary/20 bg-primary/5 backdrop-blur-sm supermarket-card">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription>
            <strong>Live folder data:</strong> Aanbiedingen worden real-time gesynchroniseerd van www.ahfolder, www.jumbofolder, www.lidlfolder, www.dekamarktfolder, www.aldi-folder, www.sparfolder, www.dirkfolder en www.deenfolder voor maximale nauwkeurigheid. Elke aanbieding toont de bron en geldigheidsperiode.
          </AlertDescription>
        </Alert>

        {retryState.isRetrying && (
          <Alert className="border-orange-500/30 bg-orange-500/10 shadow-soft rounded-2xl animate-slide-up mb-6 backdrop-blur-sm supermarket-card">
            <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
            <AlertDescription className="text-sm">
              <strong className="text-orange-600 dark:text-orange-400">{retryState.message}</strong>
            </AlertDescription>
          </Alert>
        )}

        {!retryState.isRetrying && retryState.message && allOffers.length === 0 && (
          <Alert className="border-yellow-500/30 bg-yellow-500/10 shadow-soft rounded-2xl animate-slide-up mb-6 backdrop-blur-sm supermarket-card">
            <AlertDescription className="text-sm">
              <strong className="text-yellow-600 dark:text-yellow-400">{retryState.message}</strong>
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-lg bg-muted animate-pulse backdrop-blur-sm" />
            ))}
          </div>
        ) : allOffers.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">
              {retryState.isRetrying 
                ? 'Bezig met laden van aanbiedingen van folder endpoints...'
                : 'Geen 1+1 gratis aanbiedingen gevonden.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-12 pr-4">
              {Object.entries(offersBySupermarket).map(([supermarket, offers]) => {
                if (offers.length === 0) return null;
                
                return (
                  <div key={supermarket}>
                    <div className="flex items-center gap-3 mb-6">
                      <img 
                        src={supermarketLogos[supermarket as Supermarket]} 
                        alt={supermarketLabels[supermarket as Supermarket]}
                        className="h-12 w-12 object-contain"
                      />
                      <div>
                        <h2 className="text-2xl font-bold">{supermarketLabels[supermarket as Supermarket]}</h2>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm text-muted-foreground">{offers.length} aanbiedingen</p>
                          <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            Live van {folderEndpoints[supermarket as Supermarket]}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {offers.map((offer) => (
                        <FolderOfferCard key={Number(offer.id)} offer={offer} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {allOffers.length > 0 && (
          <div className="mt-8 text-center">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              Totaal {allOffers.length} 1+1 gratis aanbiedingen van officiële folder endpoints
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
