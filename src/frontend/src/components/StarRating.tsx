import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  reviewCount?: number;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showCount = false,
  reviewCount = 0
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= fullStars;
          const isHalf = starNumber === fullStars + 1 && hasHalfStar;

          return (
            <div key={index} className="relative">
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-muted-foreground ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
