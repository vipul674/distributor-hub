FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install dependencies for frontend and backend builds.
COPY package.json ./
COPY server/package.json ./server/package.json
RUN npm install && npm --prefix server install

# Build frontend assets.
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install only backend runtime dependencies.
COPY server/package.json ./server/package.json
RUN npm --prefix server install --omit=dev

# Copy runtime app files.
COPY server ./server
COPY --from=build /app/dist ./dist
COPY Retail_Models_Onnx ./Retail_Models_Onnx

EXPOSE 8000
CMD ["npm", "--prefix", "server", "run", "start"]
