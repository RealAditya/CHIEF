<<<<<<< HEAD
# CHIEF

CHIEF is a privacy-first personal operations platform.

## Prerequisites

- Docker
- Docker Compose
- Python 3.12 (optional, for local development)

## Project Structure

- backend/ - FastAPI application
- frontend/ - frontend application placeholder
- core/ - shared core infrastructure
- modules/ - future module packages
- docker/ - Docker-related assets
- docs/ - architecture and project documents
- scripts/ - operational scripts
- tests/ - tests

## Setup

1. Copy .env.example to .env if you want to override defaults.
2. Build and start the stack:

```bash
docker compose up --build
```

## Run

The stack starts:

- backend on http://localhost:8000
- postgres on localhost:5432
- redis on localhost:6379

## Health Endpoint

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status": "healthy"}
```

## Docker Commands

```bash
docker compose up
docker compose down
docker compose logs -f backend
```
=======
# CHIEF
>>>>>>> 29b297556a5373367e6c4abc2866c7bebd366b42
