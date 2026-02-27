import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllOffers } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Tag, Calendar, Store } from 'lucide-react';
import { Supermarket } from '../backend';
import { useMemo } from 'react';
import { getImageProps } from '../lib/imageUtils';

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

export default function OfferDetailPage() {
  const { offerId } = useParams({ from: '/aanbieding/$offerId' });
  const navigate = useNavigate();

  const { data: allOffers = [], isLoading } = useGetAllOffers();

  const offer = useMemo(() => {
    return allOffers.find(o => o.id.toString() === offerId);
  }, [allOffers, offerId]);

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen supermarket-bg">
        <div className="container py-8 supermarket-texture relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="h-96 rounded-lg bg-muted animate-pulse mb-6 backdrop-blur-sm" />
            <div className="h-32 rounded-lg bg-muted animate-pulse backdrop-blur-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen supermarket-bg">
        <div className="container py-8 supermarket-texture relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">Aanbieding niet gevonden</p>
            <Button onClick={() => navigate({ to: '/' })} className="supermarket-card">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar aanbiedingen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate action price (half of original for 1+1 gratis)
  const actionPrice = offer.originalPrice / 2;

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-8 supermarket-texture relative z-10">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6 supermarket-card">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar aanbiedingen
          </Button>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted supermarket-card">
              <img
                {...getImageProps(offer.imageUrl, offer.productName)}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4">
                <img
                  src={supermarketLogos[offer.supermarket]}
                  alt={supermarketLabels[offer.supermarket]}
                  className="h-16 w-16 object-contain bg-white/90 rounded-full p-2 shadow-lg"
                />
              </div>
              <div className="absolute top-4 left-4">
                <img
                  src="/assets/generated/one-plus-one-badge-transparent.dim_80x30.png"
                  alt="1+1 Gratis"
                  className="h-10 drop-shadow-lg"
                />
              </div>
              <div className="absolute bottom-4 left-4">
                <Badge variant="secondary" className="flex items-center gap-1 bg-background/90 text-foreground border shadow-md">
                  <Calendar className="h-3 w-3" />
                  Folder van deze week
                </Badge>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{offer.productName}</h1>
                {offer.brand && (
                  <p className="text-lg text-muted-foreground mb-4">{offer.brand}</p>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <Badge variant="secondary" className="text-lg px-3 py-1 bg-success/10 text-success border-success/20">
                    <Tag className="mr-1 h-4 w-4" />
                    1+1 Gratis
                  </Badge>
                  <Badge variant="outline" className="text-sm px-2 py-1">
                    <Calendar className="mr-1 h-3 w-3" />
                    Folder van deze week
                  </Badge>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-primary">
                      {formatPrice(actionPrice)}
                    </span>
                    <span className="text-2xl text-muted-foreground line-through">
                      {formatPrice(offer.originalPrice)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Actieprijs per stuk bij 1+1 gratis
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Originele prijs: {formatPrice(offer.originalPrice)} per stuk
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Store className="h-5 w-5" />
                    <span>{supermarketLabels[offer.supermarket]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <span>Geldig van {formatDate(offer.validFrom)} t/m {formatDate(offer.validUntil)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card className="supermarket-card">
            <CardHeader>
              <CardTitle>Over deze aanbieding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Deze 1+1 gratis aanbieding is beschikbaar bij {supermarketLabels[offer.supermarket]} en geldig tot{' '}
                {formatDate(offer.validUntil)}. Koop 2 producten en betaal slechts {formatPrice(offer.originalPrice)} 
                in plaats van {formatPrice(offer.originalPrice * 2)}. Dat is een besparing van 50%!
              </p>
              <p className="text-muted-foreground mb-3">
                <strong>Actieprijs:</strong> {formatPrice(actionPrice)} per stuk (bij aankoop van 2 stuks)
              </p>
              <p className="text-muted-foreground">
                <strong>Folder van deze week:</strong> Deze aanbieding is onderdeel van de actuele wekelijkse folder 
                en wordt regelmatig gesynchroniseerd met de nieuwste aanbiedingen van de supermarkt.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
