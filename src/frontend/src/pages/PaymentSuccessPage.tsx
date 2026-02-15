import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['sharedPayments'] });
  }, [queryClient]);

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Betaling Geslaagd!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Je betaling is succesvol verwerkt. Zodra de andere persoon ook heeft betaald, 
              wordt de aankoop bevestigd en kun je deze terugvinden bij je gedeelde aankopen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={() => navigate({ to: '/gedeelde-aankopen' })}>
                Bekijk gedeelde aankopen
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/' })}>
                Terug naar aanbiedingen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
