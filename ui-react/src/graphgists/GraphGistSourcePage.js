import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { Grid, Header } from "semantic-ui-react";
import gql from "graphql-tag";
import _ from "lodash";
import PageLoading from "../components/PageLoading.js";
import CodeMirrorTextArea from "./render/TextArea";
import "./GraphGistSourcePage.css";

const GET_GRAPHGIST = gql`
  query graphGistSourcePage($id: String) {
    GraphGist(slug: $id) {
      uuid
      title
      asciidoc
    }
  }
`;

function GraphGistSourcePage() {
  const { id } = useParams();

  const { loading, data, error } = useQuery(GET_GRAPHGIST, {
    fetchPolicy: "cache-and-network",
    variables: { id },
  });

  const graphGist = _.get(data, "GraphGist[0]", null);

  return (
    <PageLoading obj={graphGist} loading={loading} error={error}>
      {graphGist && (
        <React.Fragment>
          <Grid.Column width={13}>
            <Header as="h1" textAlign="center" size="huge">
              {graphGist.title}
            </Header>
            <CodeMirrorTextArea value={graphGist.asciidoc} />
          </Grid.Column>
        </React.Fragment>
      )}
    </PageLoading>
  );
}

export default GraphGistSourcePage;
