export default function StatCard({
  icon,
  label,
  value,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: "blue" | "green" | "amber" | "gray";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}