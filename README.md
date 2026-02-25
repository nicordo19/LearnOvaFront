# Frontend

Ce projet a été généré avec [Angular CLI](https://github.com/angular/angular-cli) version 20.3.10.

## Installation

### Cloner le dépôt

```bash
git clone <"https://github.com/nicordo19/LearnOvaFront">
cd frontend
```

### Installer les dépendances

```bash
npm install
```

### Lancer l’application

```bash
npm start  // en locale
docker compose up pour lencer le fronte le back et la base de donné en meme temps
```

Une fois le serveur démarré, ouvrez votre navigateur et rendez-vous sur `http://localhost:4200/`. L’application se rechargera automatiquement à chaque modification des fichiers source.

## Génération de code (scaffolding)

Angular CLI fournit des outils de génération. Pour créer un nouveau composant :

```bash
ng generate component nom-du-composant
```

Pour la liste complète des schémas disponibles (ex. `components`, `directives`, `pipes`) :

```bash
ng generate --help
```

## Build

Pour construire le projet :

```bash
ng build

pour builder coté docker  // docker compose up build
```

Les artefacts de build seront générés dans le dossier `dist/`. Par défaut, le build de production optimise les performances.

## Lancer les tests unitaires

Pour exécuter les tests unitaires avec [Karma](https://karma-runner.github.io) :

```bash
ng test
```

## Lancer les tests end-to-end

Pour les tests end-to-end (e2e) :

```bash
ng e2e
```

Angular CLI ne fournit pas de framework e2e par défaut. Vous pouvez choisir celui qui convient.

## Ressources supplémentaires

Pour plus d’informations sur Angular CLI et les commandes disponibles, consultez la [documentation officielle](https://angular.dev/tools/cli).
