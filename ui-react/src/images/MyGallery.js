import React, {useState} from 'react';
import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { Button, Card } from 'semantic-ui-react';
import { Helmet } from 'react-helmet';
import ImageCard from './ImageCard';

const GET_IMAGES = gql`
  query imagesPaginateQuery($first: Int, $offset: Int) {
    myImages(
      first: $first
      offset: $offset
    ) {
      ...ImageCard
    }
  }
  ${ImageCard.fragments.image}
`;

const rowsPerPage = 30;

function MyGallery() {
  const [hasMore, setHasMore] = useState(false);

  const { fetchMore, loading, data, error, refetch } = useQuery(GET_IMAGES, {
    fetchPolicy: 'cache-and-network',
    variables: {
      first: rowsPerPage,
      offset: 0,
    },
    onCompleted: (images) => {
      if (images && images.myImages) {
        setHasMore(images.myImages.length >= rowsPerPage);
      }
    },
  });

  function loadMore() {
    fetchMore({
      variables: {
        offset: data.myImages.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (fetchMoreResult.myImages.length === 0) {
          setHasMore(false);
          return prev;
        }
        setHasMore(fetchMoreResult.myImages.length >= rowsPerPage);
        return Object.assign({}, prev, {
          myImages: [...prev.myImages, ...fetchMoreResult.myImages],
        });
      },
    });
  }

  const onDeleted = () => {
    refetch()
  }

  return (
    <React.Fragment>
      <Helmet title="My Gallery" />
      <h1>My Gallery</h1>
      {error && !loading && <p>Error</p>}
      {data && !error && (
        <Card.Group itemsPerRow={3}>
          {data.myImages.map((image) => (
            <ImageCard key={image.uuid} image={image} onDeleted={onDeleted}/>
          ))}
        </Card.Group>
      )}
      {hasMore && <Button onClick={loadMore} loading={loading}>Load More</Button>}
    </React.Fragment>
  );
}

export default MyGallery;
