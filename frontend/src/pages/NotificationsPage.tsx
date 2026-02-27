import { useGetUserNotifications, useMarkNotificationAsRead, useGetAllOffers, useGetUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Heart, User, ShoppingCart, MapPin } from 'lucide-react';
import { Notification, Supermarket } from '../backend';
import { getImageProps } from '../lib/imageUtils';
import { useMemo } from 'react';
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

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useGetUserNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }

    if (notification.notificationType.__kind__ === 'productMatch') {
      const { offerId } = notification.notificationType.productMatch;
      navigate({ to: '/aanbieding/$offerId', params: { offerId: offerId.toString() } });
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Zojuist';
    if (diffMins < 60) return `${diffMins} minuten geleden`;
    if (diffHours < 24) return `${diffHours} uur geleden`;
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  if (isLoading) {
    return (
      <div className="min-h-screen supermarket-bg">
        <div className="container py-8 supermarket-texture relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="h-32 rounded-lg bg-muted animate-pulse mb-4 backdrop-blur-sm" />
            <div className="h-32 rounded-lg bg-muted animate-pulse mb-4 backdrop-blur-sm" />
            <div className="h-32 rounded-lg bg-muted animate-pulse backdrop-blur-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen supermarket-bg">
      <div className="container py-8 supermarket-texture relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bell className="h-8 w-8 text-primary" />
              Notificaties
            </h1>
            <p className="text-muted-foreground">
              Bekijk je productmatches en samenwerkingsmogelijkheden
            </p>
          </div>

          {notifications.length === 0 ? (
            <Card className="supermarket-card">
              <CardContent className="py-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Geen notificaties</p>
                <p className="text-sm text-muted-foreground">
                  Selecteer producten in je profiel om matches te ontvangen
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {unreadNotifications.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    Nieuw
                    <Badge variant="destructive">{unreadNotifications.length}</Badge>
                  </h2>
                  <div className="space-y-3">
                    {unreadNotifications.map((notification) => (
                      <NotificationCard
                        key={Number(notification.id)}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {readNotifications.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Eerder</h2>
                  <div className="space-y-3">
                    {readNotifications.map((notification) => (
                      <NotificationCard
                        key={Number(notification.id)}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
  formatDate: (timestamp: bigint) => string;
}

function NotificationCard({ notification, onClick, formatDate }: NotificationCardProps) {
  const { data: allOffers = [] } = useGetAllOffers();

  const offer = useMemo(() => {
    if (notification.notificationType.__kind__ === 'productMatch') {
      const offerId = notification.notificationType.productMatch.offerId;
      return allOffers.find(o => o.id === offerId);
    }
    return undefined;
  }, [allOffers, notification]);

  if (notification.notificationType.__kind__ === 'productMatch') {
    const { matchedUser } = notification.notificationType.productMatch;
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md supermarket-card ${!notification.isRead ? 'border-primary bg-primary/5' : ''}`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Product Match Gevonden!</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {formatDate(notification.createdAt)}
                </CardDescription>
              </div>
            </div>
            {!notification.isRead && (
              <Badge variant="destructive" className="text-xs">Nieuw</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            {offer && (
              <img 
                {...getImageProps(offer.imageUrl, offer.productName)}
                className="h-16 w-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="text-sm mb-2">
                Je hebt een match met een andere gebruiker voor{' '}
                <strong>{offer?.productName || 'een product'}</strong>!
              </p>
            </div>
          </div>
          
          <MatchedUserInfo userPrincipal={matchedUser} />
          
          <Button size="sm" className="w-full mt-3 gap-2">
            <ShoppingCart className="h-4 w-4" />
            Bekijk product
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

interface MatchedUserInfoProps {
  userPrincipal: Principal;
}

function MatchedUserInfo({ userPrincipal }: MatchedUserInfoProps) {
  const { data: userProfile } = useGetUserProfile(userPrincipal);
  const userShort = userPrincipal.toString().slice(0, 8) + '...';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        <div className="h-6 w-6 rounded-full overflow-hidden bg-background border border-border flex-shrink-0">
          {userProfile?.profilePhoto ? (
            <img 
              src={userProfile.profilePhoto.getDirectURL()} 
              alt={userProfile.name || 'Gebruiker'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <img 
              src="/assets/generated/default-avatar-transparent.dim_64x64.png" 
              alt="Standaard avatar" 
              className="h-full w-full object-contain p-0.5 opacity-50"
            />
          )}
        </div>
        
        <User className="h-3 w-3" />
        <span>
          Gebruiker: {userProfile?.name || userShort}
        </span>
      </div>
      
      {userProfile?.meetingSupermarket && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 p-2 rounded">
          <MapPin className="h-3 w-3" />
          <span>
            Afspraak bij: <strong>{supermarketLabels[userProfile.meetingSupermarket]}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
