const express = require("express");

const { getClient } = require("../lib/mongoClient");

const tp1Router = express.Router();

tp1Router.get("/", (_req, res) => {
  res.json({
    message:
      "TP1 via API : endpoints Q1/Q2/Q3 pour manipuler la collection `books` (dataset books.json).",
    routes: [
      { method: "GET", path: "/api/tp1/q1" },
      { method: "GET", path: "/api/tp1/q2" },
      { method: "GET", path: "/api/tp1/q3" },
    ],
    defaults: {
      dbName: process.env.MONGODB_DB || "tp7",
      collectionName: "books",
    },
    parameters: {
      dbName: "optionnel, ex: tp7",
      collectionName: "optionnel, ex: books",
    },
  });
});

function getDbAndCollection(req) {
  const dbName = (req.query.dbName || process.env.MONGODB_DB || "tp7").trim();
  const collectionName = (
    req.query.collectionName || "books"
  ).trim();
  if (!dbName) throw new Error("dbName invalide");
  if (!collectionName) throw new Error("collectionName invalide");
  return { dbName, collectionName };
}

// TP1 Q1 : Afficher les 200 premiers documents de `books`
tp1Router.get("/q1", async (req, res, next) => {
  try {
    const { dbName, collectionName } = getDbAndCollection(req);
    const client = await getClient();
    const docs = await client
      .db(dbName)
      .collection(collectionName)
      .find({})
      .limit(200)
      .toArray();
    res.json({ dbName, collectionName, count: docs.length, documents: docs });
  } catch (err) {
    next(err);
  }
});

// TP1 Q2 :
// Afficher title, isbn, pageCount des livres de la catégorie "Internet"
// (compter le nombre de livres affichés)
tp1Router.get("/q2", async (req, res, next) => {
  try {
    const { dbName, collectionName } = getDbAndCollection(req);
    const client = await getClient();

    const filter = { categories: "Internet" };
    const projection = { _id: 0, title: 1, isbn: 1, pageCount: 1 };

    const books = await client
      .db(dbName)
      .collection(collectionName)
      .find(filter, { projection })
      .toArray();

    // Pour coller à la consigne "Compter le nombre de livres affichés"
    // on compte le nombre de documents retournés.
    const count = books.length;

    res.json({
      dbName,
      collectionName,
      filter,
      count,
      documents: books,
    });
  } catch (err) {
    next(err);
  }
});

// TP1 Q3 :
// Trier par ordre croissant des isbn, les livres de l’auteur "David A. Black"
// ayant un nombre de page > 300
tp1Router.get("/q3", async (req, res, next) => {
  try {
    const { dbName, collectionName } = getDbAndCollection(req);
    const client = await getClient();

    const filter = {
      authors: "David A. Black",
      pageCount: { $gt: 300 },
    };
    const projection = { _id: 0, title: 1, isbn: 1, pageCount: 1 };

    const documents = await client
      .db(dbName)
      .collection(collectionName)
      .find(filter, { projection })
      .sort({ isbn: 1 })
      .toArray();

    res.json({
      dbName,
      collectionName,
      filter,
      sort: { isbn: 1 },
      count: documents.length,
      documents,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = { tp1Router };

