import React, {useState} from 'react';
import gql from 'graphql-tag';
import { Card, Image, Button } from 'semantic-ui-react';
import { createUseStyles } from 'react-jss';
import { useMutation } from '@apollo/client';

const useStyles = createUseStyles({
  content: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    height: '70px',
  },
  card: {
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '5px',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
  },
  image: {
    height: '250px',
    alignSelf: 'center',
    justifySelf: 'center',
    objectFit: 'cover',
  },
});

const DELETE_IMAGE = gql`
  mutation deleteImage($uuid: ID!) {
    DeleteImage(uuid: $uuid)
  }
`;

function ImageCard(props) {
  const classes = useStyles();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const { image, onDeleted } = props;

  const [
    deleteImageMutation,
    { loading: isDeleting },
  ] = useMutation(DELETE_IMAGE, {
    onCompleted: () => {
      onDeleted()
      console.log('Image Deleted')
    },
  });

  const handleConfirmDelete = (uuid) => {
    try {
      setIsLoading(true);
      deleteImageMutation({ variables: { uuid } });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(true);
    }
  }

  return (
    <Card
      key={image.uuid}
      as="div"
      fluid
      link
      className={classes.card}
    >
      {<Image
        className={classes.image}
        width="100%"
        src={image.source_url}
      />}

      <Card.Content className={classes.content}>
        {!confirmDelete && 
          <Button
            as="a"
            color="red"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
          >
            Delete
          </Button>}
        {confirmDelete && 
          <>
            <Button
              as="a"
              color="green"
              loading={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmDelete(image.uuid)
              }}
            >
              Confirm
            </Button>
            <Button
              as="a"
              color="blue"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDelete(false);
              }}
            >
              Cancel
            </Button>
          </>}
      </Card.Content>
    </Card>
  );
}

ImageCard.fragments = {
  image: gql`
    fragment ImageCard on Image {
      uuid
      source_url
    }
  `,
};

export default ImageCard;
