import React from 'react';
import { useMutation } from '@apollo/client';
import { Link, useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import {
  Form,
  Button,
  // Image,
  // Card,
  Loader,
  Dimmer,
  Segment,
} from 'semantic-ui-react';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import { Formik } from 'formik';
// import { FieldArray } from "formik";
import { createUseStyles } from 'react-jss';
import CodeMirrorTextArea from './render/TextArea';
import IndustriesSelect from './components/IndustriesSelect';
import UseCasesSelect from './components/UseCasesSelect';
import ChallengesSelect from './components/ChallengesSelect';
import GraphGistRenderer from './render/GraphGistRenderer.js';

const PREVIEW = gql`
  mutation Preview($asciidoc: String!) {
    PreviewGraphGist(asciidoc: $asciidoc)
  }
`;

const CREATE_GRAPHGIST = gql`
  mutation CreateGraphGist($graphgist: GraphGistInput!) {
    CreateGraphGist(graphgist: $graphgist) {
      uuid
    }
  }
`;

const useStyles = createUseStyles({
  previewContainer: {
    margin: '0 0 60px 0',
    padding: '0 40px',
    minHeight: 100,
    maxHeight: '80vh',
    width: '100%',
    border: '1px solid #999',
    overflow: 'auto',
  },
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

function GraphGistCreate() {
  const classes = useStyles();
  const history = useHistory();

  const showApiError = (data) => {
    history.push('/submit_graphgist', {
      messages: data.graphQLErrors.map((error) => ({
        body: error.message,
        type: 'negative',
      })),
    });
  };

  const [
    previewGraphGist,
    { data: graphGistPreviewResult, loading: isLoadingPreview },
  ] = useMutation(PREVIEW, {
    onError: (data) => {
      showApiError(data);
    },
  });

  const [createGraphGist, { loading: isSaving }] = useMutation(
    CREATE_GRAPHGIST,
    {
      onCompleted: (data) => {
        history.push(`/graph_gist_candidates/${data.CreateGraphGist.uuid}`);
      },
      onError: (data) => {
        showApiError(data);
      },
    }
  );

  const handlePreview = (e, asciidoc) => {
    e.preventDefault();
    previewGraphGist({ variables: { asciidoc } });
  };

  const graphGistPreviewHTML = _.get(
    graphGistPreviewResult,
    'PreviewGraphGist',
    ''
  );

  return (
    <React.Fragment>
      <Helmet title="Submit a GraphGist" />

      <p>
        Enter the URL or AsciiDoc of your GraphGist and click "Preview". If it
        looks good you can click on the "Submit GraphGist" button to submit it
        for publication on this site!
      </p>
      <p>
        If you don't know what a GraphGist is or need help creating one you can
        consult <Link to={`/`}>this guide</Link>
      </p>
      <p>
        If you still need help you can find us on{' '}
        <a href="http://neo4j.com/blog/public-neo4j-users-slack-group/">
          Slack
        </a>
      </p>

      <Formik
        initialValues={{
          title: '',
          asciidoc: '',
          author: '',
          summary: '',
          status: 'draft',
          industries: [],
          challenges: [],
          use_cases: [],
          images: [],
        }}
        onSubmit={(values, e, a) => {
          createGraphGist({
            variables: {
              graphgist: {
                ...values,
                images: values.images.map((image) => image.file),
              },
            },
          });
        }}
      >
        {({ values, handleChange, handleSubmit }) => {
          return (
            <Form className={classes.form} onSubmit={handleSubmit}>
              {/*<div className={classes.imagesContainer}>
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
                                    <Card.Header>{image.title}</Card.Header>
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
                          <input name="image" type="file" onChange={addImage} accept="image/*"/>
                        </Form.Field>
                      </Card.Group>
                    );
                  }}
                />
              </div>*/}

              <Form.Field required>
                <label>Title (Required)</label>
                <input
                  required
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                />
              </Form.Field>

              <CodeMirrorTextArea
                label="AsciiDoc (Required)"
                name="asciidoc"
                value={values.asciidoc}
                onChange={handleChange}
                required
              />

              <Form.Field>
                <label>Summary</label>
                <Form.TextArea
                  name="summary"
                  value={values.summary}
                  onChange={handleChange}
                />
              </Form.Field>

              <Form.Field>
                <label>Industries</label>
                <IndustriesSelect
                  name="industries"
                  value={values.industries}
                  onChange={handleChange}
                  fluid
                />
              </Form.Field>

              <Form.Field>
                <label>Use cases</label>
                <UseCasesSelect
                  name="use_cases"
                  value={values.use_cases}
                  onChange={handleChange}
                  fluid
                />
              </Form.Field>

              <Form.Field>
                <label>Challenges</label>
                <ChallengesSelect
                  name="challenges"
                  value={values.challenges}
                  onChange={handleChange}
                  fluid
                />
              </Form.Field>

              <Button
                onClick={(e) => handlePreview(e, values.asciidoc)}
                loading={isLoadingPreview}
              >
                Preview
              </Button>
              <Button type="submit" primary loading={isSaving}>
                Save and Continue
              </Button>
            </Form>
          );
        }}
      </Formik>

      {isLoadingPreview && (
        <Segment className={classes.previewContainer}>
          <Dimmer active>
            <Loader />
          </Dimmer>
        </Segment>
      )}

      {graphGistPreviewHTML && (
        <div className={classes.previewContainer}>
          <GraphGistRenderer>
            <div
              id="gist-body"
              data-gist-id="preview-submit-graphgist"
              dangerouslySetInnerHTML={{ __html: graphGistPreviewHTML }}
            />
          </GraphGistRenderer>
        </div>
      )}
    </React.Fragment>
  );
}

export default GraphGistCreate;
