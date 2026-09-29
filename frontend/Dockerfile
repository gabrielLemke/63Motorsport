# ==========================================
# Estágio 1: Build da Aplicação React
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Argumento da URL da API injetado no momento do build
ARG VITE_API_URL=http://localhost:3333
ARG VITE_WHATSAPP_PHONE=5547999999999
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WHATSAPP_PHONE=$VITE_WHATSAPP_PHONE

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Estágio 2: Servidor Web Nginx
# ==========================================
FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
