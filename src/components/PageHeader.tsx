type Crumb = { label: string };

export default function PageHeader({
  title,
  breadcrumb,
  action,
}: {
  title: string;
  breadcrumb?: Crumb[];
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{title}</h1>
        {breadcrumb && (
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
            {breadcrumb.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1">/</span>}
                {c.label}
              </span>
            ))}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}