import Table from './components/table';

export default async function Roles() {
  return (
    <main className="container flex flex-col mt-8">
      <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
      <h2 className="text-muted-foreground">
        Manage roles for your organization
      </h2>
      <Table />
    </main>
  );
}
