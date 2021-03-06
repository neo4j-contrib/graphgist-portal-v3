import React from 'react';
import { useLazyQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useHistory } from 'react-router';
import { Search } from 'semantic-ui-react';
import { createUseStyles } from 'react-jss';
import _ from 'lodash';

const SEARCH_GISTS = gql`
  query gistsSearch($searchString: String!) {
    graphGistSearch(first: 7, offset: 0, searchString: $searchString) {
      uuid
      slug
      title
      image(first: 1) {
        source_url
      }
    }
  }
`;

const useStyles = createUseStyles({
  container: {
    display: 'inline-block',
    marginRight: 20,
  },
});

function GraphGists() {
  const classes = useStyles();
  const history = useHistory();
  const [searchString, setSearchString] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [fetch, { loading }] = useLazyQuery(SEARCH_GISTS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.graphGistSearch) {
        setResults(
          data.graphGistSearch.map((g) => ({
            title: g.title,
            image: _.get(g, 'image[0].source_url', undefined),
            description: `Title: ${g.title}`,
            url: `/graph_gists/${g.slug}`,
          }))
        );
      } else {
        setResults([]);
      }
    },
  });

  function handleChange(e) {
    const { value } = e.target;
    setSearchString(value);
    fetch({
      variables: {
        searchString,
      },
    });
  }

  return (
    <Search
      placeholder="Search..."
      margin="normal"
      loading={loading}
      value={searchString}
      onSearchChange={handleChange}
      results={results}
      className={classes.container}
      onResultSelect={(e, data) => {
        history.push(data.result.url);
      }}
    />
  );
}

export default GraphGists;
