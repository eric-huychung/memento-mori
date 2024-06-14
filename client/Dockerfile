# Use an official Node.js image as a base
FROM node:18

# Install Expo CLI globally
RUN npm install -g expo-cli

# Set the working directory in the container
WORKDIR /client

# Copy the package*.json files
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps

# Copy the application code
COPY . .

# Expose the port the application will use
EXPOSE 8081

# Run the command to start the development server
CMD ["npx", "expo", "start"]
