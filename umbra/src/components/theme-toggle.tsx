import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./theme-provider";

export function DarkModeToggle() {
  const { toggleTheme } = useTheme();

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="relative overflow-hidden hover:cursor-pointer"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
