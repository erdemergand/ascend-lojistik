import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, type ThemePreference } from "@/components/theme/theme-provider";

const options: readonly [
  { value: "light"; label: string; icon: typeof Sun },
  { value: "dark"; label: string; icon: typeof Sun },
  { value: "system"; label: string; icon: typeof Sun },
] = [
  { value: "light", label: "Açık tema", icon: Sun },
  { value: "dark", label: "Koyu tema", icon: Moon },
  { value: "system", label: "Sistem teması", icon: Monitor },
];

export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  const index = options.findIndex((option) => option.value === preference);
  const current = options[index] ?? options[2];
  const Icon = current.icon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0 text-header-muted hover:bg-header-accent hover:text-header-foreground"
      onClick={() => setPreference(options[(index + 1) % options.length]?.value ?? "system")}
      aria-label={`${current.label}. Temayı değiştir`}
      title={current.label}
    >
      <Icon className="h-[1.1rem] w-[1.1rem]" />
    </Button>
  );
}
