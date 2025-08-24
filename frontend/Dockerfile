# Etapa 1: Compilar Angular
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar archivos necesarios
COPY package.json yarn.lock ./
COPY angular.json tsconfig*.json ./
COPY src/ ./src

# Instalar dependencias
RUN yarn install

# Generar build con baseHref correcto
RUN yarn ng build --configuration production --base-href=/

# Etapa 2: Nginx para servir la app
FROM nginx:stable-alpine

# Limpiar la carpeta por defecto
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copiar el build generado
COPY --from=builder /app/dist/browser/ ./

# Puerto expuesto
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
