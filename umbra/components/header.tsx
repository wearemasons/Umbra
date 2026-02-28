'use client';
import { Authenticated, Unauthenticated } from 'convex/react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { DarkModeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Chat', href: '/chat' },
  { name: 'Graph', href: '/graph' },
  { name: 'Editor', href: '/text-editor' },
  { name: 'Source Code', href: 'https://github.com/wearemasons/Umbra' },
];

export const HeroHeader = () => {
  const { user, signOut } = useAuth();

  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header>
      <nav data-state={menuState && 'active'} className="fixed z-20 w-full px-2">
        <div
          className={cn(
            'mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12',
            isScrolled && 'bg-[#121212]/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5',
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center  justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center  space-x-2">
                <Logo />
              </Link>

              <Button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 pb-1 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </Button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.href} className="text-white/70 hover:text-white/90 block duration-150">
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link href={item.href} className="dark:text-white/70 dark:hover:text-white/90 block duration-150">
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Unauthenticated>
                  <Button asChild variant="outline" size="sm" className={cn(isScrolled && 'hidden')}>
                    <Link href="/sign-in">
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm" className={cn(isScrolled && 'hidden')}>
                    <Link href="/sign-up">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                  >
                    <Link href="/sign-up">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </Unauthenticated>
                <Authenticated>
                  <span className="text-sm text-white self-center">Hi. {user?.firstName}</span>
                  <Button
                    asChild
                    variant="destructive"
                    onClick={signOut as () => void}
                    size="sm"
                    className={cn(isScrolled && 'lg:hidden')}
                  >
                      <span>Sign out</span>
                  </Button>

                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}
                  >
                    <Link href="/chat">
                      <span>Get Started</span>
                    </Link>
                  </Button>
                </Authenticated>
                <DarkModeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
