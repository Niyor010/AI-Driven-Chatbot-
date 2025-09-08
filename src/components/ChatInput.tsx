import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Paperclip, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Message ChatGPT..." 
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const promptSuggestions = [
    "Help me write a professional email",
    "Explain quantum computing simply",
    "Create a workout plan for beginners",
    "Debug this code snippet"
  ];

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      {/* Prompt Suggestions */}
      {message === "" && (
        <div className="px-6 py-4">
          <div className="flex gap-2 flex-wrap">
            {promptSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs hover:bg-[hsl(var(--hover-overlay))] transition-smooth"
                onClick={() => setMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 pb-6">
        <div className="relative flex items-end gap-3 p-4 border border-border rounded-2xl bg-card/50 backdrop-blur-sm focus-within:ring-1 focus-within:ring-ring transition-smooth">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 hover:bg-[hsl(var(--hover-overlay))]"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground"
            )}
            disabled={isLoading}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[hsl(var(--hover-overlay))]"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[hsl(var(--hover-overlay))]"
            >
              <Mic className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="icon"
              className={cn(
                "h-8 w-8 transition-smooth",
                message.trim() && !isLoading
                  ? "bg-gradient-to-r from-primary to-[hsl(var(--primary-glow))] hover:opacity-90 hover-glow"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-xs text-muted-foreground text-center mt-3">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}