"use client";

import { NotificationProvider } from "@/components/notifications/notification-center";

export function Providers({ children }: { children: React.ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}
