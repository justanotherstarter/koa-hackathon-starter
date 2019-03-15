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

# Create tables
RUN npm run createtables

EXPOSE 8080

CMD ["npm", "run", "serve"]