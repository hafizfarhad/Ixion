# Suggested improvements:
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for PSQL
# RUN apt-get update && apt-get install -y \
#     gcc \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*

# Layer caching optimization
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Production settings
ENV FLASK_APP=app.py
ENV FLASK_DEBUG=0
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:app"]