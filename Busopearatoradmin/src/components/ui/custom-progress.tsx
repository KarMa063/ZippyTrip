
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface CustomProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

const CustomProgress = ({ value, className, indicatorClassName }: CustomProgressProps) => {
  const { theme } = useTheme();
  
  // Create a style object for the progress indicator color
  const customStyles: React.CSSProperties = {};
  
  // Only apply custom styling if indicatorClassName is provided
  if (indicatorClassName) {
    // Extract the color name from the bg-* class
    const colorMatch = indicatorClassName.match(/bg-(\w+(-\d+)?)/);
    if (colorMatch && colorMatch[1]) {
      // Apply as a custom property
      customStyles['--progress-foreground'] = `hsl(var(--${colorMatch[1]}))`;
    }
  }
  
  // Add theme-specific styling
  const progressClass = cn(
    "",
    theme === "light" ? "bg-gray-200" : "",
    className
  );
  
  return (
    <Progress 
      value={value} 
      className={progressClass}
      // Apply styles directly to the component
      style={customStyles}
    />
  );
};

export { CustomProgress };
