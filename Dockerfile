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

RUN touch /usr/etc/npmrc
RUN echo "http-proxy = "http://web-proxy.houston.hp.com:8080"" >> /usr/etc/npmrc
RUN echo "https-proxy = "https://web-proxy.houston.hp.com:8080"" >> /usr/etc/npmrc
RUN echo "registry = "http://registry.npmjs.org/"" >> /usr/etc/npmrc
RUN npm set registry http://registry.npmjs.org/

RUN npm install -g gulp

COPY . /usr/src/dcos-ui
WORKDIR /usr/src/dcos-ui

RUN npm install

CMD ["npm", "run", "serve"]
