import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

// Map Material Symbols names to MaterialIcons names
const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  arrow_back: 'arrow-back',
  arrow_forward: 'arrow-forward',
  arrow_upward: 'arrow-upward',
  chat_bubble: 'chat-bubble',
  mic: 'mic',
  keyboard: 'keyboard',
  close: 'close',
  settings: 'settings',
  support_agent: 'support-agent',
  done_all: 'done-all',
  check: 'check',
  share: 'share',
  local_police: 'verified',
  star: 'star',
  payments: 'payment',
  school: 'school',
  history_edu: 'history-edu',
  location_on: 'location-on',
  videocam: 'videocam',
  lock: 'lock',
  calendar_today: 'today',
  currency_bitcoin: 'currency-bitcoin',
  token: 'account-balance-wallet',
  attach_money: 'attach-money',
  add: 'add',
  verified_user: 'verified-user',
  pause: 'pause',
  restart_alt: 'refresh',
  volume_up: 'volume-up',
  sentiment_satisfied: 'sentiment-satisfied',
  spa: 'spa',
  thunderstorm: 'thunderstorm',
  water_drop: 'water-drop',
  local_fire_department: 'local-fire-department',
  photo_camera: 'photo-camera',
  add_a_photo: 'add-a-photo',
  format_quote: 'format-quote',
  check_circle: 'check-circle',
  menu: 'menu',
  notifications: 'notifications',
  headphones: 'headphones',
  article: 'article',
  play_arrow: 'play-arrow',
  book_2: 'book',
  self_improvement: 'self-improvement',
  person: 'person',
  auto_awesome: 'auto-awesome',
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#6b7280' }) => {
  const iconName = iconMap[name] || (name.replace(/_/g, '-') as keyof typeof MaterialIcons.glyphMap);
  
  return (
    <MaterialIcons
      name={iconName}
      size={size}
      color={color}
    />
  );
};
