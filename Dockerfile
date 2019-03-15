FROM node:11-stretch

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y python
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Set environment variables
ARG NODE_ENV=production
ARG APP_NAME=koa-hackathon-starter
ARG DEBUG=koa[^\w][^r]*
ARG PORT=8080
ARG DB_HOST=localhost
ARG DB_PORT=5432
ARG DB_NAME=koa-hackathon-starter
ARG DB_USER=root
ARG DB_PASS=root
ARG JWT_SECRET=e8d5cf65dae72adca3aa7bada5f3c48c5504f11f0e65ce8f60
ARG JWT_ISS=koa-hackathon-starter
ARG JWT_SUB=khs-auth
ARG JWT_AUD=khs-user
ARG SG_KEY=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

EXPOSE 8080

CMD ["npm", "run", "serve"]