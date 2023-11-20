
DOCKER_COMPOSE = docker-compose

# Base operations
.PHONY: up
up:
	$(DOCKER_COMPOSE) up -d --build

.PHONY: down
down:
	$(DOCKER_COMPOSE) down

.PHONE: re
re: down up

.PHONY: restart
restart:
	$(DOCKER_COMPOSE) restart

.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

.PHONY: exec
exec:
	$(DOCKER_COMPOSE) exec <service_name> <command>

.PHONY: build
build:
	$(DOCKER_COMPOSE) build

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  up		 : Start the containers"
	@echo "  down	   : Stop and remove the containers"
	@echo "  restart	: Restart the containers"
	@echo "  logs	   : Show the logs of the containers"
	@echo "  exec	   : Execute a command inside a service container"
	@echo "  build	  : Build the containers"
