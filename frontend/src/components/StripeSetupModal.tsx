import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSetStripeConfiguration } from '../hooks/useQueries';
import { AlertCircle, CreditCard } from 'lucide-react';
import { StripeConfiguration } from '../backend';

interface StripeSetupModalProps {
  onClose: () => void;
}

export default function StripeSetupModal({ onClose }: StripeSetupModalProps) {
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const setStripeConfig = useSetStripeConfiguration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!secretKey.trim()) {
      setError('Voer een geldige Stripe Secret Key in');
      return;
    }

    try {
      const config: StripeConfiguration = {
        secretKey: secretKey.trim(),
        allowedCountries: ['NL', 'BE', 'DE', 'FR', 'GB'],
      };

      await setStripeConfig.mutateAsync(config);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het configureren van Stripe');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Configuratie
          </DialogTitle>
          <DialogDescription>
            Configureer Stripe om iDeal-betalingen mogelijk te maken. Je hebt een Stripe account nodig.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Deze functie vereist een Stripe account. Ga naar{' '}
                <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline">
                  stripe.com
                </a>{' '}
                om een account aan te maken en je API keys te verkrijgen.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="secretKey">Stripe Secret Key</Label>
              <Input
                id="secretKey"
                type="password"
                placeholder="sk_test_..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Je kunt je Secret Key vinden in je Stripe Dashboard onder Developers → API keys
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={setStripeConfig.isPending}>
              {setStripeConfig.isPending ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
