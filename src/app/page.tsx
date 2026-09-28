import Link from "next/link";
import { Suspense } from "react";
import { getDashboard } from "@/server/services/dashboard";
import { SORT_OPTIONS, type SortKey } from "@/lib/domain";
import { formatDate, todayISO } from "@/lib/dates";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatSummary } from "@/components/dashboard/StatSummary";
import { AttentionList } from "@/components/dashboard/AttentionList";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { MatterTable } from "@/components/dashboard/MatterTable";
import { IconPlus } from "@/components/ui/icons";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const sortParam = one(sp.sort);
  const query = {
    q: one(sp.q),
    view: one(sp.view),
    flag: one(sp.flag),
    sort: sortParam && sortParam in SORT_OPTIONS ? (sortParam as SortKey) : undefined,
  };
  const { stats, matters, totalCount, all } = await getDashboard(query);

  return (
    <>
      <PageHeader
        title="Wills matters"
        subtitle={formatDate(todayISO())}
        actions={
          <Link href="/matters/new" className="btn-primary">
            <IconPlus /> New matter
          </Link>
        }
      />

      <div className="space-y-6">
        <StatSummary stats={stats} activeView={query.view} />
        {!query.q && !query.flag && <AttentionList matters={all} />}

        <section className="card">
          <Suspense>
            <DashboardFilters />
          </Suspense>
          {totalCount === 0 ? (
            <div className="px-6 py-16 text-center">
              <h2 className="text-base font-semibold text-slate-900">No matters yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Create your first matter, or load the fictional sample matters by running <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">pnpm db:setup</code> in the project folder.
              </p>
              <Link href="/matters/new" className="btn-primary mt-6">
                <IconPlus /> New matter
              </Link>
            </div>
          ) : matters.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">No matters match these filters.</div>
          ) : (
            <MatterTable matters={matters} />
          )}
          {matters.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500">
              Showing {matters.length} of {totalCount} matters
            </div>
          )}
        </section>
      </div>
    </>
  );
}
