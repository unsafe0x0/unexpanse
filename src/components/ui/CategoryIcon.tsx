"use client";

import {
  ForkKnife,
  Car,
  ShoppingBag,
  FilmSlate,
  FirstAid,
  House,
  GraduationCap,
  Airplane,
  Lightning,
  Barbell,
  Sparkle,
  Gift,
  Shield,
  PiggyBank,
  Briefcase,
  Laptop,
  TrendUp,
  Tag,
  IconProps,
} from "@phosphor-icons/react";
import { ComponentType } from "react";

// Registry of all category icon names → Phosphor component
export const CATEGORY_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  "fork-knife":      ForkKnife,
  "car":             Car,
  "shopping-bag":    ShoppingBag,
  "film-slate":      FilmSlate,
  "first-aid":       FirstAid,
  "house":           House,
  "graduation-cap":  GraduationCap,
  "airplane":        Airplane,
  "lightning":       Lightning,
  "barbell":         Barbell,
  "sparkle":         Sparkle,
  "gift":            Gift,
  "shield":          Shield,
  "piggy-bank":      PiggyBank,
  "briefcase":       Briefcase,
  "laptop":          Laptop,
  "trend-up":        TrendUp,
  "tag":             Tag,
};

// Picker options for CategoriesClient
export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP);

interface CategoryIconProps extends IconProps {
  name: string;
}

export function CategoryIcon({ name, size = 18, weight = "regular", ...props }: CategoryIconProps) {
  const Icon = CATEGORY_ICON_MAP[name] ?? Tag;
  return <Icon size={size} weight={weight} {...props} />;
}
