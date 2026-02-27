import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Supermarket, UserLocation } from '../backend';
import { Store, MapPin, Check, Loader2, ChevronRight, Navigation, Award, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

const supermarketLocations: Record<Supermarket, { lat: number; lng: number }> = {
  [Supermarket.albertHeijn]: { lat: 52.3676, lng: 4.9041 },
  [Supermarket.jumbo]: { lat: 51.5719, lng: 4.7683 },
  [Supermarket.lidl]: { lat: 52.0907, lng: 5.1214 },
  [Supermarket.dekamarkt]: { lat: 52.3702, lng: 4.8952 },
  [Supermarket.aldi]: { lat: 52.3667, lng: 4.8945 },
  [Supermarket.spar]: { lat: 52.3716, lng: 4.9000 },
  [Supermarket.dirk]: { lat: 52.3680, lng: 4.9036 },
  [Supermarket.deen]: { lat: 52.3690, lng: 4.9020 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function findNearestSupermarket(latitude: number, longitude: number): { supermarket: Supermarket; distance: number } {
  let nearest: Supermarket = Supermarket.albertHeijn;
  let minDistance = Infinity;

  for (const [supermarket, location] of Object.entries(supermarketLocations)) {
    const distance = calculateDistance(latitude, longitude, location.lat, location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = supermarket as Supermarket;
    }
  }

  return { supermarket: nearest, distance: minDistance };
}

function findNearestBranch(latitude: number, longitude: number, supermarket: Supermarket): string {
  const location = supermarketLocations[supermarket];
  const distance = calculateDistance(latitude, longitude, location.lat, location.lng);
  return `${distance.toFixed(1)} km van je locatie`;
}

type WorkflowStep = 'supermarket' | 'branch' | 'loading';

export default function SupermarketSelectionPage() {
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [step, setStep] = useState<WorkflowStep>('supermarket');
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestSupermarket, setNearestSupermarket] = useState<Supermarket | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [suggestedBranch, setSuggestedBranch] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [gpsPermissionDenied, setGpsPermissionDenied] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Check if user already has a preferred supermarket
  useEffect(() => {
    if (userProfile?.preferredSupermarkets && userProfile.preferredSupermarkets.length > 0) {
      navigate({ to: '/' });
    }
  }, [userProfile, navigate]);

  // Automatically detect GPS location when component mounts
  useEffect(() => {
    if (step === 'supermarket' && !locationDetected && !isDetectingLocation) {
      detectUserLocation();
    }
  }, [step, locationDetected, isDetectingLocation]);

  const detectUserLocation = () => {
    setIsDetectingLocation(true);
    setGpsError(null);
    
    if (!navigator.geolocation) {
      setGpsError('GPS wordt niet ondersteund door je browser');
      setIsDetectingLocation(false);
      setLocationDetected(true);
      setGpsPermissionDenied(true);
      toast.info('GPS niet ondersteund. Kies handmatig een supermarkt.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location: UserLocation = { latitude, longitude };
        setUserLocation(location);
        
        const { supermarket, distance } = findNearestSupermarket(latitude, longitude);
        setNearestSupermarket(supermarket);
        setNearestDistance(distance);
        setLocationDetected(true);
        setIsDetectingLocation(false);
        setGpsPermissionDenied(false);
        
        toast.success(`Dichtstbijzijnde supermarkt gevonden: ${supermarketLabels[supermarket]} (${distance.toFixed(1)} km)`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsDetectingLocation(false);
        setLocationDetected(true);
        setGpsPermissionDenied(true);
        
        let errorMessage = 'Locatie niet beschikbaar';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Locatietoegang geweigerd';
            setGpsError('Je hebt locatietoegang geweigerd. Kies handmatig een supermarkt.');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Locatie niet beschikbaar';
            setGpsError('Je locatie kon niet worden bepaald. Kies handmatig een supermarkt.');
            break;
          case error.TIMEOUT:
            errorMessage = 'Locatieverzoek verlopen';
            setGpsError('Locatieverzoek duurde te lang. Kies handmatig een supermarkt.');
            break;
          default:
            setGpsError('Er ging iets mis met locatiedetectie. Kies handmatig een supermarkt.');
        }
        
        toast.info(errorMessage + '. Kies handmatig een supermarkt.');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSupermarketSelect = (supermarket: Supermarket) => {
    setSelectedSupermarket(supermarket);
    setStep('branch');
    
    if (userLocation) {
      const branch = findNearestBranch(userLocation.latitude, userLocation.longitude, supermarket);
      setSuggestedBranch(branch);
    } else {
      setSuggestedBranch('Handmatige selectie beschikbaar');
    }
  };

  const handleBranchConfirm = async () => {
    if (!selectedSupermarket || !userProfile) return;
    
    setStep('loading');
    
    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        preferredSupermarkets: [selectedSupermarket],
        nearestSupermarket: selectedSupermarket,
        location: userLocation || undefined,
      });
      
      toast.success(`Voorkeursupermarkt ingesteld: ${supermarketLabels[selectedSupermarket]}`);
      
      setTimeout(() => {
        navigate({ to: '/' });
      }, 1000);
    } catch (error) {
      console.error('Error saving supermarket:', error);
      toast.error('Fout bij opslaan supermarkt');
      setStep('branch');
    }
  };

  const handleBack = () => {
    if (step === 'branch') {
      setStep('supermarket');
      setSelectedSupermarket(null);
      setSuggestedBranch(null);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            step === 'supermarket' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">Stap 1: Supermarkt</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            step === 'branch' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Stap 2: Filiaal</span>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            step === 'loading' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Stap 3: Aanbiedingen</span>
          </div>
        </div>

        {/* Step 1: Supermarket Selection */}
        {step === 'supermarket' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 shadow-soft">
                <Store className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Kies uw voorkeursupermarkt om te beginnen
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Selecteer de supermarkt waar u het liefst winkelt om te beginnen met het bekijken van 1+1 gratis aanbiedingen
              </p>
              
              {isDetectingLocation && (
                <div className="mt-4 flex items-center justify-center gap-2 text-primary animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Dichtstbijzijnde supermarkt detecteren...</span>
                </div>
              )}
              
              {nearestSupermarket && nearestDistance && !gpsPermissionDenied && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-soft animate-scale-in">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Dichtstbijzijnde supermarkt: {supermarketLabels[nearestSupermarket]} ({nearestDistance.toFixed(1)} km van uw locatie)
                  </span>
                </div>
              )}

              {gpsPermissionDenied && gpsError && (
                <Alert className="mt-4 max-w-2xl mx-auto border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    {gpsError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(supermarketLabels).map(([key, label]) => {
                const isNearest = nearestSupermarket === key && !gpsPermissionDenied;
                
                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-soft-lg hover:scale-105 rounded-2xl overflow-hidden group relative ${
                      isNearest 
                        ? 'border-2 border-primary shadow-soft-lg ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5' 
                        : 'border-2 hover:border-primary/50'
                    }`}
                    onClick={() => handleSupermarketSelect(key as Supermarket)}
                  >
                    {isNearest && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold shadow-soft animate-scale-in">
                          <Award className="h-3 w-3" />
                          <span>Dichtstbij</span>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-6 flex flex-col items-center gap-4">
                      <div className={`w-24 h-24 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                        isNearest 
                          ? 'bg-primary/20 ring-2 ring-primary/30 shadow-soft' 
                          : 'bg-muted/50 group-hover:bg-primary/10'
                      }`}>
                        <img
                          src={supermarketLogos[key as Supermarket]}
                          alt={label}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className={`font-semibold text-lg transition-colors ${
                          isNearest ? 'text-primary' : 'group-hover:text-primary'
                        }`}>
                          {label}
                        </h3>
                        {isNearest && nearestDistance && (
                          <p className="text-xs text-primary/70 mt-1 flex items-center justify-center gap-1 font-medium">
                            <MapPin className="h-3 w-3" />
                            {nearestDistance.toFixed(1)} km
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {gpsPermissionDenied && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Kies handmatig uw voorkeursupermarkt uit de lijst hierboven
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Branch Suggestion */}
        {step === 'branch' && selectedSupermarket && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 shadow-soft">
                <MapPin className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Dichtstbijzijnde filiaal
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {userLocation 
                  ? `We hebben het dichtstbijzijnde ${supermarketLabels[selectedSupermarket]} filiaal voor u gevonden`
                  : `U heeft ${supermarketLabels[selectedSupermarket]} geselecteerd`
                }
              </p>
            </div>

            <Card className="max-w-2xl mx-auto border-2 border-primary/30 shadow-soft-lg rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-32 h-32 flex items-center justify-center bg-primary/10 rounded-3xl shadow-soft">
                    <img
                      src={supermarketLogos[selectedSupermarket]}
                      alt={supermarketLabels[selectedSupermarket]}
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      {supermarketLabels[selectedSupermarket]}
                    </h2>
                    {suggestedBranch && userLocation && (
                      <div className="flex items-center gap-2 justify-center text-primary">
                        <Navigation className="h-5 w-5" />
                        <span className="font-medium">{suggestedBranch}</span>
                      </div>
                    )}
                    {!userLocation && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Handmatige selectie - locatie niet beschikbaar
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-3">
                    <Button
                      onClick={handleBranchConfirm}
                      disabled={saveProfile.isPending}
                      className="w-full gap-2 rounded-full py-6 text-lg bg-gradient-to-r from-primary to-secondary hover:shadow-soft-lg transition-all duration-300"
                    >
                      {saveProfile.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Opslaan...
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          Bevestigen en doorgaan
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="w-full rounded-full py-6 text-lg"
                    >
                      Andere supermarkt kiezen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Loading */}
        {step === 'loading' && (
          <div className="animate-fade-in text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 shadow-soft">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Aanbiedingen laden...
            </h1>
            <p className="text-lg text-muted-foreground">
              We laden de 1+1 gratis aanbiedingen van {selectedSupermarket && supermarketLabels[selectedSupermarket]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
