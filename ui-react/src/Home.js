import React from 'react';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import { Grid, Header } from 'semantic-ui-react';
import gql from 'graphql-tag';
import Pre from './components/Pre';
import GraphGistList from './graphgists/GraphGistList';
import GraphGistCard from './graphgists/GraphGistCard';

const useStyles = createUseStyles({
  // root: {
  //   fontSize: "1.4rem",
  // },
});

const list_graphql = gql`
  query GraphGists($uuid: ID!) {
    items: GraphGist(uuid: $uuid) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

function Home() {
  const classes = useStyles();

  const isLoginEnabled =
    typeof window !== 'undefined' && !window.neo4jDesktopApi;

  return (
    <div className={classes.root}>
      <h1>About the GraphGist Portal</h1>

      {isLoginEnabled && (
        <p>
          Already know what a graphgist is?{' '}
          <Link to="/submit_graphgist">Start yours now</Link>.
        </p>
      )}

      <h2>What is a GraphGist</h2>

      <p>
        Building a graph of your data is fairly simple as the graph structure
        represents the real world much better than columns and rows of data.
        GraphGists are teaching tools which allow developers to explore how data
        in a particular domain would be modeled as a graph and see some example
        queries of that graph data.
      </p>

      <h2>Why create a GraphGist?</h2>

      <p>
        <a href="http://www.neo4j.com/graphgists/">Neo4j GraphGists</a> are an
        easy way to create and share example graph models & data for particular
        use cases or industries. You can explain these models with text and
        graphics, and provide example queries for how to interact with data
        using Cypher. They’re very helpful educating the Neo4j community and
        even developers within your own organization.
      </p>

      <p>
        These documents are written in a simple, textual markup language (
        <a href="http://asciidoctor.org/">AsciiDoc</a>) and rendered in your
        browser as rich and interactive web pages that you can quickly evolve
        from describing simple how-tos or questions to providing an extensive
        use-case specification.
      </p>

      <p>
        To see the expressive power of this approach, here are some winners of
        our past community competitions:
      </p>

      <h2>Example GraphGists</h2>

      <Grid columns={3}>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5">Pop Culture</Header>
            <GraphGistList
              graphql={list_graphql}
              variables={{ uuid: '855363c7-cdeb-4c8b-b4a5-b72c8f2388e3' }}
              group={false}
            />
          </Grid.Column>
          <Grid.Column>
            <Header as="h5">Open/Government Data and Politics</Header>
            <GraphGistList
              graphql={list_graphql}
              variables={{ uuid: 'c4eab62c-7f5e-4e17-8f75-811d65d83127' }}
              group={false}
            />
          </Grid.Column>
          <Grid.Column>
            <Header as="h5">Investigative Journalism</Header>
            <GraphGistList
              graphql={list_graphql}
              variables={{ uuid: 'd9ec56c6-0a76-49ab-8f43-0504d92225f7' }}
              group={false}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Header as="h5">Sports and Recreation</Header>
            <GraphGistList
              graphql={list_graphql}
              variables={{ uuid: '14bdffc9-8ba4-464e-86f8-577f484428e6' }}
              group={false}
            />
          </Grid.Column>
          <Grid.Column>
            <Header as="h5">Public Web APIs</Header>
            <GraphGistList
              graphql={list_graphql}
              variables={{ uuid: '09bb2bbc-fb73-47a8-9778-3e5f22dcd27c' }}
              group={false}
            />
          </Grid.Column>
          <Grid.Column></Grid.Column>
        </Grid.Row>
      </Grid>

      <h2>How do I create a GraphGist?</h2>

      <p>
        GraphGists work like any AsciiDoc document, but they allow you to insert
        special comments to define how data from Neo4j can be displayed and
        interacted with.
      </p>

      <p>
        First define a block of{' '}
        <a href="http://neo4j.com/developer/cypher-query-language/">Cypher</a>{' '}
        code to setup the database, this block can also use LOAD CSV. Please use
        a educational graph size (around 150 nodes and rels):
      </p>

      <Pre>
        {`//setup
//hide
[source,cypher]
----
CREATE (neo:Database {name:'Neo4j'})
CREATE (neo)-[:SUPPORTS]->(:Language {name:'Cypher'})
----`}
      </Pre>

      <p>
        You can then describe the use cases, run their queries on the data and
        output results as a table and/or a graph:
      </p>

      <div>
        <Pre style={{ float: 'left' }}>
          {`[source,cypher]
----
MATCH (db:Database)-[:SUPPORTS]->(language:Language)
RETURN db.name as db, collect(language.name) as languages
----

//table`}
        </Pre>

        <Pre>
          {`[source,cypher]
----
MATCH (d:Database)-[rel:SUPPORTS]->(l:Language)
RETURN d,l
----

//graph_result`}
        </Pre>
      </div>
    </div>
  );
}

export default Home;
