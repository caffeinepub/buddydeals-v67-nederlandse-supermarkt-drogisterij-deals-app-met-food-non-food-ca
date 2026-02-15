import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCreateSharedPaymentInvitation, useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { FolderOffer, ShoppingItem, PaymentMethod } from '../backend';
import { AlertCircle, Users, Wallet, CreditCard } from 'lucide-react';
import StripeSetupModal from './StripeSetupModal';

interface SharedPaymentModalProps {
  offer: FolderOffer;
  onClose: () => void;
}

export default function SharedPaymentModal({ offer, onClose }: SharedPaymentModalProps) {
  const [participantPrincipal, setParticipantPrincipal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.cash);
  const [error, setError] = useState('');
  const createSharedPaymentInvitation = useCreateSharedPaymentInvitation();
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: isStripeConfigured, isLoading: checkingStripe } = useIsStripeConfigured();
  const [showStripeSetup, setShowStripeSetup] = useState(false);

  // For 1+1 gratis offers, the effective price per item is half the original price
  const halfPrice = offer.originalPrice / 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!participantPrincipal.trim()) {
      setError('Voer een geldig Principal ID in');
      return;
    }

    try {
      // First create the shared payment invitation with payment method
      await createSharedPaymentInvitation.mutateAsync({
        participant: participantPrincipal.trim(),
        offerId: offer.id,
        amount: halfPrice,
        paymentMethod,
      });

      // Then create checkout session for the initiator
      const shoppingItem: ShoppingItem = {
        productName: `${offer.productName} (Gedeelde betaling)`,
        productDescription: `Jouw aandeel in gedeelde aankoop`,
        priceInCents: BigInt(Math.round(halfPrice * 100)),
        quantity: BigInt(1),
        currency: 'eur',
      };

      const session = await createCheckoutSession.mutateAsync([shoppingItem]);
      
      // Redirect to Stripe checkout
      window.location.href = session.url;
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden');
    }
  };

  if (checkingStripe) {
    return null;
  }

  if (!isStripeConfigured) {
    if (!showStripeSetup) {
      setShowStripeSetup(true);
    }
    return <StripeSetupModal onClose={onClose} />;
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src="/assets/generated/ideal-logo-transparent.dim_64x64.png" alt="iDeal" className="h-6 w-6" />
            Samen betalen met iDeal
          </DialogTitle>
          <DialogDescription>
            Deel de kosten van dit product met een andere gebruiker. Jullie betalen elk de helft via iDeal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold">{offer.productName}</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Totaalprijs (1+1 gratis):</span>
                <span className="font-semibold">€{offer.originalPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jouw aandeel:</span>
                <span className="font-bold text-primary text-lg">€{halfPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participant">Principal ID van de andere persoon</Label>
              <Input
                id="participant"
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                value={participantPrincipal}
                onChange={(e) => setParticipantPrincipal(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                De andere persoon moet ingelogd zijn en hun Principal ID met je delen
              </p>
            </div>

            <div className="space-y-3">
              <Label>Betaalmethode</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={PaymentMethod.cash} id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Contant betalen</p>
                      <p className="text-xs text-muted-foreground">Betaal met contant geld bij de supermarkt</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={PaymentMethod.debitCard} id="debitCard" />
                  <Label htmlFor="debitCard" className="flex items-center gap-2 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Met pin betalen</p>
                      <p className="text-xs text-muted-foreground">Betaal met pinpas bij de supermarkt</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Na het aanmaken wordt je doorgestuurd naar iDeal om jouw deel te betalen. 
                De andere persoon ontvangt ook een betaalverzoek. De aankoop wordt pas bevestigd 
                als beide betalingen zijn voltooid.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={createSharedPaymentInvitation.isPending || createCheckoutSession.isPending}
            >
              {createSharedPaymentInvitation.isPending || createCheckoutSession.isPending
                ? 'Bezig...'
                : 'Doorgaan naar betaling'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
