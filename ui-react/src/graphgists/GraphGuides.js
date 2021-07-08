import React from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Button, Card } from 'semantic-ui-react';
import { Helmet } from 'react-helmet';
import GraphGistCard from './GraphGistCard';

const GET_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int) {
    GraphGist(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
      is_guide: true
      status: live
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
    fetchPolicy: 'cache-and-network',
    variables: {
      first: rowsPerPage,
      offset: 0,
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
    <React.Fragment>
      <Helmet title="Graph Guides" />
      <h1>Graph Guides</h1>
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Card.Group stackable itemsPerRow={3}>
          {data.GraphGist.map((graphGist) => (
            <GraphGistCard key={graphGist.uuid} graphGist={graphGist} />
          ))}
        </Card.Group>
      )}
      {hasMore && <Button onClick={loadMore}>Load More</Button>}
    </React.Fragment>
  );
}

export default GraphGuides;
