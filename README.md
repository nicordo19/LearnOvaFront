# LearnOvaFront
LearnOva est une plateforme d’apprentissage par la vidéo et de  partage de connaissance. Elle permet aux utilisateurs d’accéder facilement à des cours vidéo organisés par catégories, et aux formateurs de publier leurs contenus en toute simplicité.

# Docker Front

# Générer le build Angular

Exécuter :

```bash
npx ng build --configuration production

```

Cela crée un dossier :

```
frontend/dist/<frontend>/

```

Ce dossier contient **le site optimisé prêt pour la production**.

# Créer le Dockerfile du frontend

À la racine du dossier `frontend/`, créer un fichier **Dockerfile** :

```
ProjetRNCP/frontend/Dockerfile

```

### 📄 **Contenu :**

```docker
# Étape 1 : Build Angular avec Node
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Étape 2 : Serveur Nginx pour la production
FROM nginx:stable

COPY --from=build /app/dist/ /usr/share/nginx/html

```

# . Build de l’image Docker

Toujours dans `frontend/` :

```bash
docker build -t frontend-image .

```

Tests :

```bash
docker images

```

Tu dois voir `frontend-image`.

# Lancer le frontend dans un container

```bash
docker run -p 4200:80 frontend-image

```

### 🔍 Pourquoi `4200:80` ?

- 80 = port interne utilisé par Nginx
- 4200 = port externe que tu utilises sur ton Mac

Donc l’application est accessible via :

👉 http://localhost:4200
