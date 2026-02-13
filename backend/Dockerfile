FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN rm -f package-lock.json && npm install --legacy-peer-deps --verbose

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
