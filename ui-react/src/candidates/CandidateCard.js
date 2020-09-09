import React from "react";
import gql from "graphql-tag";
import { useHistory } from "react-router";
import { Card, Image, List } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { createUseStyles } from "react-jss";

import missingImg from "../assets/missing.png";

const useStyles = createUseStyles({
  categoryIcon: {
    width: "1.7em",
    height: "1.7em",
  },
});

const categoriesUrlPath = {
  UseCase: "use_cases",
  Industry: "industries",
  Challenge: "challenges",
};

function GraphGistCandidateCard(props) {
  const classes = useStyles();
  const history = useHistory();
  const { graphGist } = props;
  const graphGistUrl = `/graph_gist_candidates/${graphGist.uuid}`;

  function onCardClick() {
    history.push(graphGistUrl);
  }

  return (
    <Card key={graphGist.id} link onClick={onCardClick} as="div">
      <Card.Content>
        <Card.Header>
          <Link to={graphGistUrl}>{graphGist.title}</Link>
        </Card.Header>
      </Card.Content>

      <Image
        width="100%"
        src={
          graphGist.image.length > 0
            ? graphGist.image[0].source_url
            : missingImg
        }
      />

      <Card.Content>
        <Card.Description>
          <List divided relaxed>
            {graphGist.author && (
              <List.Item>
                <List.Icon name="user" size="large" />
                <List.Content>
                  <Link to={"people/" + graphGist.author.slug}>
                    {graphGist.author.name}
                  </Link>
                </List.Content>
              </List.Item>
            )}

            {graphGist.categories.slice(0, 2).map((category, index) => {
              const categorySlug = categoriesUrlPath[category.__typename];
              return (
                <List.Item key={category.uuid}>
                  <Image
                    src={category.image[0].source_url}
                    alt={category.name}
                    width={16}
                    height={14}
                    className={classes.categoryIcon}
                  />
                  <List.Content>
                    <Link to={`${categorySlug}/${category.slug}`}>
                      {category.name}
                    </Link>
                  </List.Content>
                </List.Item>
              );
            })}

            {graphGist.categories.length > 2 && (
              <List.Item>
                <List.Icon name="ellipsis horizontal" />
                <List.Content>More categories</List.Content>
              </List.Item>
            )}
          </List>
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

GraphGistCandidateCard.fragments = {
  graphGistCandidate: gql`
    fragment CandidateCard on GraphGistCandidate {
      uuid
      slug
      title
      status
      graphgist {
        uuid
        status
      }
      image(first: 1) {
        source_url
      }
      categories(first: 3) {
        __typename
        uuid
        slug
        name
        image(first: 1) {
          source_url
        }
      }
      author {
        name
        slug
        image(first: 1) {
          source_url
        }
      }
    }
  `,
};

export default GraphGistCandidateCard;
