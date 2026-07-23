import { useCallback, useEffect, useState } from "react";
import { api, getBackendUrl, setBackendUrl } from "./api";
import type { EnvInfo, HealthStatus, ItemWithId } from "./types";
import "./App.css";

export default function App() {
  const [backendUrl, setUrl] = useState(getBackendUrl());
  const [items, setItems] = useState<ItemWithId[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [env, setEnv] = useState<EnvInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // New-item form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);

  const refresh = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [itemsData, healthData, envData] = await Promise.all([
        api.listItems(),
        api.health().catch(() => null),
        api.env().catch(() => null),
      ]);
      setItems(itemsData);
      setHealth(healthData);
      setEnv(envData);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (backendUrl) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveUrl = () => {
    setBackendUrl(backendUrl);
    void refresh();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createItem({
        name: name.trim(),
        description: description.trim() || null,
        price: Number(price),
        in_stock: inStock,
      });
      setName("");
      setDescription("");
      setPrice("");
      setInStock(true);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await api.deleteItem(id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Items Console</h1>
          <p className="subtitle">React UI for the FastAPI backend on Databricks Apps</p>
        </div>
        <span className={`badge ${health?.status === "healthy" ? "ok" : "down"}`}>
          {health ? `● ${health.status}` : "● unknown"}
        </span>
      </header>

      <section className="card">
        <label className="field-label">Backend URL</label>
        <div className="url-row">
          <input
            className="input"
            type="url"
            placeholder="https://my-fastapi-backend-xxxx.databricksapps.com"
            value={backendUrl}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btn" onClick={handleSaveUrl}>
            Connect
          </button>
          <button className="btn ghost" onClick={() => void refresh()} disabled={!backendUrl}>
            Refresh
          </button>
        </div>
        {env && (
          <p className="env">
            app: <code>{env.app_name ?? "—"}</code> · workspace:{" "}
            <code>{env.workspace_url ?? "—"}</code>
          </p>
        )}
      </section>

      {error && <div className="alert">{error}</div>}

      <div className="grid">
        <section className="card">
          <h2>Add item</h2>
          <form onSubmit={handleCreate} className="form">
            <input
              className="input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              In stock
            </label>
            <button className="btn" type="submit" disabled={!backendUrl}>
              Create
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Items {loading && <span className="muted">· loading…</span>}</h2>
            <span className="muted">{items.length} total</span>
          </div>
          {items.length === 0 ? (
            <p className="muted">No items yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{it.name}</td>
                    <td className="muted">{it.description ?? "—"}</td>
                    <td>${it.price.toFixed(2)}</td>
                    <td>{it.in_stock ? "In stock" : "Out"}</td>
                    <td>
                      <button
                        className="btn danger sm"
                        onClick={() => handleDelete(it.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
