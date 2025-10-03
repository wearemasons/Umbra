"use client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
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

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarInsetComponent />
      </SidebarInset>
    </SidebarProvider>
  );
}

const SidebarInsetComponent = () => {
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
  
  const messages = [
    {
      id: "1",
      content:
        "Can you tell me a story? Maybe something about a magical forest?",
      type: "user",
    },
    {
      id: "2",
      content:
        "Of course! I'd love to tell you a story about the Whispering Woods. Would you like to hear it?",
      type: "assistant",
    },
    {
      id: "3",
      content: "Yes, please! I'm excited to hear it!",
      type: "user",
    },
    {
      id: "4",
      content:
        "Deep in the heart of the Whispering Woods, there lived a young fox named Luna with fur as silver as moonlight. Unlike other foxes, Luna had the magical ability to speak with the ancient trees that surrounded her home.",
      type: "assistant",
    },
    {
      id: "5",
      content:
        "One day, Luna discovered that the oldest tree in the forest had fallen silent. This was very unusual, as this particular oak tree loved telling stories about the forest's history. Concerned, Luna decided to investigate.",
      type: "assistant",
    },
    {
      id: "6",
      content: "Oh no! What happened to the old oak tree?",
      type: "user",
    },
    {
      id: "7",
      content:
        "As Luna approached the ancient oak, she noticed something glowing at its roots - a tiny crystal that pulsed with a soft blue light. The tree had been protecting this crystal for centuries, and now it was losing its power.",
      type: "assistant",
    },
    {
      id: "8",
      content:
        "Luna knew she had to help. She gathered dewdrops from spider webs at dawn, collected starlight in flower petals at night, and asked the wind to share its oldest songs. With these magical ingredients, she restored the crystal's power.",
      type: "assistant",
    },
    {
      id: "9",
      content: "Did it work? Did the old oak tree start speaking again?",
      type: "user",
    },
    {
      id: "10",
      content:
        "Yes! The moment the crystal began glowing brightly again, the old oak's leaves rustled with joy, and its deep, wise voice returned. It thanked Luna for her help and shared even more wonderful stories about the forest's ancient magic.",
      type: "assistant",
    },
    {
      id: "11",
      content:
        "From that day forward, Luna became known as the Guardian of the Whispering Woods, and she made sure to visit the old oak tree every day to hear its wonderful tales.",
      type: "assistant",
    },
    {
      id: "12",
      content:
        "That was such a beautiful story! I loved how Luna helped save the old oak tree's voice.",
      type: "user",
    },
    {
      id: "13",
      content:
        "I'm glad you enjoyed it! The story teaches us that even the smallest acts of kindness can help preserve the magic in our world.",
      type: "assistant",
    },
  ];
  
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4">
        <h1 className="text-2xl font-bold">Title...</h1>
      </div>

      {/* Messages Area - flex-1 allows it to grow and overflow-y-auto enables scrolling */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-4">
          <ChatMessageArea className="space-y-4">
            {messages.map((message) => (
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

      {/* Input Area - flex-shrink-0 keeps it at the bottom */}
      <div className="flex-shrink-0 ">
        <div className="mx-auto w-full max-w-4xl px-4 pb-4 ">
          <ChatInput
            variant="default"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onSubmit={handleSubmit}
            loading={isLoading}
            className="border border-black dark:border-0"
            onStop={() => setIsLoading(false)}>
            <ChatInputTextArea placeholder="Type a message..." className="min-h-24 bg-transparent" />
            <ChatInputSubmit className="size-8 aspect-square mt-1"/>
          </ChatInput>
        </div>
      </div>
    </div>
  );
};