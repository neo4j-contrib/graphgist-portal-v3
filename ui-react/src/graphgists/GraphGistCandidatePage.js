import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import _ from "lodash";
import GraphGistUI from "./GraphGistUI.js";

const GET_GRAPHGIST = gql`
  query graphGistCandidatePage($id: ID!) {
    GraphGistCandidate(uuid: $id) {
      uuid
      render_id
      status
      slug
      title
      summary
      raw_html
      cached
      my_perms
      author {
        uuid
        name
        slug
      }
      created_at {
        formatted
      }
      image {
        source_url
      }
      categories {
        __typename
        uuid
        slug
        name
        image {
          source_url
        }
      }
      author {
        uuid
        name
        slug
        image {
          source_url
        }
      }
      graphgist {
        uuid
        slug
      }
    }
  }
`;

function GraphGistCandidatePage() {
  const { id } = useParams();

  const { loading, data, error } = useQuery(GET_GRAPHGIST, {
    fetchPolicy: "cache-and-network",
    variables: { id: id }
  });

  const graphGist = _.get(data, "GraphGistCandidate[0]", null);

  return <GraphGistUI graphGist={graphGist} loading={loading} error={error} candidate />
}

export default GraphGistCandidatePage;
