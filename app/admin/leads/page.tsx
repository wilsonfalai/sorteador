import Link from "next/link";
import { LeadsTable } from "@/components/leads-table";

export const dynamic = "force-dynamic";

export default function LeadsPage() {
  return (
    <main className="min-h-dvh bg-zinc-100 p-4 text-black sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-black pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-zinc-500">
              Area privada
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Leads
            </h1>
          </div>

          <nav className="flex gap-3 text-sm font-black uppercase tracking-[0.16em]">
            <Link className="border border-black bg-white px-4 py-3" href="/admin">
              Sorteio
            </Link>
            <Link
              className="border border-black bg-black px-4 py-3 text-white"
              href="/admin/leads"
            >
              Leads
            </Link>
            <Link className="border border-black bg-white px-4 py-3" href="/admin/historico">
              Historico
            </Link>
          </nav>
        </header>

        <LeadsTable />
      </div>
    </main>
  );
}
