# GTFS-RT Reader

Application web Next.js pour visualiser et manipuler des flux GTFS-RT (General Transit Feed Specification - Realtime) en mode hors ligne.

## 🚀 Fonctionnalités

- **Chargement de flux GTFS-RT** : Via URL ou import de fichier
- **Mode hors ligne** : PWA avec cache et service worker
- **Visualisation** : Tableaux détaillés pour véhicules, trips et alertes
- **Carte interactive** : Visualisation sur MapLibre GL avec style moderne
- **Éditeur de mock** : Création et modification d'alertes pour les tests
- **API mock** : Endpoint personnalisé par utilisateur avec ID unique
- **Refresh automatique** : Configurable (10s, 30s, 1min, 2min, 5min)
- **Détection de ville** : Basée sur les positions GPS des véhicules

## 🛠️ Technologies

- **Next.js** 16.0.8
- **React** 19
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (state management)
- **MapLibre GL JS**
- **gtfs-realtime-bindings** (Protobuf)

## 📦 Installation

```bash
npm install
```

## 🚀 Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3005`

## 📄 Pages

- **/** : Page d'accueil avec chargement et visualisation
- **/tableau** : Vue tableau simplifiée
- **/map** : Carte interactive avec positions des véhicules
- **/raw** : Données brutes JSON du flux
- **/mock** : Éditeur pour créer/modifier des alertes

## 🔌 API

### Mock GTFS-RT

- **GET** `/api/mock/gtfs-rt?id=XXXXX` : Récupère le flux mock pour l'ID spécifié
- **POST** `/api/mock/gtfs-rt?id=XXXXX` : Enregistre un flux mock
- **DELETE** `/api/mock/gtfs-rt?id=XXXXX` : Supprime un flux mock

## 📝 Structure

```
├── app/
│   ├── api/mock/gtfs-rt/    # API route pour les mocks
│   ├── map/                  # Page carte
│   ├── mock/                 # Page éditeur de mock
│   ├── raw/                  # Page données brutes
│   ├── tableau/              # Page tableau
│   ├── store/                # Store Zustand
│   └── layout.tsx            # Layout principal
├── components/
│   ├── forms/                # Formulaires
│   ├── layout/               # Composants de layout
│   ├── sections/             # Sections de page
│   ├── tables/               # Tableaux de données
│   └── ui/                   # Composants UI réutilisables
├── lib/
│   ├── cityDetector.ts       # Détection de ville
│   └── gtfs.ts               # Parsing/encoding GTFS-RT
└── public/                   # Assets statiques
```

## 🎯 Utilisation

1. Charger un flux GTFS-RT via URL ou fichier
2. Visualiser les données dans les différents onglets
3. Utiliser l'éditeur de mock pour créer/modifier des alertes
4. Récupérer le flux modifié via l'API avec votre ID unique

## 📱 PWA

L'application est configurée comme Progressive Web App et peut être installée sur mobile/desktop.

## 📄 Licence

MIT

