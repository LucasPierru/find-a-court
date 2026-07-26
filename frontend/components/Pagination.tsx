import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

const BUTTON_CLASS =
  "rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800";
const DISABLED_BUTTON_CLASS =
  "rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-600";

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className="mt-8 flex items-center justify-between gap-4">
      {hasPrevious ? (
        <Link href={buildHref(page - 1)} className={BUTTON_CLASS}>
          Previous
        </Link>
      ) : (
        <span className={DISABLED_BUTTON_CLASS}>Previous</span>
      )}

      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Link href={buildHref(page + 1)} className={BUTTON_CLASS}>
          Next
        </Link>
      ) : (
        <span className={DISABLED_BUTTON_CLASS}>Next</span>
      )}
    </nav>
  );
}
