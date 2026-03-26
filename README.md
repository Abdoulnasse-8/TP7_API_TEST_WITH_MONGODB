# TP7 MongoDB - Manipulation via API (Node.js)

## Objectif
Ce TP consiste à manipuler une base MongoDB à l’aide d’une API Node.js. On réalise :
1. Lister les bases existantes
2. Créer / supprimer une base
3. Lister les collections d’une base
4. Ajouter un document dans une collection
5. Exploiter le dataset `books.json` pour répondre à des requêtes MQL inspirées de TP1 (ici via endpoints API).

## Pré-requis
1. MongoDB lancé en local et accessible sur `127.0.0.1:27017`
2. Node.js installé

### Variables d’environnement
Copie/ajuste `.env` (fichier présent dans le projet) :
```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=tp7
```

## Lancer l’application
Dans le dossier du TP (`c:\Users\aicha\Downloads\TP7_MONGO_DB`) :
```powershell
npm install
npm run dev
```

L’API démarre sur :
`http://localhost:3000`

## Partie 1 : gestion MongoDB (endpoints)
Tous les endpoints “gestion” sont regroupés sous `/api/mongo`.

### 1) Afficher toutes les bases existantes
`GET http://localhost:3000/api/mongo/databases`

### 2) Créer une base (implicite via insertion)
`POST http://localhost:3000/api/mongo/databases/create`
Body JSON :
```json
{ "dbName": "tp7demo", "collectionName": "__tp7_init" }
```

### 2) Supprimer une base
`POST http://localhost:3000/api/mongo/databases/drop`
Body JSON :
```json
{ "dbName": "tp7demo" }
```

### 3) Afficher toutes les collections d’une base
`GET http://localhost:3000/api/mongo/databases/:dbName/collections`

### 4) Ajouter un document dans une collection
`POST http://localhost:3000/api/mongo/databases/:dbName/collections/:collectionName/documents`
Body JSON :
```json
{
  "document": { "title": "Test Node", "isbn": "0000000000", "status": "PUBLISH" }
}
```

## Partie 5 : manipulation du dataset `books.json`
L’import se fait via l’endpoint :
`POST http://localhost:3000/api/import/books`

Body JSON (recommandé “reset” pour éviter les doublons `_id`) :
```json
{ "dbName": "tp7", "collectionName": "books", "strategy": "reset" }
```

Autre option : `strategy: "upsert"`
```json
{ "dbName": "tp7", "collectionName": "books", "strategy": "upsert" }
```

## TP1 - Série de requêtes (endpoints API)
Une fois le dataset importé (collection `tp7.books`), les questions TP1 sont accessibles via `/api/tp1`.

### Q1) Afficher les 200 premiers documents
`GET http://localhost:3000/api/tp1/q1`

### Q2) Catégorie = "Internet"
Affiche `title`, `isbn`, `pageCount` et renvoie aussi le `count` du nombre de livres affichés.
`GET http://localhost:3000/api/tp1/q2`

### Q3) Auteur "David A. Black" et pages > 300
Tri croissant sur `isbn` (ordre lexicographique car `isbn` est une chaîne dans le dataset).
`GET http://localhost:3000/api/tp1/q3`

## Notes
- Les endpoints TP1 supposent que `books.json` a été importé dans `dbName` / `collectionName`.
- Si MongoDB n’est pas démarré sur `127.0.0.1:27017`, Compass et l’API échoueront avec `ECONNREFUSED`.
- Un fichier `README_API_TEST.md` contient aussi des commandes PowerShell prêtes à exécuter pour tester chaque endpoint.

# TP7 - MongoDB (Node.js) : configuration MongoDB sur Windows

## Symptome
`MongoDB Compass` affiche : `ECONNREFUSED 127.0.0.1:27017` et `ECONNREFUSED ::1:27017`.

Ce message veut presque toujours dire que **le serveur MongoDB (`mongod`) n'est pas démarré** ou n'ecoute pas sur le port `27017`.

## 1) Verifier que MongoDB est installe
1. Ouvre **Services** (`services.msc`)
2. Cherche un service du type **MongoDB** (ex: `MongoDB Server`)
3. Verifie son etat :
   - Si le service est **Stopped**, demarre-le.

Alternative via PowerShell (si le service existe) :
```powershell
Get-Service *MongoDB* | Select-Object Name,Status
Start-Service "MongoDB Server" -ErrorAction SilentlyContinue
```

## 2) Verifier que le port 27017 est ouvert
Dans PowerShell :
```powershell
netstat -ano | Select-String ":27017"
```

Attendu : tu dois voir une ligne indiquant que quelque chose ecoute sur `:27017`.
Si rien n'apparaît, MongoDB ne tourne pas (ou pas sur ce port).

## 3) Demarrer MongoDB manuellement (si besoin)
Si tu as l'installation MongoDB Community Server, tu peux demarrer `mongod` avec un fichier de config.

Exemple de config minimale (a adapter selon ton dossier d'installation) :
```yaml
# mongod.cfg (exemple)
storage:
  dbPath: "C:\\data\\mongodb"
systemLog:
  destination: file
  path: "C:\\data\\mongodb\\log.txt"
net:
  port: 27017
  bindIp: 127.0.0.1
```

Ensuite demarre `mongod` (commande typique, selon ton dossier d'installation) :
```powershell
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --config "C:\path\mongod.cfg"
```

## 4) Configurer le bindIp (pour que Compass marche)
MongoDB peut ecouter :
- `127.0.0.1` (IPv4)
- ou `::1` (IPv6)

Comme Compass essaie aussi bien `127.0.0.1` que `::1` chez toi, assure-toi que MongoDB ecoute au moins sur `127.0.0.1`.

Dans `mongod.cfg`, mets par exemple :
```yaml
net:
  bindIp: 127.0.0.1
```

ou plus permissif :
```yaml
net:
  bindIp: 0.0.0.0
```

(Pour un TP local, `127.0.0.1` suffit en general.)

## 5) Connexion MongoDB Compass
Dans Compass, utilise :
- **URI** : `mongodb://localhost:27017`
ou :
- **Host** : `localhost`
- **Port** : `27017`

## 6) Utiliser la meme URI dans le projet Node.js
Dans ton projet, copie `.env.example` vers `.env` et verifie :
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=tp7
```

## 7) Depsannage rapide (les causes les plus frequentes)
1. MongoDB service pas demarre.
2. MongoDB demarre sur un autre port.
3. MongoDB ecoute seulement en IPv6 (ou seulement IPv4).
4. Pas de fichier `dbPath`/droits d'acces (MongoDB refuse de demarrer).

## Question pour continuer
Tu as installe MongoDB :
- via l'installeur officiel (Community Server) ?
- ou via Docker ?
- ou tu utilises MongoDB dans un autre contexte (WSL/VM) ?

Dis-moi aussi ta **version MongoDB** (ou copie/colle le chemin du `mongod.exe`), et je te donne la config exacte pour ton installation.

