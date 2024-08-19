# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the pre-downloaded NLTK data
COPY nltk_data /app/nltk_data

# Set environment variable for NLTK data
ENV NLTK_DATA=/app/nltk_data

# Copy the current directory contents into the container at /app
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "InsightFlow.main:app", "--bind", "0.0.0.0:8000"]
