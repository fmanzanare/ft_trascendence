# ft_transcendence
This project is something you've never done before. Think back to the beginning of your programming journey. Look at yourself, now is your time to shine!

## Módulos completados.
- [ ] Conexión con API 42
- [X] JWT + 2FA
- [X] Microservicios
- [X] Framework Backend (Django)
- [X] Bootstrap + DB (PostgreSQL)
- [X] Graphics / 3D
- [ ] Remote
- [ ] User Statistics
- [ ] Server-side PONG
- [ ] User Management (agregar amigos se hace desde el chat)
- [ ] Live Chat

## Tareas Pendientes

### FRONTEND
- [X] Eliminar encodeURI de los formularios del front {Antonio}
- [ ] Tamaño del juego local cuando se hace resize de la pantalla {Fernando}
- [ ] Menú responsive con botón desplegable Bootstrap (Opcional) {Antonio}
- [X] Modificar el placeholder del cambio de "Username" del perfil {Antonio}
- [ ] Gestionar el registro por API 42 cuando ya existe un usuario con ese nombre (agregar #42 al final del username) {Antonio}
- [X] Agregar espacio entre "Do you have an account? Sing up" y API 42 {Antonio}
- [ ] Página de callback con API de 42 {Antonio}
- [ ] Hover effects sobre los botones principales de la interfaz {Antonio}
- [X] Cross button en modales - ELIMINADO {Antonio}
- [ ] Gráficos circulares para mostrar las estadísticas del usuario (Opcional) {Antonio}
- [ ] Refactor del Chat {Victor + Fernando}
- [ ] Actualizar el estado del front a "In Game" cuando está en partida Online. Verificar en Tournament {Antonio}
### BACKEND
- [ ] Eliminar prints de Django {Fernando}
- [ ] Redirección http a https en caddy {Antonio}
- [ ] Limitar que un mismo usuario haga login dos veces {Fernando}
- [ ] Usar "salt" para la encriptación de contraseñas (Opcional) {Fernando}
- [ ] Velocidad del juego remoto {Fernando}
- [ ] Añadir validación en Backend de la longitud del nombre de usuario (permitir un máximo de 3 caracteres más que en el front para la API de 42) {Fernando}
- [ ] Cambiar los nombres a las migraciones que genera Django. Evitar que salgan dos con "init" {Fernando}
### DOCKER
- [ ] Cambiar "docker-compose" por "docker compose" {Fernando}
- [ ] En Makefile cambiar "docker compose logs -f" por "docker compose logs -f --tail=1000" {Fernando}
- [ ] En Makefile, la regla "clean" debería usar "docer system prune" {Fernando}
- [ ] Eliminar la versión de docker-compose.yml {Fernando}
- [ ] Corregir las dependencias, de forma que backend dependa de todas, y las demás sin dependencias {Fernando}
- [ ] No exponer puertos de ningún servicio, salvo el de Caddy. La conexión entre contenedores debe hacerse desde la network de docker {Fernando}
- [ ] Poner versión mínima de la imagen "postgresql" y usar binami/postgre como imagen {Fernando}
- [ ] Añadir un fichero .env.example sólo con keys, pero sin values {Fernando}
- [ ] Poner versión mínima de la imagen de "caddy" {Fernando}
- [ ] Corregir volúmenes. Eliminar los driver y binds {Fernando}
- [ ] Crear usuario en Dockerfile para no hacerlo con root y evitar el escalado de privilegios {Fernando}
- [ ] Eliminar la instalación de netcat en el Dockerfile de Django {Fernando}
- [ ] Corregir conexión desde Caddy con dominio. Crear certificados ssl, enlazados al dominio (Opcional) {Fernando}
### EXTRAS / MEJORAS:
- [ ] Documentar en README.md {Fernando + Victor}
- [ ] Módulo de IA {Fernando}
### PRUEBAS / TESTEO:
- [ ] PNG bomba
- [ ] Envío de una petición enorme desde CURL - biblia
- [ ] Testeo con compañeros (Jarre, Sergio, Ruzafa, Pablo, etc.)