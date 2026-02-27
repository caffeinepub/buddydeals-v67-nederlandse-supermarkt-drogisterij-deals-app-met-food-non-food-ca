import { FolderOffer, Supermarket } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ShoppingCart, Database } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { getImageProps } from '../lib/imageUtils';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

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

interface OfferCardProps {
  offer: FolderOffer;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  
  const formatPrice = (price: number) => `€${price.toFixed(2)}`;
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the add to cart button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate({ to: '/aanbieding/$offerId', params: { offerId: offer.id.toString() } });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(offer);
    toast.success(`${offer.productName} toegevoegd aan winkelwagen`);
  };

  const actionPrice = offer.originalPrice / 2;
  const inCart = isInCart(offer.id);

  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 cursor-pointer animate-fade-in border-border/50 bg-card"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative w-full aspect-square bg-gradient-to-br from-muted/20 to-muted/40 overflow-hidden">
          <img
            {...getImageProps(offer.imageUrl, offer.productName)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 transition-transform duration-300 group-hover:scale-110">
            <img
              src={supermarketLogos[offer.supermarket]}
              alt={supermarketLabels[offer.supermarket]}
              className="h-12 w-12 object-contain bg-white/95 rounded-full p-1.5 shadow-soft"
            />
          </div>
          <div className="absolute top-3 left-3">
            <Badge className="bg-success text-success-foreground shadow-soft font-bold text-xs px-3 py-1">
              1+1 GRATIS
            </Badge>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <h3 className="font-bold text-base mb-1.5 line-clamp-2 transition-colors duration-200 group-hover:text-primary min-h-[3rem] leading-tight">
              {offer.productName}
            </h3>
            {offer.brand && (
              <p className="text-xs text-muted-foreground font-medium">{offer.brand}</p>
            )}
          </div>

          <div className="mb-5">
            <div className="flex items-baseline gap-2.5 mb-1.5">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(actionPrice)}
              </span>
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(offer.originalPrice)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Per stuk bij 1+1 gratis actie</p>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={inCart}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-soft transition-all duration-300 font-semibold"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {inCart ? 'In winkelwagen' : 'Toevoegen'}
          </Button>

          <div className="space-y-2 pt-4 mt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{supermarketLabels[offer.supermarket]}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                t/m {formatDate(offer.validUntil)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
              <Database className="h-3 w-3" />
              <span>Live van {folderEndpoints[offer.supermarket]}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
