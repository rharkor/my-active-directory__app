import { Separator } from '@/components/ui/separator';
import AppearanceForm from '../components/appearance-form';

export default function Appearance() {
  return (
    <section className="space-y-6">
      <header>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize your profile appearance.
        </p>
      </header>
      <Separator />
      <AppearanceForm />
    </section>
  );
}
