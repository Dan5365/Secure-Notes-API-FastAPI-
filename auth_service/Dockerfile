FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN python -m venv /opt/venv
RUN /opt/venv/bin/pip install --upgrade pip
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY . .

FROM python:3.12-slim
WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

CMD ["/opt/venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
