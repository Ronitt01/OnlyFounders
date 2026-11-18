import "dotenv/config"; // first, so GEMINI_API_KEY is set before lib/ creates the Gemini client
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { verifyApplication } from "./lib/verifyApplication.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/verify-application", verifyApplication);


// Configure Vite integration for asset resolution and client routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite developer middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`OnlyFounders full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

initServer();
