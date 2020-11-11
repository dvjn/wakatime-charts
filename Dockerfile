FROM alpine:latest
RUN apk update && apk add --no-cache --update bash git nodejs npm

WORKDIR /app

COPY package*.json /app/
RUN npm ci

COPY entrypoint.sh generate-charts.js colors.json /app/

ENTRYPOINT [ "/app/entrypoint.sh" ]