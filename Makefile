
DOCKER_COMPOSE = docker-compose

# Base operations
.PHONY: up
up:
	$(DOCKER_COMPOSE) up -d --build

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

p_shell:
	docker exec -it ft_transcendence_backend_1 python manage.py shell_plus

db_debug:
	docker exec -it ft_transcendence_db_1 psql -U ft_db

.PHONY: re
re: down up

.PHONY: restart
restart:
	$(DOCKER_COMPOSE) restart

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

.PHONY: exec
exec:
	$(DOCKER_COMPOSE) exec frontend sh

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: makemigrations
makemigrations:
	docker exec -it ft_transcendence_backend_1 python manage.py makemigrations
	
.PHONY: migrate
migrate:
	docker exec -it ft_transcendence_backend_1 python manage.py migrate

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  up		 : Start the containers"
	@echo "  down	   : Stop and remove the containers"
	@echo "  restart	: Restart the containers"
	@echo "  logs	   : Show the logs of the containers"
	@echo "  exec	   : Execute a command inside a service container"
	@echo "  build	  : Build the containers"
