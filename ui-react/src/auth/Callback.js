import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Message, Loader } from "semantic-ui-react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { useState as hookUseState } from "@hookstate/core";

import { authToken } from "./state";

const AUTH_MUTATION = gql`
  mutation authMutation($token: String!) {
    Authenticate(token: $token) {
      uuid
    }
  }
`;

function Callback({ token }) {
  const [hasError, setHasError] = useState(false);
  const history = useHistory();

  const [authenticate] = useMutation(AUTH_MUTATION, {
    onCompleted: () => {
      history.push("/");
    },
    onError: () => {
      setHasError(true);
    }
  });

  useEffect(() => {
    authenticate({
      variables: {
        token
      }
    });
  }, [authenticate, token]);

  if (hasError) {
    return (
      <Message negative>
        <Message.Header>An error occured while authenticating</Message.Header>
      </Message>
    );
  }

  return <Loader active />;
}

export default () => {
  const authTokenState = hookUseState(authToken);

  return (
    <React.Fragment>
      {!authTokenState.value && <Loader active />}
      {authTokenState.value && <Callback token={authTokenState.value.__raw} />}
    </React.Fragment>
  );
};
