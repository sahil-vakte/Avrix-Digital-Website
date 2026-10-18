FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY backend/requirements.lock.txt .
RUN pip install --no-cache-dir -r requirements.lock.txt && useradd --create-home app
COPY --chown=app:app backend/ .
RUN DJANGO_SETTINGS_MODULE=config.settings.build python manage.py collectstatic --noinput && chmod +x entrypoint.sh
USER app
EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["gunicorn", "config.wsgi", "--workers", "2", "--bind", "0.0.0.0:8000", "--access-logfile", "-"]
