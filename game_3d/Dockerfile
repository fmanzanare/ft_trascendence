# docker build -f Dockerfile_game_3d_dev -t game_3d .
# docker run -it -v $PWD:/usr/src/app/transcendence -p 5173:5173 game_3d
# http://localhost:5173/transcendence/backend/game/index.html

FROM node:21-alpine3.17

WORKDIR /usr/src/app/

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"]
