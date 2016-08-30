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


#RUN touch /root/.npmrc 

#RUN echo "https-proxy=https://web-proxy.houston.hp.com:8080" >> /root/.npmrc

#RUN echo "registry=http://registry.npmjs.org/" >> /root/.npmrc

#RUN echo "strict-ssl=false" >> /root/.npmrc

#RUN echo "http-proxy=https://web-proxy.houston.hp.com:8080" >> /root/.npmrc

#RUN echo "proxy=http://web-proxy.houston.hp.com:8080/" >> /root/.npmrc

#RUN touch /usr/etc/npmrc

#RUN echo "http-proxy = http://web-proxy.houston.hp.com:8080" >> /usr/etc/npmrc

#RUN echo "https-proxy = https://web-proxy.houston.hp.com:8080" >> /usr/etc/npmrc

RUN npm config set proxy http://web-proxy.houston.hp.com:8080 \
		&& npm config set https-proxy https://web-proxy.houston.hp.com:8080 \
		&& npm config set registry "http://registry.npmjs.org/" \
		&& npm set strict-ssl false \
		&& npm config set ca=null \
		&& npm --proxy http://web-proxy.houston.hp.com:8080 install -g gulp

#RUN npm cache clear 

#RUN npm config set proxy http://web-proxy.houston.hp.com:8080/
#RUN npm config set https-proxy https://web-proxy.houston.hp.com:8080/

#RUN npm install -g gulp 

COPY . /usr/src/dcos-ui
WORKDIR /usr/src/dcos-ui

RUN npm --proxy http://web-proxy.houston.hp.com:8080 install 

CMD ["npm", "run", "serve"]
