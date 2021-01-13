import React from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Button, Checkbox, Card, Grid, Divider } from "semantic-ui-react";
import { Helmet } from "react-helmet";
import GraphGistCard from "./GraphGistCard";
import SearchAutoComplete from "./SearchAutoComplete";

const GET_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int, $featured: Boolean) {
    GraphGist(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
      filter: { status: live }
      featured: $featured
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

const rowsPerPage = 30;

function GraphGists() {
  const [hasMore, setHasMore] = React.useState(false);
  const [useFeatured, setUseFeatured] = React.useState(true);

  const { fetchMore, loading, data, error } = useQuery(GET_GISTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      first: rowsPerPage,
      offset: 0,
      featured: useFeatured,
    },
    onCompleted: (data) => {
      if (data && data.GraphGist) {
        setHasMore(data.GraphGist.length >= rowsPerPage);
      }
    },
  });

  function loadMore() {
    fetchMore({
      variables: {
        offset: data.GraphGist.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          setHasMore(false);
          return prev;
        }
        setHasMore(fetchMoreResult.GraphGist.length >= rowsPerPage);
        return Object.assign({}, prev, {
          GraphGist: [...prev.GraphGist, ...fetchMoreResult.GraphGist],
        });
      },
    });
  }

  return (
    <Grid columns={2}>
      <Helmet title="Graph Gists" />
      <Grid.Row>
        <Grid.Column columns={12}>
          <SearchAutoComplete />
          <Checkbox
            checked={useFeatured}
            onChange={() => {
              setUseFeatured((prevState) => !prevState);
            }}
            label="Show featured only"
          />
        </Grid.Column>
      </Grid.Row>
      <Divider />
      <Grid.Row>
        {loading && !error && (
          <Grid.Column columns={12}>
            <p>Loading...</p>
          </Grid.Column>
        )}
        {error && !loading && (
          <Grid.Column columns={12}>
            <p>Error</p>
          </Grid.Column>
        )}
        {data && !loading && !error && (
          <Card.Group itemsPerRow={3}>
            {data.GraphGist.map((graphGist) => (
              <GraphGistCard key={graphGist.uuid} graphGist={graphGist} />
            ))}
          </Card.Group>
        )}
      </Grid.Row>
      {hasMore && !loading && (
        <Grid.Row>
          <Grid.Column columns={12}>
            <Button onClick={loadMore}>Load More</Button>
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );
}

export default GraphGists;
