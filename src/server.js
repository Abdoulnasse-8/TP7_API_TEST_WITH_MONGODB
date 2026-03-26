const { createApp } = require("./app");
require("dotenv").config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();

app.listen(PORT, () => {
  // Simple log de démarrage
  // eslint-disable-next-line no-console
  console.log(`TP7 MongoDB API listening on http://localhost:${PORT}`);
});

