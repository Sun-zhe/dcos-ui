FROM alpine

ENV http_proxy http://web-proxy.houston.hp.com:8080
ENV https_proxy https://web-proxy.houston.hp.com:8080

# install dependencies for imagemin
RUN apk update && apk add \
	autoconf \
	automake \
	build-base \
	file \
	libpng-dev \
	nasm \
	nodejs \
	&& rm -rf /var/cache/apk/*

RUN npm config --global set proxy http://web-proxy.houston.hp.com:8080

RUN npm config --global set https-proxy https://web-proxy.houston.hp.com:8080

RUN npm --proxy https://web-proxy.houston.hp.com:8080 install -g gulp

COPY . /usr/src/dcos-ui
WORKDIR /usr/src/dcos-ui

RUN npm --proxy https://web-proxy.houston.hp.com:8080 install

CMD ["npm", "run", "serve"]
