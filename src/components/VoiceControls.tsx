import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Play, 
  Pause,
  RotateCcw
} from "lucide-react";

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
  onToggleListening: () => void;
  onToggleSpeaking: () => void;
  onVolumeChange: (volume: number) => void;
  onRegenerate?: () => void;
}

export function VoiceControls({
  isListening,
  isSpeaking,
  volume,
  onToggleListening,
  onToggleSpeaking,
  onVolumeChange,
  onRegenerate
}: VoiceControlsProps) {
  const [selectedVoice, setSelectedVoice] = useState("sky");
  
  const voices = [
    { id: "sky", name: "Sky", description: "Warm and conversational" },
    { id: "ember", name: "Ember", description: "Confident and engaging" },
    { id: "breeze", name: "Breeze", description: "Calm and soothing" },
    { id: "sage", name: "Sage", description: "Wise and thoughtful" }
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Microphone Button */}
      <Button
        variant={isListening ? "default" : "ghost"}
        size="icon"
        onClick={onToggleListening}
        className={isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : ""}
      >
        {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
      </Button>

      {/* Voice Settings */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 bg-popover border-border" align="end">
          <DropdownMenuLabel>Voice Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-3 space-y-3">
            <div>
              <label className="text-sm font-medium">Voice</label>
              <div className="mt-1 space-y-1">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      selectedVoice === voice.id 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs opacity-75">{voice.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Speed</label>
              <Slider
                value={[1]}
                min={0.5}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Volume</label>
              <Slider
                value={[volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => onVolumeChange(value[0])}
                className="mt-2"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Speaker/Volume Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSpeaking}
        className={isSpeaking ? "text-primary" : ""}
      >
        {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      {/* Regenerate Voice */}
      {onRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRegenerate}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}