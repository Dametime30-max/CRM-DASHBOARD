import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Not found</h1>
      <p className="mt-2 text-sm text-slate-600">That page or matter does not exist.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to matters
      </Link>
    </div>
  );
}
