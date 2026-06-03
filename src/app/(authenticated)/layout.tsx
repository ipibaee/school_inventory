import { AuthenticatedLayoutClient } from "@/components/layout/AuthenticatedLayoutClient";
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
    <AuthenticatedLayoutClient user={session?.user} settings={settings}>
      {children}
    </AuthenticatedLayoutClient>
  );
}
