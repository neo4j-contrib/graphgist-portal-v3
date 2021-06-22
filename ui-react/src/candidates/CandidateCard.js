import React from 'react';
import gql from 'graphql-tag';
import { useHistory } from 'react-router';
import { Card, Image, List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import Clampy from '@clampy-js/react-clampy';

import missingImg from '../assets/missing.png';

const useStyles = createUseStyles({
  content: {
    flexGrow: '0 !important',
    height: '70px',
  },
  categoryLabel: {
    marginTop: '2px !important',
    marginBottom: '2px !important',
    marginLeft: '0 !important',
    marginRight: '5px !important',
    paddingLeft: '35px !important',
    position: 'relative',
  },
  categoryIcon: {
    width: '1.7em',
    height: '1.7em',
    marginLeft: '-35px !important',
    marginRight: '0 !important',
    position: 'absolute !important',
  },
  card: {
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '5px',
    display: 'grid',
    gridTemplateRows: '70px 250px 2fr 1fr',
    height: '600px',
  },
  image: {
    height: '250px',
    alignSelf: 'center',
    justifySelf: 'center',
    objectFit: 'cover',
  },
});

const categoriesUrlPath = {
  UseCase: 'use_cases',
  Industry: 'industries',
  Challenge: 'challenges',
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
    <Card className={classes.card} key={graphGist.id} link onClick={onCardClick} as="div">
      <Card.Content className={classes.content}>
        <Card.Header>
          <Link to={graphGistUrl}>
            <Clampy clampSize="2">{graphGist.title}</Clampy>
          </Link>
        </Card.Header>
      </Card.Content>

      <Image
        width="100%"
        className={classes.image}
        src={
          graphGist.image.length > 0
            ? graphGist.image[0].source_url
            : missingImg
        }
      />

      <Card.Content className={classes.content}>
        <Card.Description>
          <List divided relaxed>
            {graphGist.author && (
              <List.Item>
                <List.Icon name="user" size="large" />
                <List.Content>
                  <Link to={'people/' + graphGist.author.slug}>
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
      image(first: 1, filter: {source: "file_upload"}) {
        source_url
        source
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
        image(first: 1) {
          source_url
        }
      }
    }
  `,
};

export default GraphGistCandidateCard;
