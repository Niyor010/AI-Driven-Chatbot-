import { createContext, useContext, useState, ReactNode } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string;
  isCollapsed: boolean;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "React Best Practices",
      timestamp: "2 hours ago",
      messages: [
        {
          id: "1",
          content: "What are some React best practices for 2024?",
          role: "user",
          timestamp: "2:30 PM"
        },
        {
          id: "2",
          content: "Here are some key React best practices for 2024:\n\n1. **Use React 18 features**: Leverage concurrent features like Suspense, useTransition, and useDeferredValue for better performance.\n\n2. **Component composition over inheritance**: Prefer composition patterns and custom hooks over class inheritance.\n\n3. **TypeScript integration**: Use TypeScript for better type safety and developer experience.\n\n4. **Performance optimization**: Implement React.memo, useMemo, and useCallback strategically, not everywhere.\n\n5. **Server Components**: Consider Next.js 13+ Server Components for better performance and SEO.\n\n6. **State management**: Use Zustand or Redux Toolkit for complex state, built-in hooks for simple state.\n\nWould you like me to elaborate on any of these points?",
          role: "assistant",
          timestamp: "2:31 PM"
        }
      ]
    },
    {
      id: "2",
      title: "Tailwind CSS Tips",
      timestamp: "1 day ago",
      messages: [
        {
          id: "3",
          content: "How can I create a gradient background with Tailwind CSS?",
          role: "user",
          timestamp: "Yesterday"
        },
        {
          id: "4",
          content: "You can create gradient backgrounds in Tailwind CSS using the gradient utilities:\n\n```css\n/* Linear gradients */\nbg-gradient-to-r from-blue-500 to-purple-600\nbg-gradient-to-br from-pink-400 via-red-500 to-yellow-500\n\n/* Radial gradients */\nbg-gradient-radial from-white to-gray-300\n```\n\nFor custom gradients, you can extend your tailwind.config.js:\n\n```js\nmodule.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'custom-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',\n      }\n    }\n  }\n}\n```",
          role: "assistant",
          timestamp: "Yesterday"
        }
      ]
    },
    {
      id: "3",
      title: "JavaScript Array Methods",
      timestamp: "3 days ago",
      messages: []
    }
  ]);
  
  const [activeConversationId, setActiveConversationId] = useState<string>("1");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id ? { ...conv, ...updates } : conv
      )
    );
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(conv => conv.id !== id);
      setActiveConversationId(remaining[0]?.id || "");
    }
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, message],
              title: conv.messages.length === 0 ? message.content.slice(0, 30) + "..." : conv.title
            }
          : conv
      )
    );
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversationId,
      isCollapsed,
      setConversations,
      setActiveConversationId,
      setIsCollapsed,
      addConversation,
      updateConversation,
      deleteConversation,
      addMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
