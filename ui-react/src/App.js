import React, { useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { Switch, Route, NavLink, Link, useLocation } from "react-router-dom";
import { Menu, Container, Message } from "semantic-ui-react";
import { createUseStyles } from "react-jss";
import { useAuth0 } from "@auth0/auth0-react";
import { useState as hookUseState } from "@hookstate/core";
import _ from "lodash";
import { Helmet } from "react-helmet";

import ScrollToTop from "./components/ScrollToTop";

import Home from "./Home";
import GraphGists from "./graphgists/GraphGists";
import GraphGuides from "./graphgists/GraphGuides";
import GraphGistPage from "./graphgists/GraphGistPage";
import GraphGistCandidatePage from "./graphgists/GraphGistCandidatePage";
import GraphGistSourcePage from "./graphgists/GraphGistSourcePage";
import GraphGistEditByOwner from "./graphgists/GraphGistEditByOwner";
import GraphGistCreate from "./graphgists/GraphGistCreate";
import MyGraphGists from "./graphgists/MyGraphGists";
import PersonGraphGists from "./people/PersonGraphGists";

import Candidates from "./candidates/Candidates";

import EditProfile from "./people/EditProfile";

import AuthCallbackPage from "./auth/Callback";

import { authToken } from "./auth/state";

import "semantic-ui-css/semantic.min.css";

const useStyles = createUseStyles({
  container: {
    marginTop: 60,
  },
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
  const location = useLocation();
  const classes = useStyles();
  const { loginWithRedirect, logout, getIdTokenClaims } = useAuth0();
  const authTokenState = hookUseState(authToken);
  const { data, refetch } = useQuery(GET_ME, {
    variables: {
      isAuthed: false,
    },
  });
  const me = _.get(data, "me");

  useEffect(() => {
    (async () => {
      try {
        const token = await getIdTokenClaims();
        if (token) {
          authTokenState.set(token.__raw);
          window.localStorage.setItem("authToken", token.__raw);
          refetch({ isAuthed: true });
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [getIdTokenClaims, authTokenState, refetch]);

  const handleLogout = (e) => {
    e.preventDefault();
    authTokenState.set(null);
    window.localStorage.removeItem("authToken");
    logout({ returnTo: window.location.origin });
  };

  const messages = _.get(location.state, "messages", []);

  return (
    <React.Fragment>
      <Helmet
        titleTemplate="%s - GraphGist Portal"
        defaultTitle="GraphGist Portal"
      />
      <ScrollToTop />
      <Menu pointing fixed="top">
        <Menu.Item as={NavLink} exact to="/">
          Home
        </Menu.Item>
        <Menu.Item as={NavLink} to="/graph_gists">
          GraphGists
        </Menu.Item>
        {me && (
          <>
            <Menu.Item as={NavLink} to="/submit_graphgist">
              Create a GraphGist
            </Menu.Item>
            <Menu.Item as={NavLink} to="/my_graphgists">
              My GraphGists
            </Menu.Item>
          </>
        )}
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
                    width: 30,
                  }}
                  alt={me.name}
                />
              </Menu.Item>
              <Menu.Item onClick={handleLogout}>Sign out</Menu.Item>
            </React.Fragment>
          )}
          {!me && <Menu.Item onClick={loginWithRedirect}>Sign in</Menu.Item>}
        </Menu.Menu>
      </Menu>
      <Container className={classes.container} id="main">
        {messages.map((message, i) => (
          <Message key={i} {...{ [message.type]: true }}>
            {message.body}
          </Message>
        ))}
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/people/:slug" component={PersonGraphGists} />
          <Route exact path="/my_graphgists" component={MyGraphGists} />
          <Route exact path="/graph_gists" component={GraphGists} />
          <Route exact path="/graph_guides" component={GraphGuides} />
          <Route exact path="/submit_graphgist" component={GraphGistCreate} />
          <Route exact path="/graph_gists/:id" component={GraphGistPage} />
          <Route
            exact
            path="/graph_gists/:id/source"
            component={GraphGistSourcePage}
          />
          <Route
            exact
            path="/graph_gist_candidates/:id"
            component={GraphGistCandidatePage}
          />
          <Route
            exact
            path="/graph_gists/:id/edit_by_owner"
            component={GraphGistEditByOwner}
          />
          <Route
            exact
            path="/candidates/waiting_review"
            component={Candidates}
          />
          <Route exact path="/users/edit" component={EditProfile} />
          <Route exact path="/authorize" component={AuthCallbackPage} />
        </Switch>
      </Container>
    </React.Fragment>
  );
}

export default App;
