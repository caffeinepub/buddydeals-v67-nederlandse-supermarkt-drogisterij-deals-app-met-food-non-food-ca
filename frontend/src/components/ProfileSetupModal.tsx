import { useState } from 'react';
import { useSaveCallerUserProfile, useUploadProfilePhoto } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Supermarket, ProductCategory, UserLocation, ExternalBlob } from '../backend';
import LocationPermissionModal from './LocationPermissionModal';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import MeetingSupermarketSelector from './MeetingSupermarketSelector';
import { MapPin, User, Mail, MapPinned, Calendar } from 'lucide-react';

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

const categoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.groentenFruit]: 'Groenten & Fruit',
  [ProductCategory.vlees]: 'Vlees',
  [ProductCategory.zuivel]: 'Zuivel',
  [ProductCategory.dranken]: 'Dranken',
  [ProductCategory.bakkerij]: 'Bakkerij',
  [ProductCategory.snacks]: 'Snacks',
  [ProductCategory.overig]: 'Overig',
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

export default function ProfileSetupModal() {
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestSupermarket, setNearestSupermarket] = useState<Supermarket | null>(null);
  const [meetingSupermarket, setMeetingSupermarket] = useState<Supermarket | null>(null);
  const [selectedSupermarkets, setSelectedSupermarkets] = useState<Supermarket[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<ExternalBlob | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; city?: string; birthDate?: string }>({});
  const saveProfile = useSaveCallerUserProfile();
  const uploadPhoto = useUploadProfilePhoto();

  const handleLocationGranted = (latitude: number, longitude: number) => {
    const location: UserLocation = { latitude, longitude };
    setUserLocation(location);
    
    const nearest = findNearestSupermarket(latitude, longitude);
    setNearestSupermarket(nearest);
    setSelectedSupermarkets([nearest]);
    setMeetingSupermarket(nearest);
    
    setShowLocationModal(false);
  };

  const handleLocationDenied = () => {
    setShowLocationModal(false);
  };

  const toggleSupermarket = (supermarket: Supermarket) => {
    setSelectedSupermarkets((prev) =>
      prev.includes(supermarket) ? prev.filter((s) => s !== supermarket) : [...prev, supermarket]
    );
  };

  const toggleCategory = (category: ProductCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; city?: string; birthDate?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Naam is verplicht';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Voer een geldig e-mailadres in';
    }

    if (!city.trim()) {
      newErrors.city = 'Woonplaats is verplicht';
    }

    if (birthDate) {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.birthDate = 'Geboortedatum kan niet in de toekomst liggen';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // First upload photo if provided
    if (profilePhoto) {
      try {
        await uploadPhoto.mutateAsync(profilePhoto);
      } catch (error) {
        console.error('Error uploading photo:', error);
        // Continue with profile save even if photo upload fails
      }
    }

    // Convert birthDate to nanoseconds timestamp if provided
    const birthDateTimestamp = birthDate 
      ? BigInt(new Date(birthDate).getTime() * 1000000)
      : undefined;

    // Then save profile
    saveProfile.mutate({
      name: name.trim(),
      email: email.trim(),
      city: city.trim(),
      preferredSupermarkets: selectedSupermarkets,
      preferredCategories: selectedCategories,
      location: userLocation || undefined,
      nearestSupermarket: nearestSupermarket || undefined,
      meetingSupermarket: meetingSupermarket || undefined,
      timestamp: BigInt(Date.now() * 1000000),
      profilePhoto: profilePhoto || undefined,
      birthDate: birthDateTimestamp,
    });
  };

  if (showLocationModal) {
    return (
      <LocationPermissionModal
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-soft-xl border-border/50 animate-scale-in"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welkom bij BuddyDeals!
          </DialogTitle>
          <DialogDescription>
            Maak je profiel aan om te beginnen met het vinden van 1+1 gratis aanbiedingen en matches met andere gebruikers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {nearestSupermarket && (
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/20">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Dichtstbijzijnde supermarkt gedetecteerd</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Op basis van je locatie hebben we <strong className="text-primary">{supermarketLabels[nearestSupermarket]}</strong> automatisch 
                    geselecteerd. Je kunt dit altijd aanpassen.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Persoonlijke Gegevens</h3>
            
            <ProfilePhotoUpload
              onPhotoSelected={setProfilePhoto}
              disabled={saveProfile.isPending || uploadPhoto.isPending}
            />
            
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Naam <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Voornaam en achternaam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`rounded-xl transition-all duration-200 ${errors.name ? 'border-destructive' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                E-mailadres <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`rounded-xl transition-all duration-200 ${errors.email ? 'border-destructive' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                Woonplaats <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="Amsterdam"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`rounded-xl transition-all duration-200 ${errors.city ? 'border-destructive' : ''}`}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Geboortedatum
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`rounded-xl transition-all duration-200 ${errors.birthDate ? 'border-destructive' : ''}`}
              />
              {errors.birthDate && (
                <p className="text-sm text-destructive">{errors.birthDate}</p>
              )}
            </div>
          </div>

          <MeetingSupermarketSelector
            selectedSupermarket={meetingSupermarket}
            onSupermarketChange={setMeetingSupermarket}
            userLocation={userLocation || undefined}
          />

          <div>
            <h3 className="mb-3 font-semibold">Favoriete Supermarkten</h3>
            <div className="grid gap-3">
              {Object.entries(supermarketLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-muted/50">
                  <Checkbox
                    id={`supermarket-${key}`}
                    checked={selectedSupermarkets.includes(key as Supermarket)}
                    onCheckedChange={() => toggleSupermarket(key as Supermarket)}
                  />
                  <Label htmlFor={`supermarket-${key}`} className="cursor-pointer flex-1">
                    {label}
                    {key === nearestSupermarket && (
                      <span className="ml-2 text-xs text-primary font-medium">(Dichtstbijzijnd)</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Favoriete Categorieën</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-muted/50">
                  <Checkbox
                    id={`category-${key}`}
                    checked={selectedCategories.includes(key as ProductCategory)}
                    onCheckedChange={() => toggleCategory(key as ProductCategory)}
                  />
                  <Label htmlFor={`category-${key}`} className="cursor-pointer flex-1">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saveProfile.isPending || uploadPhoto.isPending}
            className="rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary"
          >
            {saveProfile.isPending || uploadPhoto.isPending ? 'Profiel aanmaken...' : 'Profiel aanmaken'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
