
import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { SunMedium } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function BrightnessControl() {
  const [brightness, setBrightness] = useState<number>(100);

  // Apply brightness filter to the body
  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`;
    
    // Save brightness setting to localStorage
    localStorage.setItem('app-brightness', brightness.toString());
    
    // Cleanup function
    return () => {
      document.body.style.filter = '';
    };
  }, [brightness]);

  // Load saved brightness on mount
  useEffect(() => {
    const savedBrightness = localStorage.getItem('app-brightness');
    if (savedBrightness) {
      setBrightness(parseInt(savedBrightness));
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
          <SunMedium size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Brightness</h4>
            <span className="text-sm text-muted-foreground">{brightness}%</span>
          </div>
          <Slider
            value={[brightness]}
            min={50}
            max={150}
            step={5}
            onValueChange={(values) => setBrightness(values[0])}
            className="cursor-pointer"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
