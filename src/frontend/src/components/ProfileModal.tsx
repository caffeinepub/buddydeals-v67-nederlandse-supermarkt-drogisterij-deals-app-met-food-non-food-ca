import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetUserReviews, useGetFavoriteOfferIds, useAddUserSelectedProducts, useGetOffers, useUploadProfilePhoto, useRemoveProfilePhoto } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Supermarket, ProductCategory, ExternalBlob } from '../backend';
import UserReviewsSection from './UserReviewsSection';
import SelectedProductsOverview from './SelectedProductsOverview';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import MeetingSupermarketSelector from './MeetingSupermarketSelector';
import { MapPin, Heart, List, User, Mail, MapPinned, ArrowRight, Calendar } from 'lucide-react';
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

const categoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.groentenFruit]: 'Groenten & Fruit',
  [ProductCategory.vlees]: 'Vlees',
  [ProductCategory.zuivel]: 'Zuivel',
  [ProductCategory.dranken]: 'Dranken',
  [ProductCategory.bakkerij]: 'Bakkerij',
  [ProductCategory.snacks]: 'Snacks',
  [ProductCategory.overig]: 'Overig',
};

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ open, onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const saveProfile = useSaveCallerUserProfile();
  const uploadPhoto = useUploadProfilePhoto();
  const removePhoto = useRemoveProfilePhoto();
  const { data: favoriteOfferIds = [] } = useGetFavoriteOfferIds();
  const { data: allOffers = [] } = useGetOffers({});
  const addSelectedProducts = useAddUserSelectedProducts();
  
  const userPrincipal = identity?.getPrincipal();
  const { data: userReviews } = useGetUserReviews(userPrincipal!);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedSupermarkets, setSelectedSupermarkets] = useState<Supermarket[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>([]);
  const [meetingSupermarket, setMeetingSupermarket] = useState<Supermarket | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<bigint>>(new Set());
  const [profilePhoto, setProfilePhoto] = useState<ExternalBlob | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<{ name?: string; email?: string; city?: string; birthDate?: string }>({});

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setCity(userProfile.city || '');
      setSelectedSupermarkets(userProfile.preferredSupermarkets);
      setSelectedCategories(userProfile.preferredCategories);
      setMeetingSupermarket(userProfile.meetingSupermarket || null);
      
      if (userProfile.profilePhoto) {
        setCurrentPhotoUrl(userProfile.profilePhoto.getDirectURL());
      }

      if (userProfile.birthDate) {
        const date = new Date(Number(userProfile.birthDate) / 1000000);
        setBirthDate(date.toISOString().split('T')[0]);
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (favoriteOfferIds.length > 0) {
      setSelectedProducts(new Set(favoriteOfferIds));
    }
  }, [favoriteOfferIds]);

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

  const toggleProduct = (productId: bigint) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
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
    if (!userProfile || !validateForm()) return;

    if (profilePhoto) {
      try {
        await uploadPhoto.mutateAsync(profilePhoto);
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }

    const birthDateTimestamp = birthDate 
      ? BigInt(new Date(birthDate).getTime() * 1000000)
      : undefined;

    saveProfile.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
        preferredSupermarkets: selectedSupermarkets,
        preferredCategories: selectedCategories,
        location: userProfile.location || undefined,
        nearestSupermarket: userProfile.nearestSupermarket || undefined,
        meetingSupermarket: meetingSupermarket || undefined,
        timestamp: BigInt(Date.now() * 1000000),
        profilePhoto: profilePhoto || userProfile.profilePhoto || undefined,
        birthDate: birthDateTimestamp,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleRemovePhoto = async () => {
    try {
      await removePhoto.mutateAsync();
      setProfilePhoto(null);
      setCurrentPhotoUrl(undefined);
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const handleGoClick = () => {
    const productIds = Array.from(selectedProducts);
    addSelectedProducts.mutate(productIds, {
      onSuccess: () => {
        onClose();
        navigate({ to: '/match-portal' });
      },
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="rounded-3xl shadow-soft-xl border-border/50">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary mb-4" />
              <p className="text-muted-foreground">Profiel laden...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-soft-xl border-border/50 animate-scale-in">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex-shrink-0">
              {currentPhotoUrl ? (
                <img 
                  src={currentPhotoUrl} 
                  alt={userProfile?.name || 'Profiel'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <img 
                  src="/assets/generated/default-avatar-transparent.dim_64x64.png" 
                  alt="Standaard avatar" 
                  className="h-full w-full object-contain p-2 opacity-50"
                />
              )}
            </div>
            <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mijn Profiel
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-muted/50 p-1.5 shadow-soft border border-border/50">
            <TabsTrigger value="personal" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">
              <User className="h-4 w-4 mr-1" />
              Gegevens
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">Voorkeuren</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">
              Producten {selectedProducts.size > 0 && `(${selectedProducts.size})`}
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">
              <List className="h-4 w-4 mr-1" />
              Overzicht
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl transition-all duration-300 data-[state=active]:shadow-soft">
              Reviews {userReviews && userReviews.reviewCount > 0n && `(${userReviews.reviewCount.toString()})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6 py-6 animate-fade-in">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Persoonlijke Gegevens</h3>
              
              <ProfilePhotoUpload
                currentPhotoUrl={currentPhotoUrl}
                onPhotoSelected={setProfilePhoto}
                onPhotoRemoved={handleRemovePhoto}
                disabled={saveProfile.isPending || uploadPhoto.isPending || removePhoto.isPending}
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

              <MeetingSupermarketSelector
                selectedSupermarket={meetingSupermarket}
                onSupermarketChange={setMeetingSupermarket}
                userLocation={userProfile?.location}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onClose} className="rounded-full transition-all duration-300 hover:shadow-soft border-border/50">
                Annuleren
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saveProfile.isPending || uploadPhoto.isPending}
                className="rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary"
              >
                {saveProfile.isPending || uploadPhoto.isPending ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 py-6 animate-fade-in">
            {userProfile?.location && userProfile?.nearestSupermarket && (
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-5 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">Gedetecteerde locatie</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dichtstbijzijnde supermarkt: <strong className="text-primary">{supermarketLabels[userProfile.nearestSupermarket]}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Coördinaten: {userProfile.location.latitude.toFixed(4)}, {userProfile.location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-4 font-semibold text-lg">Favoriete Supermarkten</h3>
              <div className="grid gap-3">
                {Object.entries(supermarketLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-muted/50">
                    <Checkbox
                      id={`supermarket-${key}`}
                      checked={selectedSupermarkets.includes(key as Supermarket)}
                      onCheckedChange={() => toggleSupermarket(key as Supermarket)}
                      className="transition-all duration-200"
                    />
                    <Label htmlFor={`supermarket-${key}`} className="cursor-pointer flex-1 transition-colors duration-200 hover:text-primary">
                      {label}
                      {key === userProfile?.nearestSupermarket && (
                        <span className="ml-2 text-xs text-primary font-medium">(Dichtstbijzijnd)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-lg">Favoriete Categorieën</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:bg-muted/50">
                    <Checkbox
                      id={`category-${key}`}
                      checked={selectedCategories.includes(key as ProductCategory)}
                      onCheckedChange={() => toggleCategory(key as ProductCategory)}
                      className="transition-all duration-200"
                    />
                    <Label htmlFor={`category-${key}`} className="cursor-pointer flex-1 transition-colors duration-200 hover:text-primary">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onClose} className="rounded-full transition-all duration-300 hover:shadow-soft border-border/50">
                Annuleren
              </Button>
              <Button onClick={handleSave} disabled={saveProfile.isPending} className="rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary">
                {saveProfile.isPending ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="products" className="py-6 space-y-6 animate-fade-in">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-soft rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  Product Matching
                </CardTitle>
                <CardDescription className="text-sm">
                  Selecteer producten die je wilt kopen. Klik op "Go" om naar het Match Portal te gaan!
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Beschikbare 1+1 Gratis Producten</h3>
              {allOffers.length === 0 ? (
                <p className="text-sm text-muted-foreground p-6 text-center bg-muted/30 rounded-2xl">Geen producten beschikbaar. Ververs de aanbiedingen op de hoofdpagina.</p>
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                  {allOffers.map((offer) => (
                    <div key={Number(offer.id)} className="flex items-center space-x-4 p-4 border border-border/50 rounded-2xl hover:bg-muted/50 transition-all duration-300 hover:shadow-soft group">
                      <Checkbox
                        id={`product-${offer.id}`}
                        checked={selectedProducts.has(offer.id)}
                        onCheckedChange={() => toggleProduct(offer.id)}
                        className="transition-all duration-200"
                      />
                      <img 
                        {...getImageProps(offer.imageUrl, offer.productName)}
                        className="h-14 w-14 object-cover rounded-xl shadow-soft transition-transform duration-300 group-hover:scale-110"
                      />
                      <Label htmlFor={`product-${offer.id}`} className="cursor-pointer flex-1 transition-colors duration-200 group-hover:text-primary">
                        <div>
                          <p className="font-medium">{offer.productName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {supermarketLabels[offer.supermarket]} - €{offer.originalPrice.toFixed(2)}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onClose} className="rounded-full transition-all duration-300 hover:shadow-soft border-border/50">
                Annuleren
              </Button>
              <Button 
                onClick={handleGoClick} 
                disabled={selectedProducts.size === 0 || addSelectedProducts.isPending}
                className="gap-2 rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary"
              >
                {addSelectedProducts.isPending ? 'Bezig...' : 'Go'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="py-6 animate-fade-in">
            <SelectedProductsOverview />
          </TabsContent>

          <TabsContent value="reviews" className="py-6 animate-fade-in">
            {userReviews && (
              <UserReviewsSection 
                reviews={userReviews.reviews}
                averageRating={userReviews.averageRating}
                reviewCount={Number(userReviews.reviewCount)}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
