import { useMemo } from 'react';
import { useGetAllOffers, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import OfferCard from '../components/OfferCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Store, AlertCircle } from 'lucide-react';
import { Supermarket } from '../backend';

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

export default function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: allOffers = [], isLoading: offersLoading } = useGetAllOffers();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  const filteredOffers = useMemo(() => {
    if (!userProfile?.preferredSupermarkets || userProfile.preferredSupermarkets.length === 0) {
      return allOffers;
    }

    return allOffers.filter(offer => 
      userProfile.preferredSupermarkets.some(preferred => preferred === offer.supermarket)
    );
  }, [allOffers, userProfile]);

  const selectedSupermarketName = useMemo(() => {
    if (!userProfile?.preferredSupermarkets || userProfile.preferredSupermarkets.length === 0) {
      return null;
    }
    return supermarketLabels[userProfile.preferredSupermarkets[0]];
  }, [userProfile]);

  if (offersLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] supermarket-bg">
        <div className="text-center supermarket-card p-8 rounded-3xl">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Aanbiedingen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-12 supermarket-texture">
        {/* Large Centered BuddyDeals Logo */}
        <div className="flex justify-center mb-12 animate-fade-in relative z-10">
          <div className="text-center">
            <img 
              src="/assets/generated/buddydeals-logo-bd-collaboration-green-blue-transparent.dim_200x200.png" 
              alt="BuddyDeals Logo" 
              className="w-48 h-48 mx-auto mb-6 drop-shadow-soft-lg hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">
              {selectedSupermarketName 
                ? `1+1 Gratis bij ${selectedSupermarketName}` 
                : '1+1 Gratis Aanbiedingen'}
            </h1>
            <p className="text-lg text-muted-foreground">
              Ontdek de beste deals en deel ze met anderen
            </p>
          </div>
        </div>

        {/* Info Alerts */}
        <div className="max-w-3xl mx-auto mb-12 space-y-4 animate-slide-up relative z-10">
          {isAuthenticated && selectedSupermarketName && (
            <Alert className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/30 shadow-soft backdrop-blur-sm supermarket-card">
              <Store className="h-5 w-5 text-primary" />
              <AlertDescription className="text-base">
                Gefilterd op jouw voorkeursupermarkt: <strong className="text-primary">{selectedSupermarketName}</strong>. 
                Live gesynchroniseerd met officiële folder endpoints.
              </AlertDescription>
            </Alert>
          )}

          {!isAuthenticated && (
            <Alert className="shadow-soft backdrop-blur-sm supermarket-card">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-base">
                Log in om je voorkeursupermarkt te selecteren en gepersonaliseerde aanbiedingen te zien.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-20 animate-scale-in relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 shadow-soft backdrop-blur-sm">
              <Store className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-foreground">Geen aanbiedingen gevonden</h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Er zijn momenteel geen 1+1 gratis aanbiedingen beschikbaar voor jouw geselecteerde supermarkt.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10">
            {filteredOffers.map((offer, index) => (
              <div 
                key={offer.id.toString()} 
                className="animate-scale-in"
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'backwards'
                }}
              >
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        )}

        {/* Version Info Footer */}
        {filteredOffers.length > 0 && (
          <div className="mt-16 text-center animate-fade-in relative z-10">
            <p className="text-sm text-muted-foreground">
              BuddyDeals - Volledig geactiveerde Nederlandse supermarkt deals app
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
