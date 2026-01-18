'use client';

import {
  Shield,
  Flame,
  Route,
  TreePine,
  Building2,
  Droplets,
  BookOpen,
  Heart,
  Truck,
  Lightbulb,
  GraduationCap,
  Scale,
  Users,
  Home,
  Wallet,
  Hammer,
  Gift,
  type LucideIcon,
} from 'lucide-react';
import { ServiceIcon } from '@/types';

const iconMap: Record<ServiceIcon, LucideIcon> = {
  shield: Shield,
  flame: Flame,
  road: Route,
  trees: TreePine,
  building: Building2,
  droplet: Droplets,
  book: BookOpen,
  heart: Heart,
  truck: Truck,
  lightbulb: Lightbulb,
  'graduation-cap': GraduationCap,
  scale: Scale,
  scales: Scale,
  users: Users,
  home: Home,
  wallet: Wallet,
  hammer: Hammer,
  gift: Gift,
};

interface ServiceIconProps {
  icon: ServiceIcon;
  size?: number;
  className?: string;
}

export function ServiceIconComponent({ icon, size = 24, className = '' }: ServiceIconProps) {
  const IconComponent = iconMap[icon] || Building2;
  return <IconComponent size={size} className={className} />;
}

export {
  Shield,
  Flame,
  Route,
  TreePine,
  Building2,
  Droplets,
  BookOpen,
  Heart,
  Truck,
  Lightbulb,
  GraduationCap,
  Scale,
  Users,
  Home,
  Wallet,
  Hammer,
  Gift,
};
