FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build the app
COPY . .
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Serve the 'dist' directory on port 80
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]
