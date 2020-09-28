import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import gql from "graphql-tag";
import { Form, Button, Header, Select } from "semantic-ui-react";
import _ from "lodash";
import { Helmet } from "react-helmet";
import { Formik } from "formik";
import { createUseStyles } from "react-jss";
import PageLoading from "../components/PageLoading.js";

const GET_ME = gql`
  query personQuery {
    me {
      uuid
      name
      twitter_username
      email
      person {
        uuid
        tshirt_size
        tshirt_size_other
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($user: UserInput!) {
    UpdateUser(user: $user) {
      uuid
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

function EditProfile() {
  const classes = useStyles();
  const history = useHistory();

  const { loading, data, error } = useQuery(GET_ME, {
    fetchPolicy: "cache-and-network",
  });

  const [updateGraphGist, { loading: isSaving }] = useMutation(UPDATE_USER, {
    onCompleted: (data) => {
      history.push(`/`, {
        messages: [
          {
            body: "Your account has been updated successfully.",
            type: "positive",
          },
        ],
      });
    },
  });

  const user = _.get(data, "me", null);
  const person = _.get(user, "person", null);

  const tshitSizes = [
    "",
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "XXXL",
    "Other",
  ].map((item) => ({
    value: item,
    text: item,
  }));

  return (
    <PageLoading loading={loading} error={error} obj={user}>
      {user && (
        <React.Fragment>
          <Helmet title="Edit User" />

          <Header as="h1" size="huge">
            Edit User
          </Header>

          <Formik
            initialValues={{
              name: user.name || "",
              twitter_username: user.twitter_username || "",
              email: user.email || "",
              tshirt_size: _.get(person, "tshirt_size") || "",
              tshirt_size_other: _.get(person, "tshirt_size_other") || "",
            }}
            onSubmit={(values, e, a) => {
              updateGraphGist({
                variables: { id: user.uuid, user: values },
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
                  <Form.Field>
                    <label>Name</label>
                    <input
                      required
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Twitter username</label>
                    <input
                      required
                      name="twitter_username"
                      value={values.twitter_username}
                      onChange={handleChange}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>Email</label>
                    <input
                      required
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>T-Shirt size</label>
                    <Select
                      options={tshitSizes}
                      name="tshirt_size"
                      value={values.tshirt_size}
                      onChange={handleChangeSelect}
                      fluid
                    />
                  </Form.Field>

                  <Form.Field>
                    <label>T-Shirt size (other)</label>
                    <input
                      required
                      name="tshirt_size_other"
                      value={values.tshirt_size_other}
                      onChange={handleChange}
                    />
                  </Form.Field>

                  <Button onClick={handleSubmit} primary loading={isSaving}>
                    Update
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </React.Fragment>
      )}
    </PageLoading>
  );
}

export default EditProfile;
