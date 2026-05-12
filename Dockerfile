# ─── Stage 1: Build ───
FROM node:20-alpine AS builder

WORKDIR /app

# Variable d'environnement pour l'URL de l'API (donnée lors du build)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ─── Stage 2: Production (Nginx) ───
FROM nginx:stable-alpine AS production

# Supprimer la configuration par défaut de Nginx (évite les conflits)
RUN rm -rf /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers construits depuis l'étape de build vers le dossier de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]