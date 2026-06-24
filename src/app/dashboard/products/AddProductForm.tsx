import { addProduct } from "./actions";

export default function AddProductForm() {
  return (
    <form
      action={addProduct}
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "30px",
        flexWrap: "wrap",
        alignItems: "flex-end",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontSize: "14px", marginBottom: "4px" }}>Nom</label>
        <input
          type="text"
          name="name"
          required
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontSize: "14px", marginBottom: "4px" }}>Prix (MAD)</label>
        <input
          type="number"
          name="price"
          step="0.01"
          required
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px", width: "120px" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontSize: "14px", marginBottom: "4px" }}>Quantité</label>
        <input
          type="number"
          name="quantity"
          required
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px", width: "120px" }}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: "9px 18px",
          background: "#111",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Ajouter
      </button>
    </form>
  );
}