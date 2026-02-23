import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { auth } from "@/auth";
import { getSchoolSettings } from "@/actions/settings";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const settings = await getSchoolSettings();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50 print:hidden">
        <Sidebar user={session?.user} settings={settings} />
      </div>
      <div className="flex-1 md:pl-72 flex flex-col print:pl-0">
        <div className="print:hidden">
          <Header />
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
