import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGetUserProductOverview, useGetUserProfile } from '../hooks/useQueries';
import { Supermarket, FolderOffer } from '../backend';
import { Users, ShoppingCart, Package, MapPin } from 'lucide-react';
import { useState } from 'react';
import SharedPaymentModal from './SharedPaymentModal';
import { getImageProps } from '../lib/imageUtils';
import { Principal } from '@icp-sdk/core/principal';

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

export default function SelectedProductsOverview() {
  const { data: overview, isLoading } = useGetUserProductOverview();
  const [selectedOffer, setSelectedOffer] = useState<FolderOffer | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Overzicht laden...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <Card className="border-muted">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Geen geselecteerde producten gevonden.</p>
            <p className="text-sm mt-2">Selecteer producten in de "Producten" tab om te beginnen met matchen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalProducts = overview.onlyCurrentUser.length + overview.sharedProducts.length;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Geselecteerde Artikelen Overzicht
          </CardTitle>
          <CardDescription>
            Totaal {totalProducts} product{totalProducts !== 1 ? 'en' : ''} geselecteerd
            {overview.sharedProducts.length > 0 && (
              <span className="text-primary font-medium">
                {' '}• {overview.sharedProducts.length} gedeeld met andere gebruikers
              </span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {overview.sharedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Gedeelde Producten</h3>
            <Badge variant="default" className="ml-auto">
              {overview.sharedProducts.length} match{overview.sharedProducts.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
          
          <div className="grid gap-4">
            {overview.sharedProducts.map((detail) => (
              <Card key={Number(detail.product.id)} className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img
                      {...getImageProps(detail.product.imageUrl, detail.product.productName)}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold">{detail.product.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {supermarketLabels[detail.product.supermarket]} • €{detail.product.originalPrice.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" />
                          {detail.matchedUsers.length} gebruiker{detail.matchedUsers.length !== 1 ? 's' : ''} gematched
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Gematchte gebruikers:</p>
                        <div className="space-y-1">
                          {detail.matchedUsers.map((user, index) => (
                            <MatchedUserCard 
                              key={index} 
                              userPrincipal={user}
                              onBuyTogether={() => setSelectedOffer(detail.product)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {overview.onlyCurrentUser.length > 0 && (
        <>
          {overview.sharedProducts.length > 0 && <Separator className="my-6" />}
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Alleen Jouw Selectie</h3>
              <Badge variant="outline" className="ml-auto">
                {overview.onlyCurrentUser.length} product{overview.onlyCurrentUser.length !== 1 ? 'en' : ''}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Deze producten zijn nog niet gematched met andere gebruikers. We blijven zoeken naar matches!
            </p>
            
            <div className="grid gap-3">
              {overview.onlyCurrentUser.map((detail) => (
                <Card key={Number(detail.product.id)} className="border-muted">
                  <CardContent className="p-3">
                    <div className="flex gap-3 items-center">
                      <img
                        {...getImageProps(detail.product.imageUrl, detail.product.productName)}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{detail.product.productName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {supermarketLabels[detail.product.supermarket]} • €{detail.product.originalPrice.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Wachten op match
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedOffer && (
        <SharedPaymentModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
}

interface MatchedUserCardProps {
  userPrincipal: Principal;
  onBuyTogether: () => void;
}

function MatchedUserCard({ userPrincipal, onBuyTogether }: MatchedUserCardProps) {
  const { data: userProfile } = useGetUserProfile(userPrincipal);

  return (
    <div className="flex items-center justify-between gap-2 text-xs bg-background/50 p-2 rounded">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Profile photo */}
        <div className="h-8 w-8 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0">
          {userProfile?.profilePhoto ? (
            <img 
              src={userProfile.profilePhoto.getDirectURL()} 
              alt={userProfile.name || 'Gebruiker'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <img 
              src="/assets/generated/default-avatar-transparent.dim_64x64.png" 
              alt="Standaard avatar" 
              className="h-full w-full object-contain p-1 opacity-50"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-mono text-muted-foreground truncate">
            {userProfile?.name || `${userPrincipal.toString().slice(0, 20)}...${userPrincipal.toString().slice(-8)}`}
          </p>
          {userProfile?.meetingSupermarket && (
            <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              Afspraak bij: {supermarketLabels[userProfile.meetingSupermarket]}
            </p>
          )}
        </div>
      </div>
      
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs flex-shrink-0"
        onClick={onBuyTogether}
      >
        Samen kopen
      </Button>
    </div>
  );
}
