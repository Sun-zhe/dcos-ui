FROM alpine

#ENV http_proxy http://web-proxy.houston.hp.com:8080
#ENV https_proxy https://web-proxy.houston.hp.com:8080

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

#RUN npm config set registry http://registry.npmjs.org/

#RUN npm config set http-proxy http://web-proxy.houston.hp.com:8080

#RUN npm config set https-proxy http://web-proxy.houston.hp.com:8080

RUN npm set strict-ssl false

RUN npm --proxy http://web-proxy.houston.hp.com:8080 --https-proxy https://web-proxy.houston.hp.com:8080 --strict-ssl false install -g gulp

COPY . /usr/src/dcos-ui
WORKDIR /usr/src/dcos-ui

RUN npm --proxy http://web-proxy.houston.hp.com:8080 --https-proxy https://web-proxy.houston.hp.com:8080 --strict-ssl false install

CMD ["npm", "run", "serve"]
