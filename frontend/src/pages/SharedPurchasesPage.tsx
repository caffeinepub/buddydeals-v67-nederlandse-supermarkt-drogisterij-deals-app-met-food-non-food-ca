import { useState, useMemo } from 'react';
import { useGetSharedPayments, useGetAllOffers, useGetUserReviews } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, ArrowLeft, Star, Wallet, CreditCard } from 'lucide-react';
import { Supermarket, SharedPayment, PaymentMethod } from '../backend';
import ReviewModal from '../components/ReviewModal';
import { Principal } from '@icp-sdk/core/principal';

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

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.cash]: 'Contant',
  [PaymentMethod.debitCard]: 'Pin',
};

interface SharedPaymentCardProps {
  payment: SharedPayment;
  currentUserPrincipal: Principal;
}

function SharedPaymentCard({ payment, currentUserPrincipal }: SharedPaymentCardProps) {
  const { data: allOffers = [] } = useGetAllOffers();
  const navigate = useNavigate();
  const [showReviewModal, setShowReviewModal] = useState(false);

  const offer = useMemo(() => {
    return allOffers.find(o => o.id === payment.offerId);
  }, [allOffers, payment.offerId]);

  const isInitiator = currentUserPrincipal.toString() === payment.initiator.toString();
  const otherPartyPrincipal = isInitiator ? payment.participant : payment.initiator;
  const otherParty = otherPartyPrincipal.toString();

  const { data: otherUserReviews } = useGetUserReviews(otherPartyPrincipal);

  if (!offer) {
    return null;
  }

  const formatPrice = (price: number) => `€${price.toFixed(2)}`;

  const hasReviewed = otherUserReviews?.reviews.some(
    (review) => 
      review.reviewer.toString() === currentUserPrincipal.toString() &&
      review.sharedPaymentId.toString() === payment.invitationId.toString()
  );

  const PaymentMethodIcon = payment.paymentMethod === PaymentMethod.cash ? Wallet : CreditCard;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow supermarket-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{offer.productName}</CardTitle>
              <p className="text-sm text-muted-foreground">{supermarketLabels[offer.supermarket]}</p>
            </div>
            <Badge variant={payment.completed ? "default" : "secondary"} className="gap-1">
              {payment.completed ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Voltooid
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  In behandeling
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jouw aandeel:</span>
              <span className="font-semibold text-primary">{formatPrice(payment.amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Totaal product:</span>
              <span className="font-semibold">{formatPrice(payment.amount * 2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Betaalmethode:</span>
              <div className="flex items-center gap-1.5">
                <PaymentMethodIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">{paymentMethodLabels[payment.paymentMethod]}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">
                {isInitiator ? 'Gedeeld met:' : 'Geïnitieerd door:'}
              </p>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                {otherParty.slice(0, 20)}...
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate({ to: '/aanbieding/$offerId', params: { offerId: offer.id.toString() } })}
              >
                Bekijk aanbieding
              </Button>
              {payment.completed && !hasReviewed && (
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => setShowReviewModal(true)}
                >
                  <Star className="h-3 w-3" />
                  Beoordeel
                </Button>
              )}
              {payment.completed && hasReviewed && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-1"
                  disabled
                >
                  <CheckCircle className="h-3 w-3" />
                  Beoordeeld
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showReviewModal && (
        <ReviewModal
          open={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          toUser={otherPartyPrincipal}
          sharedPaymentId={payment.invitationId}
          otherUserShortId={otherParty}
        />
      )}
    </>
  );
}

export default function SharedPurchasesPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: sharedPayments = [], isLoading } = useGetSharedPayments();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen supermarket-bg">
        <div className="container py-8 supermarket-texture relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Log in om je gedeelde aankopen te zien</h2>
            <p className="text-muted-foreground mb-6">
              Je moet ingelogd zijn om je gedeelde aankopen te bekijken.
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar aanbiedingen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentUserPrincipal = identity.getPrincipal();

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-8 supermarket-texture relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-4 supermarket-card">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar aanbiedingen
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <img src="/assets/generated/shared-purchase-icon-transparent.dim_32x32.png" alt="" className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Gedeelde Aankopen</h1>
            </div>
            <p className="text-muted-foreground">
              Bekijk alle producten die je samen met anderen hebt gekocht via gedeelde iDeal-betalingen.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-lg bg-muted animate-pulse backdrop-blur-sm" />
              ))}
            </div>
          ) : sharedPayments.length === 0 ? (
            <Card className="supermarket-card">
              <CardContent className="py-12 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nog geen gedeelde aankopen</h3>
                <p className="text-muted-foreground mb-6">
                  Je hebt nog geen producten samen met anderen gekocht. Bekijk aanbiedingen en gebruik de 
                  "Samen betalen met iDeal" functie om kosten te delen.
                </p>
                <Button onClick={() => navigate({ to: '/' })}>
                  Bekijk aanbiedingen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sharedPayments.map((payment, index) => (
                <SharedPaymentCard 
                  key={index} 
                  payment={payment} 
                  currentUserPrincipal={currentUserPrincipal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
