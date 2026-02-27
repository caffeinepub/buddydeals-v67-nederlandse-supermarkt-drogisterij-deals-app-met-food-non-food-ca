import { useEffect, useState, useRef } from 'react';
import { useGetOffers, useFetchOffersFromAllSupermarkets } from './useQueries';
import { FilterOptions } from '../backend';

interface UseAutoRetryOffersOptions {
  filters: FilterOptions;
  maxRetries?: number;
  enabled?: boolean;
}

interface RetryState {
  attempt: number;
  isRetrying: boolean;
  message: string;
}

export function useAutoRetryOffers({ 
  filters, 
  maxRetries = 3,
  enabled = true 
}: UseAutoRetryOffersOptions) {
  const { data: offers = [], isLoading, isFetched } = useGetOffers(filters);
  const fetchOffers = useFetchOffersFromAllSupermarkets();
  const [retryState, setRetryState] = useState<RetryState>({
    attempt: 0,
    isRetrying: false,
    message: '',
  });
  const hasTriedInitialFetch = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run if enabled and data has been fetched at least once
    if (!enabled || !isFetched || isLoading) {
      return;
    }

    // Check if we have no offers and haven't exceeded max retries
    if (offers.length === 0 && retryState.attempt < maxRetries && !retryState.isRetrying) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      // Calculate exponential backoff delay: 2^attempt seconds (2s, 4s, 8s)
      const delaySeconds = Math.pow(2, retryState.attempt);
      const delayMs = delaySeconds * 1000;

      setRetryState({
        attempt: retryState.attempt + 1,
        isRetrying: true,
        message: `Geen aanbiedingen gevonden. Bezig met opnieuw laden… (poging ${retryState.attempt + 1}/${maxRetries})`,
      });

      // Schedule the retry with exponential backoff
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          await fetchOffers.mutateAsync();
          // If successful and we now have offers, reset retry state
          setRetryState({
            attempt: 0,
            isRetrying: false,
            message: '',
          });
        } catch (error) {
          // If this was the last retry, show final message
          if (retryState.attempt >= maxRetries) {
            setRetryState({
              attempt: retryState.attempt,
              isRetrying: false,
              message: 'Geen aanbiedingen beschikbaar. Probeer later opnieuw.',
            });
          } else {
            // Continue retrying
            setRetryState(prev => ({
              ...prev,
              isRetrying: false,
            }));
          }
        }
      }, delayMs);
    } else if (offers.length > 0 && retryState.attempt > 0) {
      // We have offers now, reset retry state
      setRetryState({
        attempt: 0,
        isRetrying: false,
        message: '',
      });
    }

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [offers.length, isFetched, isLoading, retryState.attempt, retryState.isRetrying, maxRetries, enabled, fetchOffers]);

  // Initial fetch on mount if no offers exist
  useEffect(() => {
    if (enabled && !hasTriedInitialFetch.current && isFetched && offers.length === 0 && !isLoading) {
      hasTriedInitialFetch.current = true;
      fetchOffers.mutate();
    }
  }, [enabled, isFetched, offers.length, isLoading, fetchOffers]);

  return {
    offers,
    isLoading: isLoading || retryState.isRetrying,
    retryState,
    manualRefresh: () => fetchOffers.mutate(),
    isRefreshing: fetchOffers.isPending,
  };
}
