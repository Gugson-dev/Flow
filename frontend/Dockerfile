# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci

# Skopiuj resztę kodu
COPY . .

# Build aplikacji Vite/React
RUN npm run build

# Serwuj frontend np. za pomocą `serve`
RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]