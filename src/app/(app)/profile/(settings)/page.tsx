import { Separator } from '@/components/ui/separator';
import ProfileForm from '../components/profile-form';
import EmailForm from '../components/email-form';

export default function Settings() {
  return (
    <section className="space-y-6">
      <header>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          You can change your profile information here.
        </p>
      </header>
      <Separator />
      <ProfileForm />
      <Separator />
      <section>
        <h3 className="text-lg font-medium">Login &amp; Security</h3>
        <EmailForm />
      </section>
    </section>
  );
}
