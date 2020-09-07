import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Helmet } from "react-helmet";
import _ from "lodash";
import GraphGistsByPerson from "./GraphGistsByPerson";

const GET_ME = gql`
  query meQuery {
    me {
      uuid
    }
  }
`;

function MyGraphGists() {
  const { data: dataMe } = useQuery(GET_ME);
  const meUuid = _.get(dataMe, "me.uuid");

  return (
    <React.Fragment>
      <Helmet title="My GraphGists" />
      <h1>My GraphGists</h1>
      <GraphGistsByPerson userUUID={meUuid} />
    </React.Fragment>
  );
}

export default MyGraphGists;
