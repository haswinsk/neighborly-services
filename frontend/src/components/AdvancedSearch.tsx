import { useState, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdvancedSearchProps {
  onSearch: (query: string, minPrice: number, maxPrice: number, minRating: number) => void;
  onClose?: () => void;
}

export const AdvancedSearch = ({ onSearch, onClose }: AdvancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(() => {
    onSearch(query, minPrice, maxPrice, minRating);
  }, [query, minPrice, maxPrice, minRating, onSearch]);

  const handleReset = useCallback(() => {
    setQuery('');
    setMinPrice(0);
    setMaxPrice(5000);
    setMinRating(0);
  }, []);

  return (
    <div className="w-full" role="search">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <label htmlFor="search-input" className="sr-only">
              Search services and providers
            </label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <input
              id="search-input"
              type="text"
              placeholder="Search services, providers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-modern w-full pl-10"
              aria-label="Search query"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Advanced filters"
            aria-expanded={isOpen}
            aria-controls="advanced-filters"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div id="advanced-filters" className="mt-4 p-4 bg-white rounded-lg border border-gray-200 space-y-6 animate-slide-in">
          {/* Price Range */}
          <fieldset>
            <legend className="font-semibold text-sm mb-3">Price Range</legend>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">₹{minPrice} - ₹{maxPrice}</span>
            </div>
            <div className="space-y-2">
              <div>
                <label htmlFor="min-price" className="sr-only">Minimum price</label>
                <input
                  id="min-price"
                  type="range"
                  min="0"
                  max="5000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                  className="w-full cursor-pointer"
                  aria-label="Minimum price"
                  aria-valuemin={0}
                  aria-valuemax={5000}
                  aria-valuenow={minPrice}
                  aria-valuetext={`₹${minPrice}`}
                />
              </div>
              <div>
                <label htmlFor="max-price" className="sr-only">Maximum price</label>
                <input
                  id="max-price"
                  type="range"
                  min="0"
                  max="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                  className="w-full cursor-pointer"
                  aria-label="Maximum price"
                  aria-valuemin={0}
                  aria-valuemax={5000}
                  aria-valuenow={maxPrice}
                  aria-valuetext={`₹${maxPrice}`}
                />
              </div>
            </div>
          </fieldset>

          {/* Rating Filter */}
          <fieldset>
            <legend className="font-semibold text-sm mb-3">Minimum Rating</legend>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-primary font-medium" aria-live="polite">{minRating.toFixed(1)} ⭐</span>
            </div>
            <label htmlFor="rating-range" className="sr-only">Minimum rating</label>
            <input
              id="rating-range"
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full cursor-pointer"
              aria-label="Minimum rating"
              aria-valuemin={0}
              aria-valuemax={5}
              aria-valuenow={minRating}
              aria-valuetext={`${minRating.toFixed(1)} stars`}
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {[0, 3, 3.5, 4, 4.5, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    minRating === rating
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating === 0 ? 'All' : `${rating}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              className="flex-1" 
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
