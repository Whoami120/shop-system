import Link from "next/link";

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-12 text-center shadow-sm">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-blue-50 text-brand flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <p className="text-gray-800 dark:text-slate-100 font-medium">{title}</p>
      {message && <p className="text-gray-500 text-sm mt-1">{message}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-4 px-4 py-2 rounded-md bg-brand text-white text-sm hover:bg-brand-dark transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}