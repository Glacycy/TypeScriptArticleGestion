# Application E-commerce Articles de Sport

Cette application web permet de gérer un catalogue d'articles de sport et un panier d'achat. Elle est développée en TypeScript avec Webpack et utilise RxJS pour la gestion des états.

## Fonctionnalités

- Affichage d'une liste d'articles de sport
- Filtrage des articles par catégorie
- Ajout de nouveaux articles
- Modification d'articles existants
- Suppression d'articles
- Gestion d'un panier d'achat avec calcul automatique du total
- Gestion des erreurs avec notifications

## Prérequis

Pour faire fonctionner ce projet, vous devez avoir installé :

- Node.js (version 14 ou supérieure)
- npm (normalement installé avec Node.js)
- json-server (pour simuler l'API backend)

## Installation

2. Installez les dépendances :
```bash
npm install
```

3. Installez json-server globalement (si vous l'avez déjà installé auparavant, vous pouvez passer cette étape) :
```bash
npm install -g json-server
```

## Démarrage de l'application

1. Démarrez le serveur JSON (dans un premier terminal) :
```bash
json-server --watch db.json
```

2. Démarrez l'application (dans un second terminal) :
```bash
npm start
```

L'application sera accessible à l'adresse : http://localhost:8080

## Structure du Projet

```
esport/
├── src/
│   ├── components/      # Composants de l'application
│   │   ├── Article.ts
│   │   ├── ArticleForm.ts
│   │   ├── ArticleList.ts
│   │   ├── ArticleFilter.ts
│   │   ├── Cart.ts
│   │   └── EditArticle.ts   
│   ├── services/        # Services de gestion des données
│   │   ├── ArticleService.ts
│   │   ├── CartService.ts
│   │   └── ErrorService.ts
│   ├── interfaces/      # Interfaces TypeScript
│   │   └── ArticleInterface.ts
│   ├── utils/          # Utilitaires
│   │   └── Component.ts
│   ├── index.html      # Page HTML principale
│   └── index.ts        # Point d'entrée de l'application
├── webpack.config.js    # Configuration Webpack
├── tsconfig.json       # Configuration TypeScript
├── package.json        # Dépendances et scripts
└── db.json            # Base de données JSON
```

## Technologies Utilisées

- TypeScript - Pour le typage statique et la POO
- Webpack - Pour le bundling et le développement
- RxJS - Pour la gestion réactive des états
- Bootstrap 5 - Pour le style et la mise en page
- json-server - Pour simuler une API REST

## Services Principaux

### ArticleService
Gère les opérations CRUD sur les articles :
- Chargement des articles
- Ajout d'articles
- Modification d'articles
- Suppression d'articles
- Filtrage par catégorie

### CartService
Gère les opérations du panier :
- Ajout d'articles au panier
- Suppression d'articles
- Mise à jour des quantités
- Calcul automatique du total

### ErrorService
Gère l'affichage des erreurs de manière centralisée

## Points Techniques Importants

- Utilisation du pattern Singleton pour les services
- Gestion des états avec RxJS (BehaviorSubject)
- Communication avec l'API via fetch
- Typage strict avec TypeScript (pas de any)
- Architecture orientée composants
- Gestion des erreurs centralisée