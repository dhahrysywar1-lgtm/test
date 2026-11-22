
FROM node:22-alpine

WORKDIR /app

# Installer uniquement les dépendances nécessaires en production
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copier le code source
COPY backend/src ./src

EXPOSE 8000

CMD ["npm", "start"]
