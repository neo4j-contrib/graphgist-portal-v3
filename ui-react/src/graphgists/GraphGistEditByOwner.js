import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams, useHistory } from "react-router-dom";
import gql from "graphql-tag";
import {
  Form,
  Button,
  Grid,
  Header,
  Image,
  Card,
  Loader,
  Dimmer,
  Segment,
  Select,
} from "semantic-ui-react";
import _ from "lodash";
import { Helmet } from "react-helmet";
import { Formik, FieldArray } from "formik";
import { createUseStyles } from "react-jss";
import CodeMirrorTextArea from "./render/TextArea";
import AuthorsSelect from "./components/AuthorsSelect";
import IndustriesSelect from "./components/IndustriesSelect";
import UseCasesSelect from "./components/UseCasesSelect";
import ChallengesSelect from "./components/ChallengesSelect";
import GraphGistRenderer from "./render/GraphGistRenderer.js";

const GET_GRAPHGIST = gql`
  query graphGistPage($id: ID!) {
    getGraphGistCandidate(uuid: $id) {
      uuid
      graphgist {
        uuid
      }
      my_perms
      render_id
      status
      slug
      title
      summary
      asciidoc
      cached
      neo4j_version
      author {
        uuid
        name
        slug
      }
      created_at {
        formatted
      }
      images: image {
        uuid
        title
        description
        source_url
      }
      industries {
        uuid
        name
      }
      use_cases {
        uuid
        name
      }
      challenges {
        uuid
        name
      }
      author {
        uuid
        name
        slug
        image {
          source_url
        }
      }
    }

    statusChoices: __type(name: "GraphGistStatus") {
      enumValues {
        name
      }
    }
  }
`;

const PREVIEW = gql`
  mutation Preview($asciidoc: String!) {
    PreviewGraphGist(asciidoc: $asciidoc)
  }
`;

const UPDATE_GRAPHGIST = gql`
  mutation UpdateGraphGist($id: ID!, $graphgist: GraphGistInput!) {
    UpdateGraphGist(uuid: $id, graphgist: $graphgist) {
      uuid
    }
  }
`;

const useStyles = createUseStyles({
  previewContainer: {
    margin: "0 0 60px 0",
    padding: "0 40px",
    minHeight: 100,
    maxHeight: "80vh",
    width: "100%",
    border: "1px solid #999",
    overflow: "auto",
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

function GraphGistEditByOwner() {
  const classes = useStyles();
  const history = useHistory();
  const { id } = useParams();

  const { loading, data, error } = useQuery(GET_GRAPHGIST, {
    fetchPolicy: "cache-and-network",
    variables: { id },
  });

  const [
    previewGraphGist,
    { data: graphGistPreviewResult, loading: isLoadingPreview },
  ] = useMutation(PREVIEW, {
    onError: (data) => {
      showApiError(data);
    },
  });

  const [updateGraphGist, { loading: isSaving }] = useMutation(
    UPDATE_GRAPHGIST,
    {
      onCompleted: (data) => {
        history.push(`/graph_gist_candidates/${data.UpdateGraphGist.uuid}`);
      },
      onError: (data, e) => {
        showApiError(data);
      },
    }
  );

  const showApiError = (data) => {
    history.push(`/graph_gists/${id}/edit_by_owner`, {
      messages: data.graphQLErrors.map((error) => ({
        body: error.message,
        type: "negative",
      })),
    });
  };

  const handlePreview = (e, asciidoc) => {
    e.preventDefault();
    previewGraphGist({ variables: { asciidoc } });
  };

  const graphGistPreviewHTML = _.get(
    graphGistPreviewResult,
    "PreviewGraphGist",
    ""
  );

  const graphGistCandidate = _.get(data, "getGraphGistCandidate", null);
  const graphGist = _.get(graphGistCandidate, "graphgist", null);
  const statusChoices = _.get(data, "statusChoices.enumValues", []).map(
    (item) => ({
      value: item.name,
      text: item.name,
    })
  );

  if (loading && !error) {
    return (
      <Grid>
        <Grid.Column width={16}>
          <p>Loading...</p>
        </Grid.Column>
      </Grid>
    );
  }

  if (!graphGistCandidate) {
    return (
      <Grid>
        <Grid.Column width={16}>
          <p>Not found</p>
        </Grid.Column>
      </Grid>
    );
  }

  return (
    <React.Fragment>
      <Helmet title={graphGistCandidate.title} />

      <Header as="h1" size="huge">
        {graphGistCandidate.title}
      </Header>

      <Formik
        initialValues={{
          title: graphGistCandidate.title,
          asciidoc: graphGistCandidate.asciidoc,
          author: graphGistCandidate.author.uuid,
          summary: graphGistCandidate.summary,
          status: graphGistCandidate.status,
          neo4j_version: graphGistCandidate.neo4j_version,
          images: graphGistCandidate.images || [],
          industries: graphGistCandidate.industries.map((i) => i.uuid),
          challenges: graphGistCandidate.challenges.map((i) => i.uuid),
          use_cases: graphGistCandidate.use_cases.map((i) => i.uuid),
        }}
        onSubmit={(values, e, a) => {
          updateGraphGist({
            variables: {
              id: graphGist.uuid,
              graphgist: {
                ...values,
                images: values.images.map((image) => image.file),
              },
            },
          });
        }}
      >
        {({ values, handleChange, handleSubmit }) => {
          const handleChangeSelect = (e, { value, name }) => {
            e.target.name = name;
            e.target.value = value;
            handleChange(e);
          };

          return (
            <Form className={classes.form}>
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
                          <input name="image" type="file" onChange={addImage} />
                        </Form.Field>
                      </Card.Group>
                    );
                  }}
                />
              </div>

              <Form.Field>
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
              />

              <Form.Field>
                <label>Summary</label>
                <Form.TextArea
                  name="summary"
                  value={values.summary}
                  onChange={handleChange}
                />
              </Form.Field>
              {graphGistCandidate.my_perms.indexOf("admin") >= 0 && (
                <React.Fragment>
                  <Form.Field>
                    <label>Status</label>
                    <Select
                      options={statusChoices}
                      name="status"
                      value={values.status}
                      onChange={handleChangeSelect}
                      required
                      fluid
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>Neo4j Version (3.5 is default)</label>
                    <input
                      name="neo4j_version"
                      value={values.neo4j_version}
                      onChange={handleChange}
                    />
                  </Form.Field>
                  <Form.Field>
                    <label>Author</label>
                    <AuthorsSelect
                      name="author"
                      value={values.author}
                      onChange={handleChange}
                      fluid
                    />
                  </Form.Field>
                </React.Fragment>
              )}
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
              <Button onClick={handleSubmit} primary loading={isSaving}>
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
              data-gist-id={graphGistCandidate.uuid}
              dangerouslySetInnerHTML={{ __html: graphGistPreviewHTML }}
            />
          </GraphGistRenderer>
        </div>
      )}
    </React.Fragment>
  );
}

export default GraphGistEditByOwner;
