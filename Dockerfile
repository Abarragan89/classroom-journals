FROM node:24-alpine

RUN npm install -g pm2

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

COPY ecosystem.config.js .

CMD ["pm2-runtime", "ecosystem.config.js"]