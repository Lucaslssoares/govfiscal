import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationBell({ quantidade, onClick }) {
  return (
    <button onClick={onClick} className="relative">
      <Bell size={22} />
      {quantidade > 0 && (
        <Badge className="absolute -top-2 -right-2 text-xs">
          {quantidade}
        </Badge>
      )}
    </button>
  );
}
