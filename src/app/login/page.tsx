import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f7f7f7",
      }}
    >
      <form
        action={login}
        style={{
          background: "white",
          padding: "32px",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          width: "300px",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: "bold", textAlign: "center" }}>
          Connexion
        </h1>

        {error && (
          <p style={{ color: "#c0392b", fontSize: "14px", textAlign: "center" }}>
            Nom d&apos;utilisateur ou mot de passe incorrect.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "14px", marginBottom: "4px" }}>
            Nom d&apos;utilisateur
          </label>
          <input
            type="text"
            name="username"
            required
            style={{ padding: "9px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "14px", marginBottom: "4px" }}>
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            required
            style={{ padding: "9px", border: "1px solid #ccc", borderRadius: "6px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#111",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "6px",
          }}
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}