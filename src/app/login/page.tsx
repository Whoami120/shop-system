import { login } from "./actions";
import Button from "@/components/Button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <form
        action={login}
        className="bg-white p-8 rounded-xl shadow-md flex flex-col gap-4 w-80"
      >
        <h1 className="text-2xl font-bold text-center text-brand">
          Shop System
        </h1>
        <p className="text-center text-gray-500 text-sm -mt-2">Connexion</p>

        {error && (
          <p className="text-red-600 text-sm text-center">
            Nom d&apos;utilisateur ou mot de passe incorrect.
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Nom d&apos;utilisateur</label>
          <input
            type="text"
            name="username"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Mot de passe</label>
          <input
            type="password"
            name="password"
            required
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-brand"
          />
        </div>

        <Button type="submit" className="mt-2">
          Se connecter
        </Button>
      </form>
    </div>
  );
}