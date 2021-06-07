import React from 'react';
import gql from 'graphql-tag';
import GraphQLSelect from './GraphQLSelect';

const GET_ITEMS = gql`
  query itemsPage {
    items: UseCase {
      value: uuid
      text: name
    }
  }
`;

function UseCasesSelect(props) {
  return <GraphQLSelect {...props} query={GET_ITEMS} multiple />;
}

export default UseCasesSelect;
