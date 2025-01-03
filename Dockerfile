# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

# Instale as dependências
COPY package.json yarn.lock ./
RUN yarn install

# Copie o código-fonte e construa o aplicativo
COPY . .
RUN yarn build

# Etapa 2: Servir os arquivos estáticos
FROM nginx:stable-alpine

# Copie os arquivos do build para o diretório padrão do Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Exponha a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
