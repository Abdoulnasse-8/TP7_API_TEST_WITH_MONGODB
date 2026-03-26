const express = require("express");
const { ObjectId } = require("mongodb");

const { getClient } = require("../lib/mongoClient");
const { loadBooksFromFile } = require("../lib/booksLoader");

const importRouter = express.Router();

// 🔒 Validation
function assertNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    const err = new Error(`Champ '${fieldName}' invalide`);
    err.status = 400;
    throw err;
  }
}

// 🔄 Stratégie
function parseStrategy(value) {
  const v = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (v === "reset" || v === "upsert") return v;
  return "reset";
}

// 🧠 Transformation des documents (IMPORTANT)
function transformDocs(rawDocs) {
  return rawDocs.map((doc) => {
    const newDoc = { ...doc };

    if (newDoc._id) {
      // Cas Mongo export { $oid: ... }
      if (typeof newDoc._id === "object" && newDoc._id.$oid) {
        newDoc._id = new ObjectId(newDoc._id.$oid);
      }
      // Cas string
      else if (typeof newDoc._id === "string") {
        try {
          newDoc._id = new ObjectId(newDoc._id);
        } catch {
          // garder tel quel si invalide
        }
      }
    }

    return newDoc;
  });
}

// 🚀 Route d'import
importRouter.post("/books", async (req, res, next) => {
  try {
    const dbName = (req.body?.dbName || process.env.MONGODB_DB || "tp7").trim();
    const collectionName = (req.body?.collectionName || "books").trim();

    assertNonEmptyString(dbName, "dbName");
    assertNonEmptyString(collectionName, "collectionName");

    const strategy = parseStrategy(req.body?.strategy);

    // 📂 Chargement + transformation
    const rawDocs = loadBooksFromFile();
    if (!rawDocs.length) {
      const err = new Error("Aucun document trouvé dans books.json");
      err.status = 400;
      throw err;
    }

    const docs = transformDocs(rawDocs);

    const client = await getClient();
    const collection = client.db(dbName).collection(collectionName);

    // 🔥 RESET
    if (strategy === "reset") {
      await collection.drop().catch(() => undefined);

      const result = await collection.insertMany(docs);

      return res.json({
        dbName,
        collectionName,
        strategy,
        insertedCount: result.insertedCount ?? docs.length,
      });
    }

    // 🔁 UPSERT
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
