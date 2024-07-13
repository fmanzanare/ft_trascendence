# Desde /sgoinfre/shared/42toolbox ejecutar "sh init_docker.sh"
# Ejecutar estos comando estando en el directorio game_3d/

# docker build -f Dockerfile -t game_3d .
# docker run -it -v $PWD/src:/usr/src/app/src -p 5173:5173 game_3d

# http://localhost:5173/src/index.html

FROM node:21-alpine3.17

WORKDIR /usr/src/game_3d/

COPY . /usr/src/game_3d/
RUN npm install

EXPOSE 3000

CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]
