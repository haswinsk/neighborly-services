import { Star } from "lucide-react";

export const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}
      />
    ))}
    <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
  </div>
);
