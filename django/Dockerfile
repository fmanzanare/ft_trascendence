FROM python:3.12.5-bookworm

RUN apt-get update && \
    apt-get install -y netcat-traditional && \
    groupadd -r nonroot && \
    useradd -r -g nonroot nonroot

RUN mkdir -p /home/nonroot/django

WORKDIR /home/nonroot/django

RUN chown -R nonroot:nonroot /home/nonroot
RUN chown -R nonroot:nonroot /home/nonroot/django

# USER nonroot

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

ENTRYPOINT ["sh", "/home/nonroot/django/entrypoint.sh"]
