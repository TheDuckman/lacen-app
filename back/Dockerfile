FROM gpato/lacen-base:latest
ENV DEBIAN_FRONTEND=noninteractive

# Building backend
COPY package.json yarn.lock ./
RUN yarn --ignore-optional --production=false install && yarn cache clean --force
ENV PATH /opt/app/node_modules/.bin:$PATH
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
# ENV RDATA_PATH=/LACEN_saved_files

RUN groupadd -g 513 node
RUN useradd -rm -d /home/node -s /bin/bash -g node -G root,sudo -u 1001 node

# install dependencies first, in a different location for easier app bind mounting for local development
# due to default /opt permissions we have to create the dir with root and change perms
RUN mkdir /opt/app && chown -R node:node /opt/app
# saved files folder will be mapped to an outside folder. It must be owned by the same user in the container and on the host
RUN mkdir /opt/app/saved-files && chown -R www-data:www-data /opt/app/saved-files
RUN mkdir /opt/app/src
WORKDIR /opt/app

# the official node image provides an unprivileged user as a security best practice
# but we have to manually enable it. We put it here so npm installs dependencies as the same
# user who runs the app.
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user
USER node
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --no-optional --production=false && yarn cache clean --force
ENV PATH /opt/app/node_modules/.bin:$PATH


COPY src src
COPY ./package.json ./package.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./yarn.lock ./yarn.lock
COPY ./openssl-config ./openssl-config
RUN yarn build

COPY ./src/scripts ./dist/scripts


# https://letsencrypt.org/docs/certificates-for-localhost/
RUN openssl req -x509 -out dist/localhost.crt -keyout dist/localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config openssl-config

CMD ["yarn", "production-run"]