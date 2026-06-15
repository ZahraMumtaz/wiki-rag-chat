# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install server dependencies
RUN npm install

# Copy client/ folder, install dependencies and build it
COPY client/ ./client/
RUN cd client && npm install && npm run build

# Copy the rest of the application code
COPY src/ ./src/

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"]
