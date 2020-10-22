import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import gql from "graphql-tag";
import _ from "lodash";
import GraphGistUI from "./GraphGistUI.js";

const GET_GRAPHGIST = gql`
  query graphGistPage($id: ID, $slug: String) {
    GraphGist(filter: { OR: [{ uuid: $id }, { slug: $slug }] }) {
      uuid
      render_id
      status
      slug
      title
      summary
      featured
      avg_rating
      raw_html
      cached
      my_perms
      is_candidate_updated
      is_guide
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
      candidate {
        uuid
      }
    }
  }
`;

function GraphGistPage() {
  const { id } = useParams();

  const { loading, data, error, refetch } = useQuery(GET_GRAPHGIST, {
    fetchPolicy: "cache-and-network",
    variables: { id: id, slug: id },
  });

  const graphGist = _.get(data, "GraphGist[0]", null);

  return (
    <GraphGistUI
      graphGist={graphGist}
      loading={loading}
      error={error}
      refetch={refetch}
    />
  );
}

export default GraphGistPage;
