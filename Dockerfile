FROM node:14-alpine AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock requirements.txt ./

RUN apk add --update --no-cache --virtual .build-deps \
      # better-sqlite3
      build-base \
      python3 \
      # fonttools
      py3-pip \
      python3-dev \
 && pip3 install --requirement requirements.txt \
 && yarn install \
 && yarn cache clean \
 && apk del .build-deps \
 && apk add --update --no-cache \
      python3

COPY . ./

RUN yarn build

FROM node:14-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/lib /usr/src/app/lib
COPY package.json yarn.lock requirements.txt ./

RUN apk add --update --no-cache --virtual .build-deps \
      # better-sqlite3
      build-base \
      python3 \
      # fonttools
      py3-pip \
      python3-dev \
 && pip3 install --requirement requirements.txt \
 && yarn install --production \
 && yarn cache clean \
 && apk del .build-deps \
 && apk add --update --no-cache \
      python3 \
 && mkdir /database \
 && ln -s /database database \
 && mkdir /storage \
 && ln -s /storage storage

COPY . ./

ENV STATIC_HOST=0.0.0.0
ENV STATIC_PORT=8080
EXPOSE 8080
ENTRYPOINT ["yarn"]
CMD ["--silent", "start"]
