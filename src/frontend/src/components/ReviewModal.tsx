import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useLeaveReview } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  toUser: Principal;
  sharedPaymentId: bigint;
  otherUserShortId: string;
}

export default function ReviewModal({ open, onClose, toUser, sharedPaymentId, otherUserShortId }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const leaveReview = useLeaveReview();

  const handleSubmit = () => {
    if (rating === 0) {
      return;
    }

    leaveReview.mutate(
      {
        toUser,
        sharedPaymentId,
        rating: BigInt(rating),
        comment: comment.trim() || null,
      },
      {
        onSuccess: () => {
          onClose();
          setRating(0);
          setComment('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Beoordeel gebruiker</DialogTitle>
          <DialogDescription>
            Deel je ervaring met deze gedeelde aankoop
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="mb-2 block">Gebruiker</Label>
            <p className="text-xs font-mono bg-muted px-3 py-2 rounded break-all">
              {otherUserShortId}
            </p>
          </div>

          <div>
            <Label className="mb-3 block">Beoordeling *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && 'Slecht'}
                {rating === 2 && 'Matig'}
                {rating === 3 && 'Gemiddeld'}
                {rating === 4 && 'Goed'}
                {rating === 5 && 'Uitstekend'}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="comment" className="mb-2 block">
              Opmerking (optioneel)
            </Label>
            <Textarea
              id="comment"
              placeholder="Deel je ervaring met deze gebruiker..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 karakters
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={leaveReview.isPending}>
            Annuleren
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || leaveReview.isPending}>
            {leaveReview.isPending ? 'Verzenden...' : 'Beoordeling verzenden'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
