FROM node:20-alpine

WORKDIR /app

# cache this layer and skip re-installing dependencies unless these files changes
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
