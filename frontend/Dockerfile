# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS dev-build

ENV NODE_ENV=dev

WORKDIR /usr/src/app

# Run the application as a non-root user.
RUN chown node:node /usr/src/app

USER node

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY --chown=node:node . .

EXPOSE 5173

CMD ["npx", "vite"]
