import { Separator } from '@/components/ui/separator';
import ProfileForm from '../components/profile-form';
import EmailForm from '../components/email-form';
import UsernameForm from '../components/username-form';
import PasswordForm from '../components/password-form';

export default function Settings() {
  return (
    <section className="space-y-6">
      <header>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          You can change your profile information here.
        </p>
      </header>
      <ProfileForm />
      <Separator />
      <section>
        <header>
          <h3 className="text-lg font-medium">Login &amp; Security</h3>
        </header>
        <EmailForm />
        <UsernameForm />
        <PasswordForm />
      </section>
    </section>
  );
}
