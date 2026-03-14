# backend/Dockerfile
FROM node:20-alpine

# Ustaw katalog roboczy
WORKDIR /app

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci

# Skopiuj resztę kodu
COPY . .

# Zbuduj backend (NestJS)
RUN npm run build

# Expose port NestJS
EXPOSE 3000

# Domyślna komenda
CMD ["npm", "run", "start:dev"]