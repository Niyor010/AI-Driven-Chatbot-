import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
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

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setUiLanguage(language);
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
      title: t('chat.locationAccess'),
      description: t('chat.locationDescription'),
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
        content: t('chat.demoResponse', { message: content }),
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
      title: t('chat.copiedToClipboard'),
      description: t('chat.messageCopied'),
    });
  };

  const handleRegenerate = (messageId: string) => {
    toast({
      title: t('chat.regeneratingResponse'),
      description: t('chat.regenerateDescription'),
    });
  };

  const handleFeedback = (messageId: string, type: "up" | "down") => {
    toast({
      title: `${t('chat.feedback')} ${type === "up" ? "👍" : "👎"}`,
      description: t('chat.thankYouFeedback'),
    });
  };

  const handleToggleListening = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? t('chat.voiceInputStopped') : t('chat.voiceInputStarted'),
      description: isListening ? t('chat.microphoneOff') : t('chat.listening'),
    });
  };

  const handleToggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  const handleTranscript = (transcript: string) => {
    // Auto-send the transcribed message
    if (transcript.trim()) {
      handleSendMessage(transcript.trim());
    }
  };

  const handleSpeak = (text: string) => {
    // This will be handled by the VoiceControls component
    console.log('Speaking:', text);
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
              {t('chat.gpt4')}
            </Badge>
            <h1 className="font-medium">
              {activeConversation?.title || t('chat.title')}
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
                {t('chat.latestFirst')}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLocationRequest}
                className={location ? "bg-primary/10 text-primary" : ""}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {location ? t('chat.locationOn') : t('chat.location')}
              </Button>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            <LanguageSelector
              type="ui"
              selectedLanguage={uiLanguage}
              onLanguageChange={handleLanguageChange}
            />
            
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
              onTranscript={handleTranscript}
              onSpeak={handleSpeak}
              language={responseLanguage}
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
                  <h2 className="text-2xl font-semibold">{t('chat.howCanIHelp')}</h2>
                  <p className="text-muted-foreground max-w-md">
                    {t('chat.welcomeMessage')}
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
                    onSpeak={handleSpeak}
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