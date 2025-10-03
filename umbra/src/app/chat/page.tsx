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
import { toast } from "sonner";
import { AppLayout } from "@/components/app-layout";

export default function Page() {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast(value);
      setIsLoading(false);
      setValue("");
    }, 1000);
  };
  const messages: { id: string; type: string; content: string }[] = [];

  return (
    <AppLayout>
      <div className={`flex h-screen flex-col `}>
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-4 shadow-lg dark:shadow-white/10">
          <h1 className="text-2xl font-bold">New Chat</h1>
        </div>

        {/* Messages Area - flex-1 allows it to grow and overflow-y-auto enables scrolling */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-4xl px-4 py-4">
              <ChatMessageArea className="space-y-4">
                {messages.length > 0 &&
                  messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      id={message.id}
                      type={message.type === "user" ? "outgoing" : "incoming"}>
                      {message.type === "assistant" && <ChatMessageAvatar />}
                      <ChatMessageContent content={message.content} />
                    </ChatMessage>
                  ))}
              </ChatMessageArea>
            </div>
          </div>
        )}

        {/* Input Area - flex-shrink-0 keeps it at the bottom */}
        <div className="h-screen flex items-center justify-center">
          <div className={`flex-shrink-0`}>
            <div className="mx-auto max-w-4xl min-w-3xl px-4 pb-4 ">
              <ChatInput
                variant="default"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onSubmit={handleSubmit}
                loading={isLoading}
                className="border border-black/30  dark:border-0 shadow-xl dark:shadow-white/10"
                onStop={() => setIsLoading(false)}>
                <ChatInputTextArea
                  placeholder="Type a message..."
                  className="min-h-24 bg-transparent"
                />
                <ChatInputSubmit className="size-8 aspect-square mt-1" />
              </ChatInput>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
