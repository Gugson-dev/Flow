# frontend/Dockerfile
FROM node:20-alpine AS build

# Ustaw katalog roboczy
WORKDIR /app

# Kopiuj package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm ci

# Skopiuj resztę kodu
COPY . .

# Build aplikacji Vite/React
RUN npm run build

# Użyj Nginx do serwowania statycznych plików
FROM nginx:alpine

# Skopiuj pliki z etapu build do katalogu Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Skopiuj konfigurację Nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Ustawienie portu, na którym Nginx będzie nasłuchiwał
EXPOSE 80

# Domyślna komenda
CMD ["nginx", "-g", "daemon off;"]