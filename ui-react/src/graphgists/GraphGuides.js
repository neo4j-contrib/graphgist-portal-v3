import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Button, Card } from "semantic-ui-react";
import GraphGistCard from "./GraphGistCard";

const GET_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int) {
    GraphGist(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
      is_guide: true
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

const rowsPerPage = 30;

function GraphGuides() {
  const [hasMore, setHasMore] = React.useState(false);

  const { fetchMore, loading, data, error } = useQuery(GET_GISTS, {
    variables: {
      first: rowsPerPage,
      offset: 0,
    },
    onCompleted: (data) => {
      if (data && data.GraphGist) {
        setHasMore(data.GraphGist.length >= rowsPerPage);
      }
    }
  });

  function loadMore() {
    fetchMore({
      variables: {
        offset: data.GraphGist.length
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          setHasMore(false);
          return prev;
        }
        setHasMore(fetchMoreResult.GraphGist.length >= rowsPerPage);
        return Object.assign({}, prev, {
          GraphGist: [...prev.GraphGist, ...fetchMoreResult.GraphGist]
        });
      }
    });
  }

  return (
    <React.Fragment>
      <h1>Graph Guides</h1>
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Card.Group itemsPerRow={3}>
          {data.GraphGist.map(graphGist => (
            <GraphGistCard key={graphGist.uuid} graphGist={graphGist} />
          ))}
        </Card.Group>
      )}
      {hasMore && <Button onClick={loadMore}>Load More</Button>}
    </React.Fragment>
  );
}

export default GraphGuides;
