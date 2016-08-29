FROM alpine

#ENV http_proxy http://web-proxy.houston.hp.com:8080
#ENV https_proxy https://web-proxy.houston.hp.com:8080

RUN npm config set registry http://registry.npmjs.org/

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
RUN npm cache clear 
RUN npm config set http-proxy http://web-proxy.houston.hp.com:8080

RUN npm config set https-proxy https://web-proxy.houston.hp.com:8080

#RUN npm set strict-ssl false

RUN npm --proxy http://web-proxy.houston.hp.com:8080 --https-proxy https://web-proxy.houston.hp.com:8080 install -g gulp --registry http://registry.npmjs.org/

COPY . /usr/src/dcos-ui
WORKDIR /usr/src/dcos-ui

RUN npm --proxy http://web-proxy.houston.hp.com:8080 --https-proxy https://web-proxy.houston.hp.com:8080 install --registry http://registry.npmjs.org/

CMD ["npm", "run", "serve"]
