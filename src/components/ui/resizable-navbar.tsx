"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  activeTab?: string;
  onSelect?: (name: string) => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(useScroll().scrollY, "change", (latest) => {
    if (latest > 40) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <div className={cn("fixed inset-x-0 top-0 z-50 w-full pointer-events-none", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(20px)" : "blur(14px)",
        boxShadow: visible
          ? "0 16px 36px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08) inset"
          : "none",
        width: visible ? "92%" : "100%",
        maxWidth: visible ? "680px" : "1140px",
        borderRadius: visible ? "9999px" : "0px",
        borderWidth: visible ? "1px" : "0px 0px 1px 0px",
        marginTop: visible ? "10px" : "0px",
        height: visible ? "3.25rem" : "3.75rem",
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
      }}
      className={cn(
        "pointer-events-auto relative z-50 mx-auto flex flex-row items-center justify-between border-white/[0.08] px-4 py-2 sm:px-6 transition-colors duration-200",
        visible ? "bg-zinc-900/90 dark:bg-zinc-950/90 border-white/[0.15]" : "bg-[#09090b]/80 border-b border-white/[0.08]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, activeTab, onSelect }: NavItemsProps) => {
  return (
    <div className={cn("hidden md:flex items-center gap-1", className)}>
      {items.map((item, idx) => (
        <a
          key={`nav-item-${idx}`}
          href={item.link}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(item.name);
            }
          }}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
            activeTab === item.name
              ? "bg-white/10 text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          {item.name}
        </a>
      ))}
    </div>
  );
};

export const NavbarLogo = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  return <div className={cn("flex items-center gap-2", className)}>{children}</div>;
};

export const NavbarButton = ({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-full bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shadow-sm",
        className
      )}
    >
      {children}
    </button>
  );
};

export const MobileNav = ({ children, className, open }: MobileNavProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn("md:hidden fixed inset-x-4 top-16 z-50 rounded-2xl bg-zinc-900/95 border border-white/10 p-4 backdrop-blur-xl shadow-2xl", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavHeader = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  return <div className={cn("flex items-center justify-between pb-3 border-b border-white/10", className)}>{children}</div>;
};

export const MobileNavToggle = ({ open, onClick }: { open: boolean; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
      aria-label="Toggle Navigation"
    >
      {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
    </button>
  );
};

export const MobileNavMenu = ({
  items,
  onSelect,
}: {
  items: { name: string; link: string }[];
  onSelect?: (name: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-2 pt-3">
      {items.map((item, idx) => (
        <a
          key={`mobile-nav-item-${idx}`}
          href={item.link}
          onClick={(e) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(item.name);
            }
          }}
          className="text-sm font-medium text-zinc-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          {item.name}
        </a>
      ))}
    </div>
  );
};
