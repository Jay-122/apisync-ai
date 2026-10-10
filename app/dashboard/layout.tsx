import { AppSidebar, AppTopbar } from "@/components/shell/app-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <AppTopbar />
        <div className="px-4 py-6 md:px-6">{children}</div>
      </div>
    </div>
  );
}
