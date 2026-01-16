import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <header className="flex justify-between items-center mb-8">
      <h2 className="text-2xl font-normal text-foreground">
        Welcome <span className="font-bold">{userName}!</span>
      </h2>
      
      <div className="flex items-center gap-2 cursor-pointer">
        <Avatar className="h-10 w-10">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt={userName} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <ChevronDown size={16} className="text-muted-foreground" />
      </div>
    </header>
  );
};

export default DashboardHeader;
