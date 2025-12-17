FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y nginx curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend
COPY backend/ backend/
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Frontend static
COPY frontend/dist/ frontend/

# Nginx config
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Collect static
RUN python backend/manage.py collectstatic --noinput

EXPOSE 80

CMD service nginx start && \
    gunicorn config.wsgi:application \
    --bind 127.0.0.1:8000
