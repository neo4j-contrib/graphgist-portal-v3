import React from 'react';
import { useLazyQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useHistory } from 'react-router';
import { Search } from 'semantic-ui-react';
import _ from 'lodash';

const SEARCH_CHALLENGE = gql`
  query challengeSearch($searchString: String!) {
    challengeSearch(first: 7, offset: 0, searchString: $searchString) {
      uuid
      slug
      name
      image(first: 1) {
        source_url
      }
    }
  }
`;

function SearchAutoComplete() {
  const history = useHistory();
  const [searchString, setSearchString] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [fetch, { loading }] = useLazyQuery(SEARCH_CHALLENGE, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data && data.challengeSearch) {
        setResults(
          data.challengeSearch.map((g) => ({
            title: g.name,
            image: _.get(g, 'image[0].source_url', undefined),
            description: `Name: ${g.name}`,
            url: `/challenges/${g.slug}`,
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
    <div>
      <Search
        placeholder="Search..."
        margin="normal"
        loading={loading}
        value={searchString}
        onSearchChange={handleChange}
        results={results}
        onResultSelect={(e, data) => {
          history.push(data.result.url);
        }}
      />
    </div>
  );
}

export default SearchAutoComplete;
