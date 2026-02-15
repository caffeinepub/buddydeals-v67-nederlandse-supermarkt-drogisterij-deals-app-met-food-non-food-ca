import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationPermissionModalProps {
  onLocationGranted: (latitude: number, longitude: number) => void;
  onLocationDenied: () => void;
}

export default function LocationPermissionModal({ onLocationGranted, onLocationDenied }: LocationPermissionModalProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setIsRequesting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Je browser ondersteunt geen locatiedetectie.');
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        onLocationGranted(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsRequesting(false);
        let errorMessage = 'Kon locatie niet ophalen.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Locatietoegang geweigerd. Je kunt handmatig een supermarkt selecteren.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Locatie-informatie niet beschikbaar.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Locatieverzoek verlopen.';
            break;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const skipLocation = () => {
    onLocationDenied();
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Locatietoegang
          </DialogTitle>
          <DialogDescription>
            We willen je locatie gebruiken om automatisch de dichtstbijzijnde supermarkt te vinden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Door je locatie te delen, kunnen we automatisch de supermarkt bij jou in de buurt selecteren. 
            Dit helpt ons om relevante 1+1 gratis aanbiedingen te tonen.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy:</strong> Je locatie wordt alleen gebruikt om de dichtstbijzijnde supermarkt 
              te bepalen en wordt veilig opgeslagen in je profiel. Je kunt je voorkeuren altijd handmatig aanpassen.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={skipLocation}
            disabled={isRequesting}
            className="w-full sm:w-auto"
          >
            Overslaan
          </Button>
          <Button
            onClick={requestLocation}
            disabled={isRequesting}
            className="w-full sm:w-auto"
          >
            {isRequesting ? (
              <>
                <MapPin className="mr-2 h-4 w-4 animate-pulse" />
                Locatie ophalen...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Locatie toestaan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
