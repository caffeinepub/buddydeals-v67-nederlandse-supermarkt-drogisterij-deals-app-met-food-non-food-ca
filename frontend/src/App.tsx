/**
 * BuddyDeals Draft v70 Re-activation Build
 * 
 * This build re-activates the existing BuddyDeals application without any
 * functional, UI, or routing changes. The purpose is to make the draft active
 * again after expiration, ensuring the app shell (Header/Footer + routed content)
 * renders correctly and the home route (/) loads successfully.
 * 
 * No feature modifications, design changes, or backend updates are included.
 */

import { useEffect } from 'react';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import OffersPage from './pages/OffersPage';
import ExplanationPage from './pages/ExplanationPage';
import SharedPurchasesPage from './pages/SharedPurchasesPage';
import OfferDetailPage from './pages/OfferDetailPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import NotificationsPage from './pages/NotificationsPage';
import WeeklyFolderPage from './pages/WeeklyFolderPage';
import FolderPage from './pages/FolderPage';
import CartPage from './pages/CartPage';
import SupermarketSelectionPage from './pages/SupermarketSelectionPage';
import MatchPortalPage from './pages/MatchPortalPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function Layout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showSupermarketSelection = isAuthenticated && !profileLoading && isFetched && userProfile !== null && 
    (!userProfile?.preferredSupermarkets || userProfile?.preferredSupermarkets.length === 0);

  useEffect(() => {
    document.title = 'BuddyDeals - 1+1 Gratis Supermarkt Aanbiedingen';
  }, []);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center supermarket-bg">
        <div className="text-center supermarket-card p-8 rounded-3xl">
          <img 
            src="/assets/generated/buddydeals-logo-bd-collaboration-green-blue-transparent.dim_200x200.png" 
            alt="BuddyDeals Logo" 
            className="h-24 w-24 object-contain mx-auto mb-4 animate-pulse drop-shadow-soft-lg"
          />
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground font-semibold">BuddyDeals laden...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="flex min-h-screen flex-col supermarket-bg">
        <ProfileSetupModal />
        <Toaster />
      </div>
    );
  }

  if (showSupermarketSelection) {
    return (
      <div className="flex min-h-screen flex-col supermarket-bg">
        <SupermarketSelectionPage />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const offersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aanbiedingen',
  component: OffersPage,
});

const explanationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/uitleg',
  component: ExplanationPage,
});

const sharedPurchasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gedeelde-aankopen',
  component: SharedPurchasesPage,
});

const offerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aanbieding/$offerId',
  component: OfferDetailPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notificaties',
  component: NotificationsPage,
});

const weeklyFolderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/folder-van-de-week',
  component: WeeklyFolderPage,
});

const folderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/folder',
  component: FolderPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/winkelwagen',
  component: CartPage,
});

const matchPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/match-portal',
  component: MatchPortalPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  offersRoute,
  explanationRoute,
  sharedPurchasesRoute,
  offerDetailRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  notificationsRoute,
  weeklyFolderRoute,
  folderRoute,
  cartRoute,
  matchPortalRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
