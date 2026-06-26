import { CheckCircle, Star, TrendingUp } from "lucide-react";
import { memo, useMemo } from "react";

interface ProviderBadgeProps {
  rating: number;
  reviewCount: number;
}

const ProviderBadgeComponent = ({ rating, reviewCount }: ProviderBadgeProps) => {
  const badges = useMemo(() => {
    const badgeList = [];

    // Verified Professional (rating > 4.5 and reviews > 10)
    if (rating > 4.5 && reviewCount > 10) {
      badgeList.push(
        <div
          key="verified"
          className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold"
          title="Verified professional with excellent reviews"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Verified
        </div>
      );
    }

    // Top Rated (rating >= 4.8)
    if (rating >= 4.8) {
      badgeList.push(
        <div
          key="toprated"
          className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold"
          title="Top rated professional"
        >
          <Star className="h-3.5 w-3.5 fill-current" />
          Top Rated
        </div>
      );
    }

    // Trending (rating >= 4.6 and reviews > 20)
    if (rating >= 4.6 && reviewCount > 20) {
      badgeList.push(
        <div
          key="trending"
          className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold"
          title="Popular choice among customers"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Popular
        </div>
      );
    }

    return badgeList;
  }, [rating, reviewCount]);

  if (badges.length === 0) return null;

  return <div className="flex flex-wrap gap-2">{badges}</div>;
};

export const ProviderBadge = memo(ProviderBadgeComponent);

export default ProviderBadge;
