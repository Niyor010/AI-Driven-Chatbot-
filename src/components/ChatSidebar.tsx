import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function ChatSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onNewChat,
  onOpenSettings
}: ChatSidebarProps) {

  return (
    <div className={cn(
      "flex flex-col h-full chat-sidebar transition-smooth",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="transition-smooth hover:bg-[hsl(var(--hover-overlay))]"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
        
        {!isCollapsed && (
          <Button
            onClick={onNewChat}
            className="flex-1 ml-3 bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] hover:opacity-90 transition-smooth"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Settings Section */}
          <div className="flex-1 p-4 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start transition-smooth hover:bg-[hsl(var(--hover-overlay))]"
              onClick={onOpenSettings}
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start transition-smooth hover:bg-[hsl(var(--hover-overlay))]"
            >
              <HelpCircle className="h-4 w-4 mr-3" />
              Help & FAQ
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start transition-smooth hover:bg-[hsl(var(--hover-overlay))]"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Log out
            </Button>
          </div>
        </>
      )}
    </div>
  );
}