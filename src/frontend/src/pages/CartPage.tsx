import { useCart } from '../hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
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

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;

  const handleGoToMatchPortal = () => {
    navigate({ to: '/match-portal' });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen supermarket-bg">
        <div className="container py-20 supermarket-texture relative z-10">
          <div className="text-center animate-fade-in">
            <div className="inline-block p-8 rounded-3xl bg-muted/30 mb-6 backdrop-blur-sm">
              <ShoppingCart className="h-20 w-20 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Je winkelwagen is leeg</h2>
            <p className="text-muted-foreground mb-6">
              Voeg producten toe om te beginnen met winkelen
            </p>
            <Button
              onClick={() => navigate({ to: '/' })}
              className="rounded-xl bg-gradient-to-r from-primary to-secondary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar aanbiedingen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-8 supermarket-texture relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Winkelwagen
            </h1>
            <p className="text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? 'product' : 'producten'} in je winkelwagen
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/' })}
            className="rounded-xl supermarket-card"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Verder winkelen
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const actionPrice = item.offer.originalPrice / 2;
              const itemTotal = actionPrice * item.quantity;

              return (
                <Card key={Number(item.offer.id)} className="overflow-hidden border-border/50 shadow-soft supermarket-card">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                        <img
                          {...getImageProps(item.offer.imageUrl, item.offer.productName)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 line-clamp-2">{item.offer.productName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {supermarketLabels[item.offer.supermarket]}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(actionPrice)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(item.offer.originalPrice)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.offer.id)}
                          className="rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.offer.id, item.quantity - 1)}
                            className="h-8 w-8 rounded-lg"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.offer.id, item.quantity + 1)}
                            className="h-8 w-8 rounded-lg"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold">{formatPrice(itemTotal)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-border/50 shadow-soft-lg supermarket-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Overzicht</h3>
                <Separator className="mb-4" />
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotaal</span>
                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verzendkosten</span>
                    <span className="font-medium text-success">Gratis</span>
                  </div>
                </div>
                <Separator className="mb-4" />
                <div className="flex justify-between mb-6">
                  <span className="font-semibold text-lg">Totaal</span>
                  <span className="font-bold text-2xl text-primary">{formatPrice(getTotalPrice())}</span>
                </div>
                <Button
                  onClick={handleGoToMatchPortal}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-soft-lg transition-all duration-300 hover:scale-[1.02] mb-3"
                  size="lg"
                >
                  Go
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={clearCart}
                >
                  Winkelwagen legen
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Alle prijzen zijn per stuk bij 1+1 gratis actie
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
