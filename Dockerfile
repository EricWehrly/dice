FROM node:22-slim

WORKDIR /app

# load package first so that (hopefully) 
    # the install step only triggers if it has changed
ADD package.json /app/package.json

RUN yarn install

ADD . /app

CMD ["yarn", "run build"]
