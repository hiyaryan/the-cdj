# syntax=docker/dockerfile:1

# Base the image on the specified version of Node.js using Alpine for minimal footprint
ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS dev-build

# Set the NODE_ENV environment variable to development
ENV NODE_ENV=dev

# Install global dependencies for development, including nodemon for hot reloading
RUN npm install -g nodemon

# Install netcat and MongoDB Shell (mongosh) required for the initialization script
RUN apk add --no-cache netcat-openbsd mongodb-tools

# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Change ownership of the working directory to the 'node' user for better security
# The 'node' user is a non-root user provided by the Node base image
RUN chown node:node /usr/src/app

# Switch to 'node' user to run the application as a non-root user
USER node

# Download dependencies as a separate step to leverage Docker's cache
# Mount package.json and package-lock.json from the host during build to avoid copying
# Use a cache mount to store and reuse npm's cache data across builds for speed
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the application source files into the image
# Ensure files are owned by the 'node' user
COPY --chown=node:node . .

# Copy the initialization script into the container and make it executable
COPY --chown=node:node init.sh ./init.sh
RUN chmod +x ./init.sh

# Expose port 3000 for network access to the Node.js application
EXPOSE 3000

# Run the application. -L for legacy mode to enable hot changes in container
# https://github.com/remy/nodemon?tab=readme-ov-file#application-isnt-restarting
CMD ["nodemon", "-L"]

# CMD ["sh", "-c", "./init.sh && nodemon -L"]

# DELETE ME
# After copying, list files to ensure the script is there
RUN ls -la