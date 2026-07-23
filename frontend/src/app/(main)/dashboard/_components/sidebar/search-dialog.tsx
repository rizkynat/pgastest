"use client";
import * as React from "react";

import { BookType, ChartBar, Forklift, Gauge, Gavel, GraduationCap, LayoutDashboard, LayoutList, Search, Settings, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import Link from "next/link";
import { useAuthUser } from "../providers/auth-user-provider";

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const user = useAuthUser();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="link"
        className="!px-0 font-normal text-muted-foreground hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Cari Menu
        <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Cari menu" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {[...new Set(sidebarItems.map((item) => item.label))].map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group} key={group}>
                {sidebarItems[i].items.filter((item) => !user?.role || !item.forbiddenRoles?.includes(user.role))
                  .map((item) => (
                    <Link key={item.url} prefetch={false} href={item.url} target={item.newTab ? "_blank" : undefined}>
                      <CommandItem className="!py-1.5" key={item.title} onSelect={() => setOpen(false)}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </CommandItem>
                    </Link>

                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
