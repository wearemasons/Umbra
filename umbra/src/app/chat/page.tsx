"use client";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import { useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { SparklesIcon } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  sources?: string[]; // To track which sources were used
}

export default function Page() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async () => {
    if (!value.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: value,
    };

    setMessages((prev) => [...prev, userMessage]);
    setValue("");
    setIsLoading(true);

    try {
      // Call the API route - the API will handle CSV context and Gemini API call
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get response from Gemini API",
        );
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "Error: " + (error as Error).message ||
          "Failed to get response from Gemini API",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      if (value.trim()) {
        handleSubmit();
      }
    }
  };

  return (
    <AppLayout>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 shadow-lg dark:shadow-white/10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SparklesIcon className="h-6 w-6" /> Umbra&apos;s Research Assistant
          </h1>
          <p className="text-sm text-muted-foreground">
            Space Biology Knowledge Engine
          </p>
        </div>

        {/* Messages Area - flex-1 allows it to grow and overflow-y-auto enables scrolling */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-4">
            <ChatMessageArea className="space-y-4">
              {messages.length > 0 &&
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    type={message.type === "user" ? "outgoing" : "incoming"}
                  >
                    {message.type === "assistant" && <ChatMessageAvatar />}
                    <ChatMessageContent content={message.content} />
                  </ChatMessage>
                ))}
            </ChatMessageArea>
          </div>
        </div>

        {/* Input Area - flex-shrink-0 keeps it at the bottom */}
        <div className="flex-shrink-0">
          <div className="mx-auto max-w-4xl px-4 pb-4">
            <ChatInput
              variant="default"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onSubmit={handleSubmit}
              loading={isLoading}
              className="border border-black/30 dark:border-0 shadow-xl dark:shadow-white/10"
              onStop={() => setIsLoading(false)}
            >
              <ChatInputTextArea
                placeholder="Ask about space biology research..."
                className="min-h-24 bg-transparent"
                onKeyDown={handleKeyDown}
              />
              <ChatInputSubmit
                className="size-8 aspect-square mt-1"
                disabled={isLoading || !value.trim()}
              />
            </ChatInput>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
