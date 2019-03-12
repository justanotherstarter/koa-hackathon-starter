# koa-hackathon-starter

Koa boilerplate app which uses postgres as it's database and Sequelize as an ORM.

## Setup

1. Copy `.env.example` into `.env` and fill it out.
2. Change the package name (and other details) in `package.json`.
3. Setup the packages with `npm install`, make yourself a cup of tea this can take long.
4. Create a database (with the same name in your `.env`) using your favourite DB admin tool.
5. Run `npm run createscripts`, this will handle permissions for all the scripts in `bin/`.
6. Run `npm run createtables`, this will create tables in your database from your models.
8. Put your frontend in `static/`.
7. You're done! Launch the app with `npm run serve:dev` and open it in your browser.

## TODO

[ ] Add testing with jest
[ ] Dockerize - use docker-compose so that you can have different containers for db and app
[ ] Add profile update (change username, email)
