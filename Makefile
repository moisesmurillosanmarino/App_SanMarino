.PHONY: up down open logs restart rebuild build-angular check-port help

help:
	@echo "🧰 Opciones disponibles:"
	@echo "  make up             👉 Levanta los servicios Docker (compila frontend)"
	@echo "  make down           👉 Detiene y elimina los contenedores"
	@echo "  make rebuild        👉 Fuerza reconstrucción completa"
	@echo "  make restart        👉 Reinicia los contenedores activos"
	@echo "  make logs           👉 Muestra logs en tiempo real"
	@echo "  make open           👉 Abre navegador en frontend y API"
	@echo "  make build-angular  👉 Compila Angular en modo producción"
	@echo "  make check-port     👉 Verifica si el puerto 5050 está libre"

up: check-port build-angular
	docker-compose up -d --build
	@echo "⏳ Esperando que los servicios estén listos..."
	@sleep 10
	@$(MAKE) open

down:
	docker-compose down

rebuild: down clean-dangling build-angular
	docker-compose up -d --build
	@$(MAKE) open

restart:
	docker-compose restart
	@$(MAKE) open

logs:
	docker-compose logs -f

open:
	@echo "🌐 Abriendo navegador..."
	@open http://localhost:4200
	@open http://localhost:4200/api/weatherforecast

build-angular:
	@echo "🛠️ Compilando Angular en frontend..."
	cd frontend && npm install && npm run build -- --configuration=production

check-port:
	@echo "🔎 Verificando puerto 5050..."
	@if lsof -i :5050 >/dev/null; then \
		echo "❌ El puerto 5050 ya está en uso. Libéralo antes de continuar."; \
		exit 1; \
	else \
		echo "✅ Puerto 5050 disponible."; \
	fi

clean-dangling:
	@echo "🧹 Limpiando contenedores en conflicto..."
	-docker rm -f sanmarinoapp-backend sanmarinoapp-db sanmarinoapp-frontend >/dev/null 2>&1 || true
	@echo "🧹 Limpiando imágenes huérfanas..."