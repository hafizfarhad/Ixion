FROM node:20-alpine AS builder
WORKDIR /app
# Add environment variable to fix OpenSSL issue
ENV NODE_OPTIONS=--openssl-legacy-provider
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]