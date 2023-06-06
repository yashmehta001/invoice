# Use the official Node.js 14 image as the base image
FROM node:18.12.1-alpine

# Set the working directory inside the container
WORKDIR /app

# Install additional dependencies
RUN apk add --no-cache chromium


# Set Chrome path environment variable
ENV CHROME_BIN=/usr/bin/chromium-browser

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

RUN npm install && npm cache clean --force

# Copy the application source code to the working directory
COPY . .

# Create necessary directories
RUN mkdir -p files/logo
RUN mkdir -p files/pdf

# Set environment variables
# ENV NODE_ENV=production
# ENV PORT=3000

# Expose the port on which the NestJS application will run
EXPOSE 3000

# Specify the command to run the NestJS application
CMD ["npm", "run", "start:dev"]
