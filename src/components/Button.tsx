import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "secondary";
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const base =
    "px-4 py-2 rounded-md text-white font-medium cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-default";

  const colors = {
    primary: "bg-brand hover:bg-brand-dark",
    danger: "bg-red-600 hover:bg-red-700",
    secondary: "bg-gray-600 hover:bg-gray-700",
  };

  return (
    <button className={`${base} ${colors[variant]} ${className}`} {...props} />
  );
}