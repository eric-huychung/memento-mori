# Use an official Node.js image as a base
FROM node:18

# Set the working directory in the container
WORKDIR /server

# Copy the package*.json files
COPY package*.json ./
COPY package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose the port the application will use
EXPOSE 8000

# Run the command to start the development server
CMD ["npm", "run", "start"]