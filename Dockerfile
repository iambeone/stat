FROM keymetrics/pm2:latest-alpine

WORKDIR /var/www/server

COPY ./src ./src

COPY ./public ./public

COPY package.json .

COPY index.js .

RUN yarn install

CMD [ "yarn", "serve"]

EXPOSE 8080