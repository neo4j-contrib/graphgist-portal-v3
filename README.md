# GraphGist Portal v3

This project was started with [GRANDstack](https://grandstack.io) (GraphQL, React, Apollo, Neo4j Database).
There are two components for the portal:

- `ui-react`: the UI application in React
- `api`: the API application (GraphQL server)

### API

![GraphQL API diagram](./diagram.png)

## Local install

### Requirements

- Node.js 12 (`lts/erbium`)
- Docker and `docker-compose`

### Run GraphGist portal

Create a copy of `ui-react/.env-example` and `api/.env-example` within the same directory using the name `.env`.

```
cp ./ui-react/.env-example ./ui-react/.env
cp ./api/.env-example ./api/.env
```

#### Using Docker Compose

Using `docker-compose`:

```
docker-compose up -d
```

This will take some time on the first run.
Once the containers have been started, you can check the log to check if the UI is up and running using:

```
docker logs -f graphgist-portal-ui
```

The `docker-compose up -d` will start 3 services:

- Neo4j database with the Neo4j Browser available via HTTP at http://localhost:7474/browser/
- Web interface available at http://localhost:3000/
- GraphQL API available at http://localhost:4001/graphql

#### Using npm

```
npm i --prefix ui-react
npm i --prefix api
```

It's recommanded to run the database using Docker to use a compatible version with the Neo4j APOC library enabled:

```
docker-compose run --service-ports neo4j
```

Once the database is up and running, open a new terminal and execute:

```
npm run start --prefix api
```

Open a third terminal and execute:

```
npm run start --prefix ui-react
```

### Switch to admin

Once you've created an account, you can manually update the associated user to become an admin using the following Cypher query:

```
MATCH (p:User {email: 'john@domain.com'})
SET p.admin = true
RETURN p
```

## Deployment

This is currently deployed to Heroku, since this repository contains both API and UI repository we need to individually push each one, to achieve that we can create a subtree branch with only that specific folder:

Example

For API:

```
git subtree split --prefix api -b heroku-api
```

This will make the `heroku-api` branch hold only the `api` folder.

Then we can deploy our local `heroku-api` to heroku `master`:

```
heroku git:remote -r remote-api -a graphgist-portal-v3
git push -f remote-api heroku-api:master
```
