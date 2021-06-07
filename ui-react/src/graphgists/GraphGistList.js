import React from 'react';
import PropTypes from 'prop-types';
import { Card, Loader, Message } from 'semantic-ui-react';
import { useQuery } from '@apollo/client';
import GraphGistCard from './GraphGistCard';

function GraphGistList({ graphql, variables, group }) {
  const { loading, data, error } = useQuery(graphql, {
    fetchPolicy: 'cache-and-network',
    variables,
  });

  const renderItems = () => {
    const items = data.items.map((graphGist) => (
      <GraphGistCard key={graphGist.uuid} graphGist={graphGist} />
    ));

    if (group) {
      return <Card.Group itemsPerRow={3}>{items}</Card.Group>;
    }

    return items;
  };

  return (
    <React.Fragment>
      {loading && !error && <Loader active inline="centered" />}
      {error && !loading && <p>Error</p>}
      {data &&
        !loading &&
        !error &&
        (data.items.length > 0 ? (
          renderItems()
        ) : (
          <Message>
            <Message.Header>Nothing found</Message.Header>
          </Message>
        ))}
    </React.Fragment>
  );
}

GraphGistList.propTypes = {
  showEdit: PropTypes.bool.isRequired,
};

GraphGistList.defaultProps = {
  showEdit: false,
  group: true,
};

export default GraphGistList;
