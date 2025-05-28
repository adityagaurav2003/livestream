FROM ubuntu:focal

# Install Node.js and ffmpeg
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y nodejs ffmpeg

# Set working directory
WORKDIR /home/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose port (required for Render detection)
EXPOSE 3000

# Start your app directly (no nodemon)
CMD ["node", "index.js"]
