DOCKER_COMPOSE = docker compose

# Base operations
.PHONY: all
all:
	$(DOCKER_COMPOSE) up --build

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONY: clean
clean:
	docker system prune

.PHONY: clean_all
clean_all:
	docker system prune -a

.PHONY: clean_volumes
clean_volumes: down
	docker volume rm $$(docker volume ls -q)

# Exec container operations
.PHONY: p_shell
p_shell:
	docker exec -it backend python manage.py shell_plus

.PHONY: makemigrations
makemigrations:
	docker exec -it backend python manage.py makemigrations
	
.PHONY: migrate
migrate:
	docker exec -it backend python manage.py migrate

.PHONY: backend_debug
backend_debug:
	docker exec -it backend sh

.PHONY: postgre_debug
postgre_debug:
	docker exec -it postgre psql -U ft_db

.PHONY: caddy_debug
caddy_debug:
	$(DOCKER_COMPOSE) exec caddy sh

.PHONY: redis_debug
redis_debug:
	$(DOCKER_COMPOSE) exec redis sh

# Additional operations
.PHONY: re
re: down up

.PHONY: restart
restart:
	$(DOCKER_COMPOSE) restart

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f --tail=1000

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  all                 Builds and up all containers"
	@echo "  build               Build containers"
	@echo "  down                Stop and remove containers"
	@echo "  clean               Removes stopped containers"
	@echo "  clean_all           Removes stopped containers and images"
	@echo "  restart             Restart containers"
	@echo "  logs                Show the logs of the containers"
	@echo "  p_shell             Opens python shell on backend container"
	@echo "  makemigrations      Generates migration files on django"
	@echo "  migrate             Makes migrations on django"
	@echo "  backend_debug       Opens sh on backend container"
	@echo "  postgre_debug       Opens sh on postgre container"
	@echo "  caddy_debug         Opens sh on caddy container"
	@echo "  redis_debug         Opens sh on redis container"
