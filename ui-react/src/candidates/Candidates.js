import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Button, Card, Grid } from "semantic-ui-react";
import { Helmet } from "react-helmet";
import CandidateCard from "./CandidateCard";

const GET_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int) {
    GraphGistCandidate(
      first: $first
      offset: $offset
      filter: { status: candidate }
    ) {
      ...CandidateCard
    }
  }
  ${CandidateCard.fragments.graphGistCandidate}
`;

const rowsPerPage = 30;

function GraphGistCandidates() {
  const [hasMore, setHasMore] = React.useState(false);

  const { fetchMore, loading, data, error } = useQuery(GET_GISTS, {
    fetchPolicy: "cache-and-network",
    variables: {
      first: rowsPerPage,
      offset: 0,
    },
    onCompleted: (data) => {
      if (data && data.GraphGistCandidate) {
        setHasMore(data.GraphGistCandidate.length >= rowsPerPage);
      }
    },
  });

  function loadMore() {
    fetchMore({
      variables: {
        offset: data.GraphGistCandidate.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          setHasMore(false);
          return prev;
        }
        setHasMore(fetchMoreResult.GraphGistCandidate.length >= rowsPerPage);
        return Object.assign({}, prev, {
          GraphGistCandidate: [
            ...prev.GraphGistCandidate,
            ...fetchMoreResult.GraphGistCandidate,
          ],
        });
      },
    });
  }

  return (
    <Grid columns={1}>
      <Helmet title="Graph Gists" />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Grid.Row>
          <Card.Group itemsPerRow={3}>
            {data.GraphGistCandidate.map((graphGist) => (
              <CandidateCard key={graphGist.uuid} graphGist={graphGist} />
            ))}
          </Card.Group>
        </Grid.Row>
      )}
      {hasMore && <Button onClick={loadMore}>Load More</Button>}
    </Grid>
  );
}

export default GraphGistCandidates;
