"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile, open } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={`${
            !open && "flex-col items-start"
          } flex items-center gap-1 justify-between `}>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent aspect-square size-12 data-[state=open]:text-sidebar-accent-foreground">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <span className="font-lobster text-xl">U</span>
            </div>
          </SidebarMenuButton>
          <div className={`flex justify-center items-center ${!open && "w-9"}`} >
            <SidebarTrigger className="-ml-1" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
