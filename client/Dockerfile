FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json .

RUN npm install --force

COPY . .

RUN npm run build