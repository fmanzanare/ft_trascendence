FROM python:3.11.4-slim-buster

WORKDIR /usr/src/django

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt \
    && apk add vim


COPY . .

COPY ./entrypoint.sh .
RUN chmod +x /usr/src/django/entrypoint.sh

RUN apt-get update && apt-get install -y netcat

ENTRYPOINT ["sh", "/usr/src/django/entrypoint.sh"]
