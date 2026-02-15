import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetUserProductOverview, useGetAllOffers, useGetCallerUserProfile, useGetUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Loader2, MapPin, User, PartyPopper } from 'lucide-react';
import { getImageProps } from '../lib/imageUtils';
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

export default function MatchPortalPage() {
  const navigate = useNavigate();
  const { data: productOverview, isLoading } = useGetUserProductOverview();
  const { data: allOffers = [] } = useGetAllOffers();
  const { data: userProfile } = useGetCallerUserProfile();
  const [matchPercentage, setMatchPercentage] = useState(0);

  useEffect(() => {
    if (productOverview) {
      const totalProducts = productOverview.onlyCurrentUser.length + productOverview.sharedProducts.length;
      const sharedProducts = productOverview.sharedProducts.length;
      
      if (totalProducts > 0) {
        const percentage = Math.round((sharedProducts / totalProducts) * 100);
        setMatchPercentage(percentage);
      }
    }
  }, [productOverview]);

  const hasMatch = matchPercentage >= 70;
  const selectedProducts = productOverview 
    ? [...productOverview.onlyCurrentUser, ...productOverview.sharedProducts]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen supermarket-bg">
        <div className="container py-8 supermarket-texture relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Match Portal laden...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-8 animate-fade-in supermarket-texture relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/' })}
              className="mb-4 gap-2 rounded-full hover:shadow-soft supermarket-card"
            >
              <ArrowLeft className="h-4 w-4" />
              Terug naar overzicht
            </Button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm">
                <img 
                  src="/assets/generated/match-portal-icon-transparent.dim_48x48.png" 
                  alt="Match Portal" 
                  className="h-12 w-12"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Match Portal
                </h1>
                <p className="text-muted-foreground">
                  {hasMatch ? 'Match gevonden!' : 'Wachten op match...'}
                </p>
              </div>
            </div>
          </div>

          {/* Match Status Card */}
          <Card className={`mb-6 border-2 ${hasMatch ? 'border-primary bg-gradient-to-br from-primary/10 to-secondary/10' : 'border-border'} shadow-soft-lg rounded-3xl backdrop-blur-sm supermarket-card`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  {hasMatch ? (
                    <>
                      <PartyPopper className="h-6 w-6 text-primary" />
                      Match Gevonden!
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      Zoeken naar match...
                    </>
                  )}
                </CardTitle>
                <Badge 
                  variant={hasMatch ? "default" : "secondary"}
                  className="text-lg px-4 py-1 rounded-full"
                >
                  {matchPercentage}% overeenkomst
                </Badge>
              </div>
              <CardDescription>
                {hasMatch 
                  ? 'Je hebt een match met minimaal 70% overeenkomst!' 
                  : 'We zoeken naar gebruikers met minimaal 70% dezelfde producten'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Match voortgang</span>
                    <span className="font-semibold">{matchPercentage}%</span>
                  </div>
                  <Progress value={matchPercentage} className="h-3" />
                </div>
                
                {hasMatch && (
                  <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 animate-scale-in backdrop-blur-sm">
                    <p className="text-sm font-medium text-primary mb-2">
                      🎉 Gefeliciteerd! Je hebt een match!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Je kunt nu contact opnemen met je match om een afspraak te maken bij de supermarkt.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Products */}
          <Card className="mb-6 shadow-soft rounded-3xl supermarket-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-primary" />
                Jouw Geselecteerde Producten ({selectedProducts.length})
              </CardTitle>
              <CardDescription>
                Producten die je hebt geselecteerd voor matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Geen producten geselecteerd</p>
                  <Button onClick={() => navigate({ to: '/' })} className="rounded-full">
                    Selecteer producten
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {selectedProducts.map((detail) => {
                    const offer = allOffers.find(o => o.id === detail.product.id);
                    if (!offer) return null;
                    
                    const isShared = detail.matchedUsers.length > 0;
                    
                    return (
                      <Card 
                        key={Number(offer.id)} 
                        className={`overflow-hidden transition-all duration-300 hover:shadow-soft ${isShared ? 'border-primary bg-primary/5' : ''} backdrop-blur-sm supermarket-card`}
                      >
                        <div className="relative">
                          <img 
                            {...getImageProps(offer.imageUrl, offer.productName)}
                            className="h-40 w-full object-cover"
                          />
                          {isShared && (
                            <Badge className="absolute top-2 right-2 bg-primary">
                              Match!
                            </Badge>
                          )}
                          <div className="absolute top-2 left-2">
                            <Badge variant="secondary" className="bg-background/90">
                              1+1 Gratis
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1 line-clamp-2">{offer.productName}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {supermarketLabels[offer.supermarket]} - €{offer.originalPrice.toFixed(2)}
                          </p>
                          
                          {isShared && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-primary">
                                Gematcht met {detail.matchedUsers.length} gebruiker{detail.matchedUsers.length !== 1 ? 's' : ''}
                              </p>
                              {detail.matchedUsers.slice(0, 2).map((matchedUser) => (
                                <MatchedUserCard key={matchedUser.toString()} userPrincipal={matchedUser} />
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meeting Location */}
          {userProfile?.meetingSupermarket && (
            <Card className="shadow-soft rounded-3xl border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm supermarket-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  Afspraaklocatie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Afspraak bij:</p>
                    <p className="text-xl font-bold text-primary">
                      {supermarketLabels[userProfile.meetingSupermarket]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface MatchedUserCardProps {
  userPrincipal: any;
}

function MatchedUserCard({ userPrincipal }: MatchedUserCardProps) {
  const { data: userProfile } = useGetUserProfile(userPrincipal);
  const userShort = userPrincipal.toString().slice(0, 8) + '...';

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg backdrop-blur-sm">
      <div className="h-8 w-8 rounded-full overflow-hidden bg-background border border-border flex-shrink-0">
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
        <p className="text-xs font-medium truncate">
          {userProfile?.name || userShort}
        </p>
        {userProfile?.meetingSupermarket && (
          <p className="text-xs text-muted-foreground truncate">
            {supermarketLabels[userProfile.meetingSupermarket]}
          </p>
        )}
      </div>
    </div>
  );
}
