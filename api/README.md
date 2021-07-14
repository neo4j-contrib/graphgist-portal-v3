# Graphgist Portal API - v3

![GraphQL API diagram](../diagram.png)

## Quick Start

Install dependencies:

```
npm install
```

Start the GraphQL service:

```
npm start
```

This will start the GraphQL service (by default on localhost:4000) where you can issue GraphQL requests or access GraphQL Playground in the browser:

![GraphQL Playground](img/graphql-playground.png)

## Local database

In order to be able to create and connect to a local Neo4j database instance, you should [download Neo4j Desktop](https://neo4j.com/download/)

Then, you can execute the downloaded file and run it:
```bash
chmod +x neo4j-desktop.AppImage
./neo4j-desktop.AppImage
```

Now you can [create a new database in Neo4j Desktop](https://neo4j.com/developer/neo4j-desktop/#desktop-create-DBMS) and then, you have to [install and activate the APOC plugin in your database](https://neo4j.com/labs/apoc/4.2/installation/)   
And, you just have to use its URI, user and password in [your .env file](#configure)

## Configure

Set your Neo4j connection string and credentials in `.env`. For example:

_.env_

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=letmein
```

Note that grand-stack-starter does not currently bundle a distribution of Neo4j. You can download [Neo4j Desktop](https://neo4j.com/download/) and run locally for development, spin up a [hosted Neo4j Sandbox instance](https://neo4j.com/download/), run Neo4j in one of the [many cloud options](https://neo4j.com/developer/guide-cloud-deployment/), or [spin up Neo4j in a Docker container](https://neo4j.com/developer/docker/). Just be sure to update the Neo4j connection string and credentials accordingly in `.env`.

## Deployment

This is currently deployed to Heroku, since this repository contains both API and UI repository we need to individually push each one, to achieve that we can create a subtree branch with only that specific folder:

For API:

```
git subtree split --prefix api -b heroku-api
```

This will make the `heroku-api` branch hold only the `api` folder.

Then we can deploy our local `heroku-api` to heroku `master`:

```
heroku git:remote -r remote-api -a graphgist-porta-v3
git push -f remote-api heroku-api:master
```
