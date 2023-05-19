# Use the official Node.js 18 image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the application source code to the working directory
COPY . .

# Expose the port on which the NestJS application will run
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Specify the command to run the NestJS application
CMD ["npm", "run", "start:prod"]
