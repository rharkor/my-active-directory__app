import { Separator } from '@/components/ui/separator';
import { TypographyH1 } from '@/components/ui/typography';
import { SidebarNav } from './components/sidebar-nav';

const sidebarNavItems = [
  {
    title: 'Account',
    href: '/profile',
  },
  {
    title: 'Appearance',
    href: '/profile/appearance',
  },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="space-y-6 container mt-8">
      <div className="space-y-0.5">
        <TypographyH1>Your Profile</TypographyH1>
        <p className="text-muted-foreground">
          Manage your account settings and appearance preferences.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </main>
  );
}
