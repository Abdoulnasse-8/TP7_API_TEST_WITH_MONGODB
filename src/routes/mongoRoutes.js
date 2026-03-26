const express = require("express");

const { getClient } = require("../lib/mongoClient");

const mongoRouter = express.Router();

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    const err = new Error(`Champ '${fieldName}' invalide`);
    err.status = 400;
    throw err;
  }
}

mongoRouter.get("/databases", async (_req, res, next) => {
  try {
    const client = await getClient();
    const result = await client.db("admin").admin().listDatabases();
    res.json({ databases: result.databases.map((d) => d.name) });
  } catch (err) {
    next(err);
  }
});

// 2) Créer une base de données (implicite dans MongoDB)
// On force la création en insérant un doc dans une collection "init".
mongoRouter.post("/databases/create", async (req, res, next) => {
  try {
    const dbName = req.body?.dbName;
    const initCollection = (req.body?.collectionName || "__tp7_init").trim();

    assertNonEmptyString(dbName, "dbName");
    assertNonEmptyString(initCollection, "collectionName");

    const client = await getClient();
    await client.db(dbName).collection(initCollection).insertOne({
      createdAt: new Date(),
      source: "tp7",
    });

    res.json({ dbName, created: true, initCollection });
  } catch (err) {
    next(err);
  }
});

mongoRouter.post("/databases/drop", async (req, res, next) => {
  try {
    const dbName = req.body?.dbName;
    assertNonEmptyString(dbName, "dbName");

    const client = await getClient();
    await client.db(dbName).dropDatabase();

    res.json({ dbName, dropped: true });
  } catch (err) {
    next(err);
  }
});

// 3) Afficher les collections d'une DB
mongoRouter.get("/databases/:dbName/collections", async (req, res, next) => {
  try {
    const dbName = req.params.dbName;
    assertNonEmptyString(dbName, "dbName");

    const client = await getClient();
    const collections = await client.db(dbName).listCollections().toArray();

    res.json({ dbName, collections: collections.map((c) => c.name) });
  } catch (err) {
    next(err);
  }
});

// 4) Ajouter un document à une collection
mongoRouter.post(
  "/databases/:dbName/collections/:collectionName/documents",
  async (req, res, next) => {
    try {
      const dbName = req.params.dbName;
      const collectionName = req.params.collectionName;
      assertNonEmptyString(dbName, "dbName");
      assertNonEmptyString(collectionName, "collectionName");

      const document = req.body?.document;
      if (!document || typeof document !== "object" || Array.isArray(document)) {
        const err = new Error("Body 'document' invalide (attendu : objet JSON)");
        err.status = 400;
        throw err;
      }

      const client = await getClient();
      const result = await client
        .db(dbName)
        .collection(collectionName)
        .insertOne(document);

      res.json({ dbName, collectionName, insertedId: result.insertedId });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = { mongoRouter };

