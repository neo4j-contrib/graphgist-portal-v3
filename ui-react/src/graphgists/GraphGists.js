import React from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import {
  Button,
  Checkbox,
  Card,
  Grid,
  Divider,
} from "semantic-ui-react";
import { Helmet } from "react-helmet";
import GraphGistCard from "./GraphGistCard";
import SearchAutoComplete from "./SearchAutoComplete";

const GET_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int) {
    GraphGist(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
      filter: { status: live }
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;
const GET_FEATURED_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int) {
    GraphGist(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
      filter: { status: live }
      featured: true
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

const rowsPerPage = 30;

function GraphGists() {
  const [hasMore, setHasMore] = React.useState(false);
  const [useFeatured, setUseFeatured] = React.useState(false);
  const { fetchMore, loading, data, error } = useQuery(
    useFeatured ? GET_FEATURED_GISTS : GET_GISTS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        first: rowsPerPage,
        offset: 0,
      },
      onCompleted: (data) => {
        if (data && data.GraphGist) {
          setHasMore(data.GraphGist.length >= rowsPerPage);
        }
      },
    }
  );

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
        <Grid.Column columns={9}>
          <SearchAutoComplete />
        </Grid.Column>
        <Grid.Column columns={3}>
          <Checkbox
            toggle
            onChange={() => {
              setUseFeatured((prevState) => !prevState);
            }}
            label="Show featured only"
            style={{ float: "right" }}
          />
        </Grid.Column>
      </Grid.Row>
      <Divider />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Grid.Row>
          <Card.Group itemsPerRow={3}>
            {data.GraphGist.map((graphGist) => (
              <GraphGistCard key={graphGist.uuid} graphGist={graphGist} />
            ))}
          </Card.Group>
        </Grid.Row>
      )}
      {hasMore && <Button onClick={loadMore}>Load More</Button>}
    </Grid>
  );
}

export default GraphGists;
