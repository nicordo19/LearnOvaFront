# Étape 1 : Builder l'application Angular
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Étape 2 : Servir l'application avec Nginx
FROM nginx:stable

COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html

EXPOSE 80