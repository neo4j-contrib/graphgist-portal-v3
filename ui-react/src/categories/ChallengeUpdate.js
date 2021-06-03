import React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import { Form, Button, Image, Card, Grid } from 'semantic-ui-react';
import { DateTimeInput } from 'semantic-ui-calendar-react';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { Formik, FieldArray } from 'formik';
import { createUseStyles } from 'react-jss';
import Clampy from '@clampy-js/react-clampy';
import _ from 'lodash';

const UPDATE_CHALLENGE = gql`
  mutation UpdateChallenge($uuid: ID!, $challenge: ChallengeInput!) {
    UpdateChallenge(uuid: $uuid, challenge: $challenge) {
      uuid
      slug
    }
  }
`;

const useStyles = createUseStyles({
  form: {
    marginBottom: 30,
  },
  imageField: {
    paddingTop: 16,
  },
  imagesContainer: {
    marginBottom: 20,
  },
});

const graphql = gql`
  query Category($id: String!) {
    category: getCategory(slug: $id) {
      uuid
      slug
      name
      summary
      ... on Challenge {
        start_date {
          formatted
        }
        end_date {
          formatted
        }
        images: image {
          uuid
          title
          description
          source_url
        }
      }
    }
  }
`;

function ChallengeUpdate(props) {
  const { id } = props.match.params;

  const { loading, data, error } = useQuery(graphql, {
    fetchPolicy: 'cache-and-network',
    variables: { id },
  });
  const classes = useStyles();
  const history = useHistory();

  const showApiError = (data) => {
    history.push(`/challenges/${id}/edit`, {
      messages: data.graphQLErrors.map((error) => ({
        body: error.message,
        type: 'negative',
      })),
    });
  };

  const [updateChallenge, { loading: isSaving }] = useMutation(
    UPDATE_CHALLENGE,
    {
      onCompleted: (data) => {
        history.push(`/challenges/${data.UpdateChallenge.slug}`);
      },
      onError: (data) => {
        showApiError(data);
      },
    }
  );

  const challenge = _.get(data, 'category');

  if ((loading && !error) || !challenge) {
    return (
      <Grid>
        <Grid.Column width={16}>
          <p>Loading...</p>
        </Grid.Column>
      </Grid>
    );
  }

  return (
    <React.Fragment>
      <Helmet title="Submit a Challenge" />

      <Formik
        initialValues={{
          images: challenge.images || [],
          name: challenge.name,
          summary: challenge.summary,
          start_date: challenge.start_date.formatted || '',
          end_date: challenge.end_date.formatted || '',
        }}
        onSubmit={(values, e, a) => {
          let start_date = {};
          let end_date = {};
          if (values.start_date) {
            start_date.formatted = moment(
              values.start_date,
              'YYYY-MM-DD HH:mm'
            ).toISOString();
          }
          if (values.end_date) {
            end_date.formatted = moment(
              values.end_date,
              'YYYY-MM-DD HH:mm'
            ).toISOString();
          }

          updateChallenge({
            variables: {
              uuid: challenge.uuid,
              challenge: {
                ...values,
                start_date: start_date,
                end_date: end_date,
                images: values.images.map((image) => image.file),
              },
            },
          });
        }}
      >
        {({ values, handleChange, handleSubmit }) => {
          const handleChangeSelect = (e, { value, name }) => {
            handleChange({ target: { name, value } });
          };

          return (
            <Form className={classes.form} onSubmit={handleSubmit}>
              <div className={classes.imagesContainer}>
                <FieldArray
                  name="images"
                  render={(arrayHelpers) => {
                    const addImage = (e) => {
                      for (var i = 0; i < e.target.files.length; i++) {
                        const file = e.target.files[i];
                        const fileReader = new FileReader();
                        fileReader.onload = (ee) => {
                          arrayHelpers.remove(0); // this line makes it only accept 1 image
                          arrayHelpers.push({
                            file: file,
                            source_url: fileReader.result,
                          });
                        };
                        fileReader.readAsDataURL(file);
                      }
                      e.target.value = null;
                    };

                    return (
                      <Card.Group>
                        {values.images.map((image, i) => {
                          return (
                            <Card key={i}>
                              <Image
                                src={image.source_url}
                                wrapped
                                fluid
                                ui={false}
                              />
                              {(image.title || image.description) && (
                                <Card.Content>
                                  {image.title && (
                                    <Card.Header>
                                      <Clampy clampSize="2">
                                        {image.title}
                                      </Clampy>
                                    </Card.Header>
                                  )}
                                  {image.description && (
                                    <Card.Meta>{image.description}</Card.Meta>
                                  )}
                                </Card.Content>
                              )}
                              <Card.Content>
                                <Button
                                  color="green"
                                  size="large"
                                  href={image.source_url}
                                >
                                  Full Size
                                </Button>
                                <Button
                                  color="red"
                                  size="small"
                                  onClick={() => arrayHelpers.remove(i)}
                                >
                                  Remove
                                </Button>
                              </Card.Content>
                            </Card>
                          );
                        })}

                        <Form.Field className={classes.imageField}>
                          <label>Add Image</label>
                          <input name="image" type="file" onChange={addImage} />
                        </Form.Field>
                      </Card.Group>
                    );
                  }}
                />
              </div>
              <Form.Field required>
                <label>Name (Required)</label>
                <input
                  required
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Summary</label>
                <Form.TextArea
                  name="summary"
                  value={values.summary}
                  onChange={handleChange}
                />
              </Form.Field>
              <Form.Field>
                <label>Start Date</label>
                <DateTimeInput
                  name="start_date"
                  placeholder="Format: YYYY-MM-DD HH:MM, always in UTC"
                  dateTimeFormat={'YYYY-MM-DD HH:mm'}
                  value={values.start_date}
                  onChange={handleChangeSelect}
                />
              </Form.Field>
              <Form.Field>
                <label>End Date</label>
                <DateTimeInput
                  name="end_date"
                  placeholder="Format: YYYY-MM-DD HH:MM, always in UTC"
                  dateTimeFormat={'YYYY-MM-DD HH:mm'}
                  value={values.end_date}
                  onChange={handleChangeSelect}
                />
              </Form.Field>
              <Button type="submit" primary loading={isSaving}>
                Save
              </Button>
            </Form>
          );
        }}
      </Formik>
    </React.Fragment>
  );
}

export default ChallengeUpdate;
