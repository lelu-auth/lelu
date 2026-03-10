FROM python:3.11-slim

WORKDIR /app

# Copy the source code first
COPY . .

# Install the package in development mode
RUN pip install -e .

ENTRYPOINT ["lelu"]
CMD ["audit-log"]