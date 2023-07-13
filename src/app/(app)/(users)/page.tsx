import Table from './components/table';

export default function Users() {
  return (
    <main className="container flex flex-col my-8">
      <h1 className="text-2xl font-bold tracking-tight">Users</h1>
      <h2 className="text-muted-foreground">Manage your users with roles</h2>
      <Table />
    </main>
  );
}
