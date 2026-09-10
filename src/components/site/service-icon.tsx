import { Anchor, Bell, Boxes, ConstructionIcon, Plane, Radar, Route, Shield, Ship, Truck, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  truck: Truck,
  ship: Ship,
  anchor: Anchor,
  plane: Plane,
  route: Route,
  crane: ConstructionIcon,
  boxes: Boxes,
  radar: Radar,
  wallet: Wallet,
  shield: Shield,
  bell: Bell,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Boxes;
  return <Icon className={className} aria-hidden="true" />;
}
