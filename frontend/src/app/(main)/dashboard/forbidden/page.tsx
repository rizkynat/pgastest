"use client";

export default function DashboardForbidden() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-2 text-center">
      <h1 className="font-semibold text-2xl">Access Forbidden</h1>
      <p className="text-muted-foreground">You do not have permission to access this section.</p>
    </div>
  );
}
