import React, { useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Button, Card } from 'semantic-ui-react';
import GraphGistCard from './GraphGistCard';

const GET_GISTS_BY_USER = gql`
  query graphGistsByAuthorUserQuery($uuid: ID!, $first: Int, $offset: Int) {
    graphgists: graphGistsByAuthorUser(
      uuid: $uuid
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

const GET_GISTS_BY_PERSON = gql`
  query graphGistsByAuthorPersonQuery($uuid: ID!, $first: Int, $offset: Int) {
    graphgists: graphGistsByAuthorPerson(
      uuid: $uuid
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

const GET_MY_GISTS = gql`
  query graphGistsByAuthorPersonQuery($first: Int, $offset: Int) {
    graphgists: myGraphGists(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
    ) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

const rowsPerPage = 30;

function GraphGistsByPerson({ personUUID, userUUID, myGraphGists }) {
  const [hasMore, setHasMore] = React.useState(false);

  const query = myGraphGists
    ? GET_MY_GISTS
    : userUUID
    ? GET_GISTS_BY_USER
    : GET_GISTS_BY_PERSON;

  const [
    loadMyGraphGists,
    { data: myGraphGistsData, loading, error, fetchMore },
  ] = useLazyQuery(query, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.graphgists) {
        setHasMore(data.graphgists.length >= rowsPerPage);
      }
    },
  });

  const uuid = personUUID || userUUID;

  useEffect(() => {
    if (uuid || myGraphGists) {
      loadMyGraphGists({
        variables: {
          uuid,
          first: rowsPerPage,
          offset: 0,
        },
      });
    }
  }, [uuid, myGraphGists, loadMyGraphGists]);

  function loadMore() {
    fetchMore({
      variables: {
        offset: myGraphGistsData.graphgists.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          setHasMore(false);
          return prev;
        }
        setHasMore(fetchMoreResult.GraphGist.length >= rowsPerPage);
        return Object.assign({}, prev, {
          graphgists: [...prev.graphgists, ...fetchMoreResult.graphgists],
        });
      },
    });
  }

  return (
    <>
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {myGraphGistsData && !loading && !error && (
        <Card.Group stackable itemsPerRow={3}>
          {myGraphGistsData.graphgists.map((graphGist) => (
            <GraphGistCard key={graphGist.uuid} graphGist={graphGist} />
          ))}
        </Card.Group>
      )}
      {hasMore && <Button onClick={loadMore}>Load More</Button>}
    </>
  );
}

export default GraphGistsByPerson;
