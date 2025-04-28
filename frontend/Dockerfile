FROM node:19-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies - using npm install instead of npm ci to update lock file
RUN npm install

# Copy all files
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:19-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV production

# Copy necessary files from build stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/.next/standalone ./

# Expose the port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]