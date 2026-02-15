import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Supermarket } from '../backend';
import MeetingSupermarketSelector from './MeetingSupermarketSelector';
import { CheckCircle2, MapPin } from 'lucide-react';

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

interface ProductSelectionWorkflowProps {
  open: boolean;
  onClose: () => void;
  selectedProductCount: number;
  currentMeetingSupermarket: Supermarket | null;
  onSupermarketSelected: (supermarket: Supermarket) => void;
  onConfirm: () => void;
  userLocation?: { latitude: number; longitude: number };
}

export default function ProductSelectionWorkflow({
  open,
  onClose,
  selectedProductCount,
  currentMeetingSupermarket,
  onSupermarketSelected,
  onConfirm,
  userLocation,
}: ProductSelectionWorkflowProps) {
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [selectedSupermarket, setSelectedSupermarket] = useState<Supermarket | null>(
    currentMeetingSupermarket
  );

  const handleSupermarketChange = (supermarket: Supermarket) => {
    setSelectedSupermarket(supermarket);
    onSupermarketSelected(supermarket);
  };

  const handleConfirm = () => {
    if (selectedSupermarket) {
      setStep('confirm');
    }
  };

  const handleFinalConfirm = () => {
    onConfirm();
    onClose();
    setStep('select');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleCloseDialog = () => {
    onClose();
    setStep('select');
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-soft-xl border-border/50 animate-scale-in">
        {step === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                <MapPin className="h-7 w-7 text-primary" />
                Kies Supermarkt voor Ontmoeting
              </DialogTitle>
              <DialogDescription className="text-base">
                Je hebt {selectedProductCount} product{selectedProductCount !== 1 ? 'en' : ''} geselecteerd. 
                Kies nu bij welke supermarkt je wilt afspreken met gematchte gebruikers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <MeetingSupermarketSelector
                selectedSupermarket={selectedSupermarket}
                onSupermarketChange={handleSupermarketChange}
                userLocation={userLocation}
              />

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="rounded-full transition-all duration-300 hover:shadow-soft border-border/50"
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedSupermarket}
                  className="rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary"
                >
                  Bevestigen
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'confirm' && selectedSupermarket && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-primary" />
                Bevestiging
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-soft rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={supermarketLogos[selectedSupermarket]}
                      alt={supermarketLabels[selectedSupermarket]}
                      className="h-16 w-16 object-contain"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Afspraaklocatie ingesteld bij:</p>
                      <p className="text-2xl font-bold text-primary">
                        {supermarketLabels[selectedSupermarket]}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-muted/50 rounded-2xl p-5 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  Je hebt <strong className="text-foreground">{selectedProductCount} product{selectedProductCount !== 1 ? 'en' : ''}</strong> geselecteerd 
                  en <strong className="text-foreground">{supermarketLabels[selectedSupermarket]}</strong> gekozen als ontmoetingslocatie.
                </p>
                <p className="text-sm text-muted-foreground mt-3">
                  Wanneer andere gebruikers dezelfde producten selecteren, worden jullie automatisch gematched 
                  en kunnen jullie afspreken bij deze supermarkt!
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="rounded-full transition-all duration-300 hover:shadow-soft border-border/50"
                >
                  Terug
                </Button>
                <Button
                  onClick={handleFinalConfirm}
                  className="rounded-full transition-all duration-300 hover:shadow-soft-lg bg-gradient-to-r from-primary to-secondary"
                >
                  Voltooien
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
