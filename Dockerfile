# Use the official Node.js 18 image as the base image
FROM node:18

# Install dependencies
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  gnupg \
  ca-certificates \
  --no-install-recommends

# Install Chrome browser
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update \
  && apt-get install -y google-chrome-stable \
  --no-install-recommends

# Set Chrome path environment variable
ENV CHROME_BIN=/usr/bin/chromium-browser

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

RUN mkdir /files
RUN mkdir /files/logo
RUN mkdir /files/pdf

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Specify the command to run the NestJS application
CMD ["npm", "run", "start:dev"]
