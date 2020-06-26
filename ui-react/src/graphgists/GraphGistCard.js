import React from "react";
import gql from "graphql-tag";
import { useHistory } from "react-router";
import { Card, Image, Icon, List } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { createUseStyles } from 'react-jss'

const useStyles = createUseStyles({
  categoryIcon: {
    width: '1.7em',
    height: '1.7em'
  },
});

const categoriesUrlPath = {
  "UseCase": "use_cases",
  "Industry": "industries",
  "Challenge": "challenges",
};

function GraphGistCard(props) {
  const classes = useStyles();
  const history = useHistory();
  const { graphGist } = props;
  const graphGistUrl = `/graph_gists/${graphGist.slug}`;

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
          graphGist.image
            ? graphGist.image.source_url
            : "https://graphgist-portal.herokuapp.com/assets/missing-3de5afa143a851909bf3ab0ac4add47749974608b7b790a2bcb0a2203a53eb92.png"
        }
      />

      {graphGist.featured && (
        <Card.Content>
          <Icon name="thumbs up" size="large" style={{paddingRight: 0}} />
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
                    src={category.image.source_url}
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
              )
            })}

            {graphGist.categories.length > 2 && (
              <List.Item>
                <List.Icon name="ellipsis horizontal" />
                <List.Content>
                  More categories
                </List.Content>
              </List.Item>
            )}
          </List>
        </Card.Description>
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
      image {
        source_url
      }
      categories(first: 3) {
        __typename
        uuid
        slug
        name
        image {
          source_url
        }
      }
      author {
        name
        slug
        image {
          source_url
        }
      }
    }
  `
}

export default GraphGistCard;
