# TP7 - Tester l'API Node.js (Express + MongoDB)

## Pré-requis
1. MongoDB doit tourner et écouter sur `127.0.0.1:27017`.
2. Node.js installé.

## Lancer l'application
Dans `c:\Users\aicha\Downloads\TP7_MONGO_DB` :
1. Installer les dépendances (si pas encore fait) :
   - `npm install`
2. Démarrer l'API :
   - `npm run dev`

L’API écoute par défaut sur : `http://localhost:3000`

## Vérifier que le serveur répond
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/" -TimeoutSec 10
```

## 1) Afficher toutes les bases existantes
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/mongo/databases" -TimeoutSec 15
```

## 2) Créer / Supprimer une base

### Créer une base (via une collection d'initialisation)
```powershell
$payload = @{ dbName = "tp7demo"; collectionName = "__tp7_init" } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/mongo/databases/create" -ContentType "application/json" -Body $payload -TimeoutSec 15
```

### Supprimer une base
```powershell
$payload = @{ dbName = "tp7demo" } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/mongo/databases/drop" -ContentType "application/json" -Body $payload -TimeoutSec 15
```

## 3) Afficher les collections d’une base
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/mongo/databases/tp7demo/collections" -TimeoutSec 15
```

## 4) Ajouter un document dans une collection
```powershell
$payload = @{
  document = @{
    title = "Test Node"
    isbn = "0000000000"
    status = "PUBLISH"
  }
} | ConvertTo-Json -Compress

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/mongo/databases/tp7demo/collections/books/documents" -ContentType "application/json" -Body $payload -TimeoutSec 15
```

## 5) Import avancé depuis `books.json`
Endpoint :
- `POST http://localhost:3000/api/import/books`

### Réinitialiser puis importer (recommandé pour éviter les doublons `_id`)
```powershell
$payload = @{
  dbName = "tp7"
  collectionName = "books"
  strategy = "reset" 
} | ConvertTo-Json -Compress

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/import/books" -ContentType "application/json" -Body $payload -TimeoutSec 60
```

## Partie 5 TP1 via l’API (Q1/Q2/Q3)
Endpoints :
- `GET http://localhost:3000/api/tp1/q1`
- `GET http://localhost:3000/api/tp1/q2`
- `GET http://localhost:3000/api/tp1/q3`

Par défaut, la requête utilise `dbName` = `tp7` (ou `MONGODB_DB` depuis `.env`) et `collectionName` = `books`.

### TP1 Q1 : 200 premiers documents
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/tp1/q1" -TimeoutSec 30
```

### TP1 Q2 : catégorie "Internet" + compter
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/tp1/q2" -TimeoutSec 30
```

### TP1 Q3 : David A. Black, pageCount > 300, tri par isbn asc
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/tp1/q3" -TimeoutSec 30
```

### Option `upsert` (met à jour/inserre par `_id`)
```powershell
$payload = @{
  dbName = "tp7"
  collectionName = "books"
  strategy = "upsert"
} | ConvertTo-Json -Compress

Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/import/books" -ContentType "application/json" -Body $payload -TimeoutSec 60
```

## Variables d'environnement
Le projet lit `./.env` (si présent). Exemple attendu :
```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=tp7
```

## Prochaine étape (TP1 série 1)
Colle ici la liste exacte des questions du TP1 : je te donne les requêtes MongoDB correspondantes (via les endpoints de l’API).

