import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetUserNotifications, useIsCallerAdmin, useRestartApp, useGetActiveMatchesCount } from '../hooks/useQueries';
import { useCart } from '../hooks/useCart';
import ProfileModal from './ProfileModal';
import ShareTestLinkButton from './ShareTestLinkButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Menu, User, Bell, ShoppingCart, LogOut, LogIn, RefreshCw, Home, Store, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function Header() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useGetUserNotifications();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const { data: activeMatchesCount = 0 } = useGetActiveMatchesCount();
  const { mutate: restartApp, isPending: isRestarting } = useRestartApp();
  const { cartItems } = useCart();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [previousMatchCount, setPreviousMatchCount] = useState(0);
  const [showPulse, setShowPulse] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Detect new matches and trigger pulse animation
  useEffect(() => {
    if (activeMatchesCount > previousMatchCount && previousMatchCount > 0) {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }
    setPreviousMatchCount(activeMatchesCount);
  }, [activeMatchesCount]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Uitgelogd');
    } else {
      try {
        await login();
        toast.success('Ingelogd');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleRestartClick = () => {
    setShowRestartDialog(true);
  };

  const handleRestartConfirm = () => {
    setShowRestartDialog(false);
    restartApp();
  };

  const handleMatchPortalClick = () => {
    navigate({ to: '/match-portal' });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-3 transition-transform hover:scale-105"
            >
              <img
                src="/assets/generated/buddydeals-logo-bd-collaboration-green-blue-transparent.dim_200x200.png"
                alt="BuddyDeals Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                BuddyDeals
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/' })}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/aanbiedingen' })}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Aanbiedingen
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/folder' })}
                className="gap-2"
              >
                <Store className="h-4 w-4" />
                Folder
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Test Link Button */}
            <ShareTestLinkButton />

            {/* Enlarged BuddyDeals Logo Icon with Match Badge - No Text */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMatchPortalClick}
                className="relative h-12 w-12 hover:bg-accent/50 transition-all"
                title="Ga naar Match Portal"
              >
                <img
                  src="/assets/generated/buddydeals-logo-bd-collaboration-green-blue-transparent.dim_200x200.png"
                  alt="Match Portal"
                  className="h-8 w-8 object-contain"
                />
                {activeMatchesCount > 0 && (
                  <Badge 
                    className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-primary to-secondary ${showPulse ? 'animate-pulse-scale' : ''}`}
                  >
                    {activeMatchesCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/winkelwagen' })}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Notifications Button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: '/notificaties' })}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* Admin Restart Button */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestartClick}
                disabled={isRestarting}
                title="Herstart app en ververs alle data"
                className="relative"
              >
                <RefreshCw className={`h-5 w-5 ${isRestarting ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isAuthenticated ? <User className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && (
                  <>
                    <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                      <User className="mr-2 h-4 w-4" />
                      Mijn profiel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/gedeelde-aankopen' })}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Gedeelde aankopen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => navigate({ to: '/uitleg' })}>
                  Uitleg
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth} disabled={isLoggingIn}>
                  {isAuthenticated ? (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Uitloggen
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {isLoggingIn ? 'Inloggen...' : 'Inloggen'}
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ProfileModal open={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>App herstarten?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je de app wilt herstarten? Alle aanbiedingen, afbeeldingen en gebruikersdata worden opnieuw geladen. 
              Dit kan enkele seconden duren. Je blijft ingelogd tijdens het herstart proces.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestarting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestartConfirm} disabled={isRestarting}>
              {isRestarting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Bezig met herstarten...
                </>
              ) : (
                'Herstart app'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
