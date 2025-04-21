
import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  icon: LucideIcon;
}

export default function PlaceholderPage({ title, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Icon className="text-zippy-blue" />
        {title}
      </h1>
      
      <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-zippy-blue/10 flex items-center justify-center text-zippy-blue mb-4">
          <Icon size={32} />
        </div>
        <h2 className="text-xl font-medium mb-2">Coming Soon</h2>
        <p className="text-gray-400 text-center max-w-md">
          The {title} page is currently under development. 
          Check back later for updates or contact support for more information.
        </p>
      </div>
    </div>
  );
}
