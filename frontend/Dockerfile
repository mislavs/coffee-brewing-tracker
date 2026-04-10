FROM node:22-alpine AS deps
WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci

FROM deps AS build
WORKDIR /app

COPY . ./

RUN npm run build

FROM nginx:1.29-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
