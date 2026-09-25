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

# Wygeneruj klienta Prisma
RUN npx prisma generate

# Zbuduj backend (NestJS)
RUN npm run build

RUN cp -r prisma/generated dist/prisma/generated

# Expose port NestJS
EXPOSE 3000

# Domyślna komenda
CMD ["node", "dist/src/main.js"]

