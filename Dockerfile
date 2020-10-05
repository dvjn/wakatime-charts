FROM alpine:latest
RUN apk update && apk add --no-cache --update bash git nodejs npm

COPY package*.json ./
RUN npm ci

COPY entrypoint.sh generate-charts.js ./

ENTRYPOINT [ "./entrypoint.sh" ]
