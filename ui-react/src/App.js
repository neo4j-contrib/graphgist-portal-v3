import React, { useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Switch, Route, NavLink } from "react-router-dom";
import { Menu, Container } from "semantic-ui-react";
import { createUseStyles } from "react-jss";
import { useAuth0 } from "@auth0/auth0-react";
import { useState as hookUseState } from "@hookstate/core";
import { Link } from "react-router-dom";
import _ from "lodash";

import ScrollToTop from "./components/ScrollToTop";

import Home from "./Home";
import GraphGists from "./graphgists/GraphGists";
import GraphGuides from "./graphgists/GraphGuides";
import GraphGistPage from "./graphgists/GraphGistPage";

import AuthCallbackPage from "./auth/Callback";

import { authToken } from "./auth/state";

import "semantic-ui-css/semantic.min.css";

const useStyles = createUseStyles({
  container: {
    marginTop: 60
  }
});

const GET_ME = gql`
  query meQuery($isAuthed: Boolean!) {
    me @include(if: $isAuthed) {
      uuid
      name
      image
    }
  }
`;

function App() {
  const classes = useStyles();
  const { loginWithRedirect, logout, getIdTokenClaims } = useAuth0();
  const authTokenState = hookUseState(authToken);
  const { data, refetch } = useQuery(GET_ME, {
    variables: {
      isAuthed: false
    }
  });
  const me = _.get(data, "me");

  useEffect(() => {
    (async () => {
      try {
        const token = await getIdTokenClaims();
        if (token) {
          authTokenState.set(token);
          refetch({ isAuthed: true });
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [getIdTokenClaims, authTokenState, refetch]);

  return (
    <React.Fragment>
      <ScrollToTop />
      <Menu pointing fixed="top">
        <Menu.Item as={NavLink} exact to="/">
          Home
        </Menu.Item>
        <Menu.Item as={NavLink} to="/graph_gists">
          GraphGists
        </Menu.Item>
        <Menu.Item as={NavLink} to="/graph_guides">
          Graph Guides
        </Menu.Item>
        <Menu.Menu position="right">
          {me && (
            <React.Fragment>
              <Menu.Item style={{ paddingRight: 50 }}>
                Logged in as&nbsp;<Link to="/users/edit">{me.name}</Link>
                <img
                  className="ui mini circular image"
                  src={me.image}
                  style={{
                    marginLeft: 8,
                    position: "absolute",
                    top: 5,
                    right: 10,
                    width: 30
                  }}
                  alt={me.name}
                />
              </Menu.Item>
              <Menu.Item onClick={logout}>Sign out</Menu.Item>
            </React.Fragment>
          )}
          {!me && <Menu.Item onClick={loginWithRedirect}>Sign in</Menu.Item>}
        </Menu.Menu>
      </Menu>
      <Container className={classes.container} id="main">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/graph_gists" component={GraphGists} />
          <Route exact path="/graph_guides" component={GraphGuides} />
          <Route exact path="/graph_gists/:id" component={GraphGistPage} />
          <Route exact path="/authorize" component={AuthCallbackPage} />
        </Switch>
      </Container>
    </React.Fragment>
  );
}

export default App;
