# ==========================================
# Estágio 1: Build da Aplicação
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instalação de dependências do sistema necessárias para o Prisma
RUN apk add --no-cache openssl

# Copia manifestos de dependências e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm ci

# Gera os tipos do Prisma Client
RUN npx prisma generate

# Copia código-fonte e compila TypeScript
COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

# ==========================================
# Estágio 2: Imagem Final de Produção (Runner)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333

RUN apk add --no-cache openssl

# Copia package.json e instala somente dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copia artefatos compilados do estágio builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Segurança: Executar como usuário não-root
USER node

EXPOSE 3333

CMD ["node", "dist/server.js"]
