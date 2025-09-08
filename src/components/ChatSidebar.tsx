import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  X,
  Globe,
  Code,
  Image,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
  conversations: Array<{
    id: string;
    title: string;
    timestamp: string;
  }>;
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
}

export function ChatSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onNewChat,
  conversations,
  activeConversationId,
  onSelectConversation
}: ChatSidebarProps) {
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

  const tools = [
    { icon: Globe, label: "Browse with Bing", isPro: true },
    { icon: Code, label: "Code Interpreter", isPro: true },
    { icon: Image, label: "DALL·E", isPro: true },
    { icon: Brain, label: "Memory", isPro: false },
  ];

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
          {/* Tools Section */}
          <div className="px-4 pb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tools</h3>
            <div className="space-y-1">
              {tools.map((tool) => (
                <Button
                  key={tool.label}
                  variant="ghost"
                  className="w-full justify-start transition-smooth hover:bg-[hsl(var(--hover-overlay))] group"
                >
                  <tool.icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{tool.label}</span>
                  {tool.isPro && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                      Pro
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="mx-4" />

          {/* Chat History */}
          <div className="flex-1 px-4 py-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Chats</h3>
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left p-3 h-auto transition-smooth group",
                      activeConversationId === conversation.id
                        ? "bg-secondary text-secondary-foreground"
                        : "hover:bg-[hsl(var(--hover-overlay))]"
                    )}
                    onMouseEnter={() => setHoveredConversation(conversation.id)}
                    onMouseLeave={() => setHoveredConversation(null)}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conversation.timestamp}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator className="mx-4" />

          {/* Settings Section */}
          <div className="p-4 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start transition-smooth hover:bg-[hsl(var(--hover-overlay))]"
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