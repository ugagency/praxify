# Etapa 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app-src

# Copia os arquivos de configuração primeiro (otimiza cache de layers do Docker)
COPY ./app/package*.json ./

# Instala as dependências no Linux (com permissões corretas nos binários)
RUN npm install --legacy-peer-deps

# Copia o restante do código-fonte (node_modules já está excluído via .dockerignore)
COPY ./app ./

# Compila a aplicação para produção
RUN npm run build

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Copiar a configuração customizada do Nginx para suportar SPA routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos estáticos da etapa de build para o diretório padrão do Nginx
COPY --from=builder /app-src/dist /usr/share/nginx/html

# Copiar login.html manualmente (não está no build do Vite - usa CDN para Supabase)
COPY ./app/src/login.html /usr/share/nginx/html/src/login.html

# Expor a porta 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
