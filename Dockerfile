FROM node:14-alpine AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN apk add --update --no-cache --virtual .build-deps \
      git \
 && yarn install \
 && yarn cache clean \
 && apk del .build-deps

COPY . ./

RUN yarn build

FROM node:14-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/lib /usr/src/app/lib
COPY package.json yarn.lock ./

RUN apk add --update --no-cache --virtual .build-deps \
      git \
 && yarn install --production \
 && yarn cache clean \
 && apk del .build-deps \
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
