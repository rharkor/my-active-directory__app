import Table from './components/table';

export default async function Projects() {
  return (
    <main className="container flex flex-col my-8">
      <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
      <h2 className="text-muted-foreground">
        Create projects and assign your services accounts to them.
      </h2>
      <Table />
    </main>
  );
}
