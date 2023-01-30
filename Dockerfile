FROM node:16

WORKDIR /usr/src/app

RUN apt install curl bash

RUN curl -s https://packagecloud.io/install/repositories/ookla/speedtest-cli/script.deb.sh | bash

RUN apt install speedtest

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]