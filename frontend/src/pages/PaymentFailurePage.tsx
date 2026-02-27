import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Betaling Mislukt</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Je betaling kon niet worden verwerkt. Dit kan verschillende redenen hebben, 
              zoals onvoldoende saldo of een geannuleerde transactie.
            </p>
            <p className="text-muted-foreground">
              Je kunt het opnieuw proberen of contact opnemen met je bank voor meer informatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={() => navigate({ to: '/' })}>
                Terug naar aanbiedingen
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: '/gedeelde-aankopen' })}>
                Bekijk gedeelde aankopen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
