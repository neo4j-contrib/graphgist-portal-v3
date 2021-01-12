import React from "react";
import gql from "graphql-tag";
import { useHistory } from "react-router";
import { Card, Image, Icon, List, Button } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { createUseStyles } from "react-jss";

import missingImg from "../assets/missing.png";

const useStyles = createUseStyles({
  categoryIcon: {
    width: "1.7em",
    height: "1.7em",
  },
  cardFooter: {
    flexGrow: "0 !important",
  },
});

const categoriesUrlPath = {
  UseCase: "use_cases",
  Industry: "industries",
  Challenge: "challenges",
};

function GraphGistCard(props) {
  const classes = useStyles();
  const history = useHistory();
  const { graphGist } = props;
  const graphGistUrl = `/graph_gists/${graphGist.slug || graphGist.uuid}`;
  const playUrl = encodeURI(
    `https://guides.neo4j.com/graph-examples/${graphGist.slug}/graph_guide`
  );

  function onCardClick() {
    history.push(graphGistUrl);
  }

  return (
    <Card key={graphGist.uuid} onClick={onCardClick} as="div" fluid link>
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

      {graphGist.featured && (
        <Card.Content>
          <Icon name="thumbs up" size="large" style={{ paddingRight: 0 }} />
          Featured by Neo Team
        </Card.Content>
      )}

      <Card.Content>
        <Card.Description>
          <List divided relaxed>
            {graphGist.author && (
              <List.Item>
                <List.Icon name="user" size="large" />
                <List.Content>
                  <Link to={"/people/" + graphGist.author.slug}>
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
                    <Link to={`/${categorySlug}/${category.slug}`}>
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
      <Card.Content className={classes.cardFooter}>
        <Button
          as="a"
          color="primary"
          href={`neo4j://graphapps/neo4j-browser?cmd=play&arg=${playUrl}`}
        >
          Play as Browser Guide
        </Button>
      </Card.Content>
    </Card>
  );
}

GraphGistCard.fragments = {
  graphGist: gql`
    fragment GraphGistCard on GraphGist {
      uuid
      slug
      title
      featured
      avg_rating
      is_candidate_updated
      status
      image(first: 1) {
        source_url
      }
      candidate {
        uuid
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

export default GraphGistCard;
