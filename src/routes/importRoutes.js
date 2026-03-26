const express = require("express");

const { getClient } = require("../lib/mongoClient");
const { loadBooksFromFile } = require("../lib/booksLoader");

const importRouter = express.Router();

function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    const err = new Error(`Champ '${fieldName}' invalide`);
    err.status = 400;
    throw err;
  }
}

function parseStrategy(value) {
  const v = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (v === "reset" || v === "upsert") return v;
  return "reset";
}

importRouter.post("/books", async (req, res, next) => {
  try {
    const dbName = (req.body?.dbName || process.env.MONGODB_DB || "tp7").trim();
    const collectionName = (req.body?.collectionName || "books").trim();

    assertNonEmptyString(dbName, "dbName");
    assertNonEmptyString(collectionName, "collectionName");

    const strategy = parseStrategy(req.body?.strategy);

    const docs = loadBooksFromFile();
    if (!docs.length) {
      const err = new Error("Aucun document trouvé dans books.json");
      err.status = 400;
      throw err;
    }

    const client = await getClient();
    const collection = client.db(dbName).collection(collectionName);

    if (strategy === "reset") {
      // Nettoyage optionnel pour éviter les duplicats _id
      await collection.drop().catch(() => undefined);
      const result = await collection.insertMany(docs);
      res.json({
        dbName,
        collectionName,
        strategy,
        insertedCount: result.insertedCount ?? docs.length,
      });
      return;
    }

    // Upsert par _id (si _id existe déjà, on met à jour)
    const operations = docs.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(operations, { ordered: false });
    res.json({
      dbName,
      collectionName,
      strategy,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { importRouter };

