import React from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Button, Card, Grid, Icon, Divider } from 'semantic-ui-react';
import { Helmet } from 'react-helmet';
import ChallengeCard from './ChallengeCard';
import SearchAutoComplete from './SearchAutoComplete';
import { createUseStyles } from 'react-jss';
import _ from 'lodash';

import { useHistory } from 'react-router';
const GET_CHALLENGES = gql`
  query getChallengesPaginateQuery($first: Int, $offset: Int) {
    Challenge(first: $first, offset: $offset, orderBy: [name_asc]) {
      ...ChallengeCard
    }
    me {
      uuid
      name
    }
  }
  ${ChallengeCard.fragments.challenge}
`;

const rowsPerPage = 30;
const useStyles = createUseStyles({
  button: {
    color: 'rgba(0,0,0,0.6)',
  },
});
function ChallengesList() {
  const [hasMore, setHasMore] = React.useState(false);
  const classes = useStyles();
  const history = useHistory();

  const { fetchMore, loading, data, error } = useQuery(GET_CHALLENGES, {
    fetchPolicy: 'cache-and-network',
    variables: {
      first: rowsPerPage,
      offset: 0,
    },

    onCompleted: (data) => {
      if (data && data.Challenge) {
        setHasMore(data.Challenge.length >= rowsPerPage);
      }
    },
  });

  const me = _.get(data, 'me', null);

  function loadMore() {
    fetchMore({
      variables: {
        offset: data.Challenge.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          setHasMore(false);
          return prev;
        }
        setHasMore(fetchMoreResult.Challenge.length >= rowsPerPage);
        return Object.assign({}, prev, {
          Challenge: [...prev.Challenge, ...fetchMoreResult.Challenge],
        });
      },
    });
  }
  function addNew() {
    history.push('/challenges/new');
  }

  return (
    <Grid columns={2}>
      <Helmet title="Challenges" />
      <Grid.Row>
        <Grid.Column width={12}>
          <SearchAutoComplete />
        </Grid.Column>
      </Grid.Row>
      <Divider />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Grid.Row>
          <Grid.Column width={13}>
            <Card.Group itemsPerRow={3}>
              {data.Challenge.map((challenge) => (
                <ChallengeCard key={challenge.uuid} challenge={challenge} />
              ))}
            </Card.Group>
          </Grid.Column>
          {me && (
            <Grid.Column width={3}>
              <Button
                className={classes.button}
                onClick={addNew}
                icon
                labelPosition="left"
              >
                <Icon name="pencil" />
                New
              </Button>
            </Grid.Column>
          )}
        </Grid.Row>
      )}
      {hasMore && <Button onClick={loadMore}>Load More</Button>}
    </Grid>
  );
}

export default ChallengesList;
