const express = require("express");
const cors = require("cors");

const { mongoRouter } = require("./routes/mongoRoutes");
const { importRouter } = require("./routes/importRoutes");
const { tp1Router } = require("./routes/tp1Routes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.get("/", (_req, res) => {
    res.json({
      name: "TP7 MongoDB API",
      routes: ["/api/mongo", "/api/import", "/api/tp1"],
    });
  });

  app.use("/api/mongo", mongoRouter);
  app.use("/api/import", importRouter);
  app.use("/api/tp1", tp1Router);

  // Handler d'erreur express
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const message = err?.message || "Internal error";
    const details = err?.details;
    res.status(500).json({ error: message, details });
  });

  return app;
}

module.exports = { createApp };

