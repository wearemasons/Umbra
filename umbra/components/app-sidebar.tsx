'use client';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import * as React from 'react';
import { AudioWaveform, BookOpen, Command, GalleryVerticalEnd, NotebookPen, Plus } from 'lucide-react';
import { PiGraphLight } from 'react-icons/pi';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'Demo User',
    email: 'demo@wearemasons.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'New Chat',
      url: '/chat',
      icon: <Plus />,
    },
    {
      title: 'Researches',
      url: '/researches',
      icon: <BookOpen />,
    },
    {
      title: 'Text Editor',
      url: '/text-editor',
      icon: <NotebookPen />,
    },
    {
      title: 'Graph',
      url: '/graph',
      icon: <PiGraphLight />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user,signOut } = useAuth();
  const userData = {
    name: `${user?.firstName ? user?.firstName + ' ' + user?.lastName : 'Demo User'}`,
    email: user?.email || 'demo@wearemasons.com',
    avatar: user?.profilePictureUrl || ``,
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onSignOut={signOut}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
