import React from "react";
import gql from "graphql-tag";
import GraphQLSelect from "./GraphQLSelect";

const GET_ITEMS = gql`
  query itemsPage {
    items: Person {
      value: uuid
      text: name
    }
  }
`;

function AuthorsSelect(props) {
  return <GraphQLSelect {...props} query={GET_ITEMS} />
}

export default AuthorsSelect;
