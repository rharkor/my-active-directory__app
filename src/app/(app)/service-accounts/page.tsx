import Table from './components/table';

export default function ServiceAccounts() {
  return (
    <main className="container flex flex-col my-8">
      <h1 className="text-2xl font-bold tracking-tight">Service Accounts</h1>
      <h2 className="text-muted-foreground">Manage your service accounts</h2>
      <Table />
    </main>
  );
}
