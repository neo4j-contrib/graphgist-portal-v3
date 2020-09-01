import React from "react";
import ReactDOM from "react-dom";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App";
import "./index.css";

import { authToken } from "./auth/state";

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.REACT_APP_AUTH0_CLIENT_ID;

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_URI,
  request: operation => {
    operation.setContext(context => ({
      headers: {
        ...context.headers,
        authorization: authToken.get()
      }
    }));
  }
});

const Main = () => (
  <BrowserRouter>
    <ApolloProvider client={client}>
      <Auth0Provider
        domain={AUTH0_DOMAIN}
        clientId={AUTH0_CLIENT_ID}
        redirectUri={window.location.origin + "/authorize"}
      >
        <App />
      </Auth0Provider>
    </ApolloProvider>
  </BrowserRouter>
);

ReactDOM.render(<Main />, document.getElementById("root"));
