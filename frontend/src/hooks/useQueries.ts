import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { FolderOffer, FilterOptions, UserProfile, Supermarket, ProductCategory, SharedPayment, ShoppingItem, StripeConfiguration, UserReviews, Notification, Match, UserProductOverview, PaymentMethod } from '../backend';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profiel opgeslagen');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij opslaan: ${error.message}`);
    },
  });
}

export function useUploadProfilePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photo: ExternalBlob) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.uploadProfilePhoto(photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profielfoto geüpload');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij uploaden foto: ${error.message}`);
    },
  });
}

export function useRemoveProfilePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.removeProfilePhoto();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profielfoto verwijderd');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij verwijderen foto: ${error.message}`);
    },
  });
}

export function useGetUserProfile(userPrincipal: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) throw new Error('Actor of principal niet beschikbaar');
      return actor.getUserProfile(userPrincipal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useGetOffers(filters: FilterOptions) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FolderOffer[]>({
    queryKey: ['offers', filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOffers(filters);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useGetAllOffers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FolderOffer[]>({
    queryKey: ['allOffers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOffers({});
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSearchOffers(searchText: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FolderOffer[]>({
    queryKey: ['searchOffers', searchText],
    queryFn: async () => {
      if (!actor || searchText.length < 2) return [];
      return actor.searchOffers(searchText);
    },
    enabled: !!actor && !actorFetching && searchText.length >= 2,
  });
}

export function useGetFavoriteOffers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FolderOffer[]>({
    queryKey: ['favoriteOffers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavoriteOffers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useFetchOffersFromAllSupermarkets() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      await Promise.all([
        actor.fetchOffersFromAlbertHeijn(),
        actor.fetchOffersFromJumbo(),
        actor.fetchOffersFromLidl(),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['allOffers'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteOffers'] });
      toast.success('Aanbiedingen bijgewerkt');
    },
    onError: (error: Error) => {
      console.error('Fout bij ophalen aanbiedingen:', error.message);
    },
  });
}

export function useGetSharedPayments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SharedPayment[]>({
    queryKey: ['sharedPayments'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getSharedOfferPayments(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreateSharedPaymentInvitation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ participant, offerId, amount, paymentMethod }: { participant: string; offerId: bigint; amount: number; paymentMethod: PaymentMethod }) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      const participantPrincipal = Principal.fromText(participant);
      return actor.createSharedPaymentInvitation(participantPrincipal, offerId, amount, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedPayments'] });
      toast.success('Gedeelde betaling uitnodiging aangemaakt');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij aanmaken gedeelde betaling: ${error.message}`);
    },
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      toast.success('Stripe configuratie opgeslagen');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij opslaan Stripe configuratie: ${error.message}`);
    },
  });
}

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      return session;
    },
    onError: (error: Error) => {
      toast.error(`Fout bij aanmaken checkout sessie: ${error.message}`);
    },
  });
}

export function useGetUserReviews(userPrincipal: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserReviews>({
    queryKey: ['userReviews', userPrincipal.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.getUserReviews(userPrincipal);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useLeaveReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      toUser, 
      sharedPaymentId, 
      rating, 
      comment 
    }: { 
      toUser: Principal; 
      sharedPaymentId: bigint; 
      rating: bigint; 
      comment: string | null;
    }) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.leaveReview(toUser, sharedPaymentId, rating, comment);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userReviews', variables.toUser.toString()] });
      queryClient.invalidateQueries({ queryKey: ['sharedPayments'] });
      toast.success('Beoordeling succesvol achtergelaten');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij beoordelen: ${error.message}`);
    },
  });
}

export function useGetFavoriteOfferIds() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['favoriteOfferIds'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFavoriteOfferIds();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddUserSelectedProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productIds: bigint[]) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.addUserSelectedProducts(productIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteOfferIds'] });
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['productMatches'] });
      queryClient.invalidateQueries({ queryKey: ['userProductOverview'] });
      queryClient.invalidateQueries({ queryKey: ['activeMatchesCount'] });
      toast.success('Producten toegevoegd voor matching');
    },
    onError: (error: Error) => {
      toast.error(`Fout bij toevoegen producten: ${error.message}`);
    },
  });
}

export function useGetUserNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['userNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserNotifications();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
    },
    onError: (error: Error) => {
      toast.error(`Fout bij markeren notificatie: ${error.message}`);
    },
  });
}

export function useGetProductMatches() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Match[]>({
    queryKey: ['productMatches'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getProductMatches(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });
}

export function useGetActiveMatchesCount() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<number>({
    queryKey: ['activeMatchesCount'],
    queryFn: async () => {
      if (!actor || !identity) return 0;
      const principal = identity.getPrincipal();
      const matches = await actor.getProductMatches(principal);
      
      // Count unique matches (deduplicate by matched users)
      const uniqueMatchedUsers = new Set<string>();
      matches.forEach(match => {
        const otherUser = match.user1.toString() === principal.toString() 
          ? match.user2.toString() 
          : match.user1.toString();
        uniqueMatchedUsers.add(otherUser);
      });
      
      return uniqueMatchedUsers.size;
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 30000,
  });
}

export function useAddFavoriteOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: bigint) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.addFavoriteOffer(offerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteOfferIds'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteOffers'] });
    },
    onError: (error: Error) => {
      toast.error(`Fout bij toevoegen favoriet: ${error.message}`);
    },
  });
}

export function useRemoveFavoriteOffer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId: bigint) => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      return actor.removeFavoriteOffer(offerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteOfferIds'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteOffers'] });
    },
    onError: (error: Error) => {
      toast.error(`Fout bij verwijderen favoriet: ${error.message}`);
    },
  });
}

export function useGetUserProductOverview() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProductOverview>({
    queryKey: ['userProductOverview'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor of identity niet beschikbaar');
      const principal = identity.getPrincipal();
      return actor.getUserProductOverview(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRestartApp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor niet beschikbaar');
      
      // Show initial loading toast
      toast.loading('App wordt herstart...', { id: 'restart-toast' });
      
      // Call backend restart - this clears backend cache and reloads all offers
      await actor.restart();
      
      // Wait for backend to complete restart and reload data
      await new Promise(resolve => setTimeout(resolve, 1500));
    },
    onSuccess: async () => {
      // Update loading toast
      toast.loading('Data wordt ververst...', { id: 'restart-toast' });
      
      // Clear all React Query caches
      queryClient.clear();
      
      // Wait a moment for cache to clear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Invalidate and refetch all queries to get fresh data
      await queryClient.invalidateQueries();
      
      // Wait for queries to refetch
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dismiss loading toast and show success
      toast.dismiss('restart-toast');
      toast.success('App succesvol herstart! Alle data is opnieuw geladen.', {
        duration: 4000,
      });
      
      // Reload the page to ensure complete refresh
      window.location.href = '/';
    },
    onError: (error: Error) => {
      toast.dismiss('restart-toast');
      toast.error(`Fout bij herstarten app: ${error.message}`);
    },
  });
}

export function useGetTestLink() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['testLink'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getTestLink();
    },
    enabled: !!actor && !actorFetching,
    staleTime: Infinity,
  });
}
