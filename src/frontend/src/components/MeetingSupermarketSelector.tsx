import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Supermarket, UserLocation } from '../backend';
import { MapPin, List, Navigation } from 'lucide-react';

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

function findNearestSupermarket(latitude: number, longitude: number): Supermarket {
  let nearest: Supermarket = Supermarket.albertHeijn;
  let minDistance = Infinity;

  for (const [supermarket, location] of Object.entries(supermarketLocations)) {
    const distance = calculateDistance(latitude, longitude, location.lat, location.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = supermarket as Supermarket;
    }
  }

  return nearest;
}

interface MeetingSupermarketSelectorProps {
  selectedSupermarket: Supermarket | null;
  onSupermarketChange: (supermarket: Supermarket) => void;
  userLocation?: UserLocation;
}

export default function MeetingSupermarketSelector({ 
  selectedSupermarket, 
  onSupermarketChange,
  userLocation
}: MeetingSupermarketSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const handleGPSDetection = () => {
    setIsDetecting(true);
    setDetectionError(null);

    if (!navigator.geolocation) {
      setDetectionError('Geolocatie wordt niet ondersteund door je browser');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = findNearestSupermarket(latitude, longitude);
        onSupermarketChange(nearest);
        setIsDetecting(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setDetectionError('Kon locatie niet bepalen. Selecteer handmatig een supermarkt.');
        setIsDetecting(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          Afspraaklocatie
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Kies bij welke supermarkt je wilt afspreken met gematchte gebruikers
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-muted/50 p-1.5 shadow-soft border border-border/50">
          <TabsTrigger value="list" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">
            <List className="h-4 w-4 mr-2" />
            Lijst
          </TabsTrigger>
          <TabsTrigger value="map" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">
            <Navigation className="h-4 w-4 mr-2" />
            GPS-detectie
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3 mt-4 animate-fade-in">
          <div className="grid gap-3">
            {Object.entries(supermarketLabels).map(([key, label]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all duration-200 hover:shadow-soft ${
                  selectedSupermarket === key ? 'border-primary bg-primary/5' : 'border-border/50'
                }`}
                onClick={() => onSupermarketChange(key as Supermarket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedSupermarket === key}
                      onCheckedChange={() => onSupermarketChange(key as Supermarket)}
                      className="transition-all duration-200"
                    />
                    <img 
                      src={supermarketLogos[key as Supermarket]}
                      alt={label}
                      className="h-10 w-10 object-contain"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4 mt-4 animate-fade-in">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                GPS-gebaseerde detectie
              </CardTitle>
              <CardDescription>
                Vind automatisch de dichtstbijzijnde supermarkt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGPSDetection}
                disabled={isDetecting}
                className="w-full gap-2 rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary"
              >
                <MapPin className="h-4 w-4" />
                {isDetecting ? 'Locatie detecteren...' : 'Detecteer dichtstbijzijnde supermarkt'}
              </Button>

              {detectionError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{detectionError}</p>
                </div>
              )}

              {selectedSupermarket && (
                <div className="p-4 rounded-xl bg-background border border-primary/20">
                  <div className="flex items-center gap-3">
                    <img 
                      src={supermarketLogos[selectedSupermarket]}
                      alt={supermarketLabels[selectedSupermarket]}
                      className="h-12 w-12 object-contain"
                    />
                    <div>
                      <p className="text-sm text-muted-foreground">Geselecteerde afspraaklocatie:</p>
                      <p className="font-semibold text-primary">{supermarketLabels[selectedSupermarket]}</p>
                    </div>
                  </div>
                </div>
              )}

              {userLocation && (
                <div className="text-xs text-muted-foreground p-3 rounded-xl bg-muted/50">
                  <p>Je huidige locatie: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
