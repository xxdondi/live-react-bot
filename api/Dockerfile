FROM node:lts-iron
WORKDIR /app
COPY package.json package-lock.json .
RUN npm ci
COPY . .
RUN npm test
EXPOSE 3000
CMD ["npm", "start"]
