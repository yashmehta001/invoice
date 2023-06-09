# Use the official Node.js 14 image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
  wget \
  gpg \
  && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
RUN apt-get update && apt-get install -y google-chrome-stable

# Set environment variables
ENV CHROME_BIN=/usr/bin/google-chrome


# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

RUN npm install && npm cache clean --force

# Copy the application source code to the working directory
COPY . .

# Create necessary directories
RUN mkdir -p files/logo
RUN mkdir -p files/pdf


# Expose the port on which the NestJS application will run
EXPOSE 3000

# Specify the command to run the NestJS application
CMD ["npm", "run", "start:dev"]
