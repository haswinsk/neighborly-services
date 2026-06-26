import L from 'leaflet';

export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'Plumbing': '#3b82f6',      // Blue
    'Electrical': '#fbbf24',    // Yellow
    'Carpentry': '#92400e',     // Brown
    'AC Repair': '#06b6d4',     // Cyan
    'Cleaning': '#22c55e',      // Green
    'Tutoring': '#a855f7',      // Purple
    'Painting': '#f97316',      // Orange
    'Pest Control': '#ef4444',  // Red
  };

  return colorMap[category] || '#6b7280'; // Default Gray
};

/**
 * Creates a custom Leaflet DIV icon for a service category
 */
export const createCategoryMarker = (category: string, label?: string) => {
  const color = getCategoryColor(category);
  const isSelected = label?.includes('selected');

  const html = `
    <div style="
      background-color: ${color};
      border: ${isSelected ? '4px' : '2px'} solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      font-weight: bold;
      color: white;
      font-size: 18px;
    ">
      ${getIconEmoji(category)}
    </div>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

/**
 * Creates a customer location marker (green animated dot) — shown on provider's view
 */
export const createCustomerMarker = () => {
  const html = `
    <div style="
      background-color: #22c55e;
      border: 3px solid white;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px rgba(34,197,94,0.7);
      animation: pulseGreen 2s infinite;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>
    <style>
      @keyframes pulseGreen {
        0%, 100% { box-shadow: 0 0 10px rgba(34,197,94,0.6); }
        50% { box-shadow: 0 0 22px rgba(34,197,94,0.9); }
      }
    </style>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
};

/**
 * Creates a user location marker (blue animated dot)
 */
export const createUserMarker = () => {
  const html = `
    <div style="
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
      animation: pulse 2s infinite;
    ">
      <div style="
        background-color: white;
        border-radius: 50%;
        width: 8px;
        height: 8px;
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
      }
    </style>
  `;

  return L.divIcon({
    html,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

/**
 * Returns emoji for service category
 */
export const getIconEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'Plumbing': '🔧',
    'Electrical': '⚡',
    'Carpentry': '🔨',
    'AC Repair': '❄️',
    'Cleaning': '✨',
    'Tutoring': '📚',
    'Painting': '🎨',
    'Pest Control': '🦟',
  };

  return emojiMap[category] || '📍';
};

/**
 * Get all unique categories
 */
export const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'AC Repair',
  'Cleaning',
  'Tutoring',
  'Painting',
  'Pest Control',
] as const;

export type Category = typeof CATEGORIES[number];
