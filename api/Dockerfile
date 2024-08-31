# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any dependencies
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN apt-get update && apt-get install -y git vim net-tools build-essential google-cloud-cli=473.0.0-0

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the pre-downloaded NLTK data
COPY nltk_data /app/nltk_data

# Set environment variable for NLTK data
ENV NLTK_DATA=/app/nltk_data

# Copy the current directory contents into the container at /app
COPY . .

# Expose the port the app runs on
EXPOSE 10000

# Command to run the application
CMD ["gunicorn", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "InsightFlow.main:app", "--bind", "0.0.0.0:10000"]
