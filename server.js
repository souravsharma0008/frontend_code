// Static file server for the built React app.
// Databricks Apps injects the port to bind on via DATABRICKS_APP_PORT.
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "dist");

const app = express();
const port = process.env.DATABRICKS_APP_PORT || 8000;

app.use(express.static(distDir));

// SPA fallback: serve index.html for any non-file route.
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => {
  console.log(`UI server listening on port ${port}`);
});
