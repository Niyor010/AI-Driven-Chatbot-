import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ProfileDropdown } from "./ProfileDropdown";
import { NotificationCenter } from "./NotificationCenter";
import { LanguageSelector } from "./LanguageSelector";
import { VoiceControls } from "./VoiceControls";
import { SettingsPanel } from "./SettingsPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUpDown, MapPin, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "../contexts/ChatContext";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

export function ChatInterface() {
  const { 
    conversations, 
    activeConversationId, 
    addMessage, 
    updateConversation 
  } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [reverseChat, setReverseChat] = useState(false);
  const [uiLanguage, setUiLanguage] = useState("en");
  const [responseLanguage, setResponseLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(50);
  const [location, setLocation] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  // Location detection
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          console.log("Location access denied");
        }
      );
    }
  }, []);

  const handleLocationRequest = () => {
    toast({
      title: "Location Access",
      description: "Allow ChatGPT to use your location for more accurate results?",
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add user message
    addMessage(activeConversationId, userMessage);

    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm a demo ChatGPT interface! In a real implementation, this would connect to OpenAI's API to generate responses. Your message was: \"" + content + "\"",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      addMessage(activeConversationId, assistantMessage);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied.",
    });
  };

  const handleRegenerate = (messageId: string) => {
    toast({
      title: "Regenerating response",
      description: "This feature would regenerate the AI response.",
    });
  };

  const handleFeedback = (messageId: string, type: "up" | "down") => {
    toast({
      title: `Feedback ${type === "up" ? "👍" : "👎"}`,
      description: "Thank you for your feedback!",
    });
  };

  const handleToggleListening = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Voice input stopped" : "Voice input started",
      description: isListening ? "Microphone turned off" : "Listening for your voice...",
    });
  };

  const handleToggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const displayedMessages = reverseChat 
    ? [...(activeConversation?.messages || [])].reverse() 
    : activeConversation?.messages || [];

  return (
    <div className="flex h-screen bg-[hsl(var(--chat-bg))]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-[hsl(var(--primary-glow))]/20 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              GPT-4
            </Badge>
            <h1 className="font-medium">
              {activeConversation?.title || "ChatGPT"}
            </h1>
            
            {/* Chat Controls */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReverseChat(!reverseChat)}
                className={reverseChat ? "bg-primary/10 text-primary" : ""}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Latest First
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLocationRequest}
                className={location ? "bg-primary/10 text-primary" : ""}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {location ? "Location On" : "Location"}
              </Button>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <LanguageSelector
              type="response"
              selectedLanguage={responseLanguage}
              onLanguageChange={setResponseLanguage}
            />
            
            <VoiceControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              volume={volume}
              onToggleListening={handleToggleListening}
              onToggleSpeaking={handleToggleSpeaking}
              onVolumeChange={handleVolumeChange}
            />
            
            <NotificationCenter />
            <ProfileDropdown />
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto">
            {activeConversation?.messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold">How can I help you today?</h2>
                  <p className="text-muted-foreground max-w-md">
                    I'm your AI assistant. Ask me anything, and I'll do my best to help you with information, creative tasks, analysis, and more.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                {displayedMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onCopy={handleCopyMessage}
                    onRegenerate={handleRegenerate}
                    onFeedback={handleFeedback}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-4 p-6">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="chat-message-assistant max-w-[70%] p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="max-w-4xl mx-auto w-full">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}