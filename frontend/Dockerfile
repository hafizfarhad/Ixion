FROM node:19-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=development

# Use development mode for faster reloading during testing
CMD ["npm", "run", "dev"]