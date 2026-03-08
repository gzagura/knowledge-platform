FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir poetry

COPY pyproject.toml ./
RUN pip install --no-cache-dir fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic httpx pyjwt python-jose[cryptography] bleach "pydantic[email]" pydantic-settings python-multipart email-validator bcrypt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
