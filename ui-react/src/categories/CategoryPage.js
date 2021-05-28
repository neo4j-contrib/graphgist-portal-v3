import React from "react";
import { Link } from "react-router-dom";
import { Header, Loader, Grid, Divider, Button, Icon } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import _ from "lodash";
import GraphGistList from "../graphgists/GraphGistList";
import GraphGistCard from "../graphgists/GraphGistCard";
import SimpleFormat from "../components/SimpleFormat.js";

const graphql = gql`
  query Category($slug: String!) {
    category: getCategory(slug: $slug) {
      __typename
      slug
      name
      ... on Challenge {
        summary
        my_perms
      }
      ... on Industry {
        summary
        my_perms
      }
      ... on UseCase {
        summary
        my_perms
      }
    }
  }
`;

const list_graphql = gql`
  query GraphGists($slug: String!) {
    items: graphGistsByCategory(slug: $slug, orderBy: [title_asc]) {
      ...GraphGistCard
    }
  }
  ${GraphGistCard.fragments.graphGist}
`;

function CategoryPage(props) {
  const { categorySlug } = props.match.params;

  const { loading, data } = useQuery(graphql, {
    fetchPolicy: "cache-and-network",
    variables: {
      slug: categorySlug,
    },
  });

  const category = _.get(data, "category", null);
  const isChallenge = _.get(category, "__typename") === "Challenge";

  const canEditMetaData = () =>
    isChallenge && category.my_perms.indexOf("edit") >= 0;

  return loading || !category ? (
    <Loader active inline="centered" />
  ) : (
    <div>
      <Header as="h2">{category && category.name}</Header>
      <Grid>
        <Grid.Column width={canEditMetaData() ? 13 : "100%"}>
          {category.summary && (
            <React.Fragment>
              <Divider horizontal>Summary</Divider>
              <SimpleFormat text={category.summary} />
            </React.Fragment>
          )}
          <GraphGistList
            graphql={list_graphql}
            variables={{ slug: categorySlug }}
          />
        </Grid.Column>
        {canEditMetaData() && (
          <Grid.Column width={3}>
            <Button
              icon
              labelPosition="left"
              as={Link}
              to={`/challenges/${category.slug}/edit`}
            >
              <Icon name="edit" />
              Edit Metadata
            </Button>
          </Grid.Column>
        )}
      </Grid>
    </div>
  );
}

export default CategoryPage;
