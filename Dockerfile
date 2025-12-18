FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Instalar pnpm se necessário
RUN npm install -g pnpm

# Instalar dependências
RUN pnpm install

# Copiar código
COPY . .

# Expor porta
EXPOSE 3004

# Comando para desenvolvimento (hot reload)
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0", "--port", "3004"]

