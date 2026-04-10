FROM node:22-alpine AS deps
WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm ci

FROM deps AS build
WORKDIR /app

COPY . ./

ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:1.29-alpine AS runtime
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
