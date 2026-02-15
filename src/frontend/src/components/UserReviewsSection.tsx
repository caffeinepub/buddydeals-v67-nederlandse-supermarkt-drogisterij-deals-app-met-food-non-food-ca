import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageSquare } from 'lucide-react';
import StarRating from './StarRating';
import type { Review } from '../backend';

interface UserReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export default function UserReviewsSection({ reviews, averageRating, reviewCount }: UserReviewsSectionProps) {
  if (reviewCount === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Nog geen beoordelingen ontvangen</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Beoordelingen</span>
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} size="lg" />
            <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {reviewCount} {reviewCount === 1 ? 'beoordeling' : 'beoordelingen'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StarRating rating={Number(review.rating)} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.timestamp)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
