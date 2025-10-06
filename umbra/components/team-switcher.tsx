"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { open } = useSidebar();
  const [activeTeam] = React.useState(teams[0]);

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
          <Link href={"/"}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent aspect-square size-12 data-[state=open]:text-sidebar-accent-foreground">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="font-lobster text-xl">U</span>
              </div>
            </SidebarMenuButton>
          </Link>
          <div className={`flex justify-center items-center ${!open && "w-9"}`}>
            <SidebarTrigger className="-ml-1" />
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
