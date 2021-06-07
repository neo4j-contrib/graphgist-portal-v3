import React from 'react';
import gql from 'graphql-tag';
import GraphQLSelect from './GraphQLSelect';

const GET_ITEMS = gql`
  query itemsPage {
    items: Industry {
      value: uuid
      text: name
    }
  }
`;

function IndustriesSelect(props) {
  return <GraphQLSelect {...props} query={GET_ITEMS} multiple />;
}

export default IndustriesSelect;
