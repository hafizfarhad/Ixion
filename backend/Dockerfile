FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && apt-get clean

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]