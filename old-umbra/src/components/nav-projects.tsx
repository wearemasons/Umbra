"use client";
import { ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import Link from "next/link";

export function NavProjects() {
  const chats = [
    {
      id: "1",
      title: "To the moon",
    },
    {
      id: "2",
      title: "Water on Mars",
    },
    {
      id: "3",
      title: "Billions of Stars",
    },
  ];

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <Collapsible asChild defaultOpen={true} className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={"Chats"}>
              <span>Chats</span>
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {chats.map((chat) => (
                <SidebarMenuSubItem key={chat.id}>
                  <SidebarMenuSubButton asChild>
                    <Link href={`/chat/${chat.id}`}>
                      <span>{chat.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarGroup>
  );
}
