import React from 'react';
import gql from 'graphql-tag';
import { useHistory } from 'react-router';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
// import { createUseStyles } from "react-jss";

import missingImg from '../assets/missing.png';

// const useStyles = createUseStyles({
// });

function ChallengeCard(props) {
  // const classes = useStyles();
  const history = useHistory();
  const { challenge } = props;
  const challengeUrl = `/challenges/${challenge.slug}`;

  function onCardClick() {
    history.push(challengeUrl);
  }

  return (
    <Card key={challenge.id} link onClick={onCardClick} as="div">
      <Card.Content>
        <Card.Header>
          <Link to={challengeUrl}>{challenge.name}</Link>
        </Card.Header>
      </Card.Content>

      <Image
        width="100%"
        src={
          challenge.image.length > 0
            ? challenge.image[0].source_url
            : missingImg
        }
      />
    </Card>
  );
}

ChallengeCard.fragments = {
  challenge: gql`
    fragment ChallengeCard on Challenge {
      uuid
      slug
      name
      image(first: 1) {
        source_url
      }
    }
  `,
};

export default ChallengeCard;
