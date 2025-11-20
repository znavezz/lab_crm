# Use the official Node 20 image
FROM node:20-alpine
WORKDIR /app

# Install all dependencies
# We copy package.json first to cache this layer
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy the prisma schema to generate the client
# This is needed before the app starts
COPY prisma ./prisma
RUN npx prisma generate

# Expose the Next.js dev port
EXPOSE 3000

# Create .next directory with proper permissions to avoid build manifest errors
RUN mkdir -p /app/.next && chmod -R 777 /app/.next

# Start the dev server
CMD ["npm", "run", "dev"]