import Sidebar from '@/components/Sidebar';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-[var(--sidebar-width,256px)] transition-all duration-200">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
