import React, { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import {
  Switch,
  Route,
  NavLink,
  Link,
  useLocation,
  useHistory,
} from 'react-router-dom';
import {
  Menu,
  Container,
  Message,
  Dropdown,
  Label,
  Icon,
} from 'semantic-ui-react';
import { createUseStyles } from 'react-jss';
import { useAuth0 } from '@auth0/auth0-react';
import { useState as hookUseState } from '@hookstate/core';
import _ from 'lodash';
import { Helmet } from 'react-helmet';

import ScrollToTop from './components/ScrollToTop';

import Home from './Home';
import GraphGists from './graphgists/GraphGists';
import GraphGuides from './graphgists/GraphGuides';
import GraphGistPage from './graphgists/GraphGistPage';
import GraphGistCandidatePage from './graphgists/GraphGistCandidatePage';
import GraphGistSourcePage from './graphgists/GraphGistSourcePage';
import GraphGistEditByOwner from './graphgists/GraphGistEditByOwner';
import GraphGistCreate from './graphgists/GraphGistCreate';
import MyGraphGists from './graphgists/MyGraphGists';
import PersonGraphGists from './people/PersonGraphGists';

import CategoryPage from './categories/CategoryPage';
import ChallengesList from './categories/ChallengesList';
import ChallengeCreate from './categories/ChallengeCreate';
import ChallengeUpdate from './categories/ChallengeUpdate';

import Candidates from './candidates/Candidates';

import MyGallery from './images/MyGallery';

import EditProfile from './people/EditProfile';

import AuthCallbackPage from './auth/Callback';

import { authToken } from './auth/state';

import 'semantic-ui-css/semantic.min.css';

export function getImage(field) {
  return field.length > 0 ? field[0].source_url : null;
}

const useStyles = createUseStyles({
  container: {
    marginTop: 60,
  },
});

const GET_TOOLBAR = gql`
  query meQuery {
    me {
      uuid
      name
      image
      my_perms
    }
    useCases: UseCase {
      slug
      name
      num_graphgists
      image(first: 1) {
        source_url
      }
    }
    industries: Industry {
      slug
      name
      num_graphgists
      image(first: 1) {
        source_url
      }
    }
    challenges: Challenge {
      slug
      name
      num_graphgists
      image(first: 1) {
        source_url
      }
    }
  }
`;

function has_perm(user, perm) {
  return user && user.my_perms.indexOf(perm) >= 0;
}

function App() {
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const { loginWithRedirect, logout, getIdTokenClaims } = useAuth0();
  const authTokenState = hookUseState(authToken);
  const { data, refetch } = useQuery(GET_TOOLBAR);
  const me = _.get(data, 'me');
  const useCases = _.get(data, 'useCases', []);
  const industries = _.get(data, 'industries', []);
  const challenges = _.get(data, 'challenges', []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getIdTokenClaims();
        if (token) {
          authTokenState.set(token.__raw);
          window.localStorage.setItem('authToken', token.__raw);
          refetch();
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [getIdTokenClaims, authTokenState, refetch]);

  const handleLogout = (e) => {
    e.preventDefault();
    authTokenState.set(null);
    window.localStorage.removeItem('authToken');
    logout({ returnTo: window.location.origin });
  };

  const messages = _.get(location.state, 'messages', []);

  const isLoginEnabled =
    typeof window !== 'undefined' && !window.neo4jDesktopApi;

  return (
    <React.Fragment>
      <Helmet
        titleTemplate="%s - GraphGist Portal"
        defaultTitle="GraphGist Portal"
      />
      <ScrollToTop />
      <Menu pointing fixed="top">
        {!isLoginEnabled && (
          <Menu.Item
            onClick={() => {
              history.goBack();
            }}
          >
            <Icon name="arrow left" />
          </Menu.Item>
        )}
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
        <Dropdown item text="Use Cases">
          <Dropdown.Menu className="categoriesList">
            {useCases.map((category) => {
              const category_image = getImage(category.image);
              return (
                <Dropdown.Item
                  key={category.slug}
                  as={NavLink}
                  to={`/use_cases/${category.slug}`}
                >
                  {category_image && (
                    <img src={category_image} width="30" alt={category.name} />
                  )}{' '}
                  {category.name} <Label>{category.num_graphgists}</Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item text="Industries">
          <Dropdown.Menu className="categoriesList">
            {industries.map((category) => {
              const category_image = getImage(category.image);
              return (
                <Dropdown.Item
                  key={category.slug}
                  as={NavLink}
                  to={`/industries/${category.slug}`}
                >
                  {category_image && (
                    <img src={category_image} width="30" alt={category.name} />
                  )}{' '}
                  {category.name} <Label>{category.num_graphgists}</Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item text="Challenges">
          <Dropdown.Menu className="categoriesList">
            {challenges.map((category) => {
              const category_image = getImage(category.image);
              return (
                <Dropdown.Item
                  key={category.slug}
                  as={NavLink}
                  to={`/challenges/${category.slug}`}
                >
                  {category_image && (
                    <img src={category_image} width="30" alt={category.name} />
                  )}{' '}
                  {category.name} <Label>{category.num_graphgists}</Label>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item as={NavLink} to="/graph_guides">
          Graph Guides
        </Menu.Item>
        {has_perm(me, 'review_candidates') && (
          <Menu.Item as={NavLink} to="/candidates/waiting_review">
            Candidates
          </Menu.Item>
        )}
        {me && (
          <Menu.Item as={NavLink} to="/my_gallery">
            My Gallery
          </Menu.Item>
        )}
        {isLoginEnabled && (
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
                      position: 'absolute',
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
        )}
      </Menu>
      <Container className={classes.container} id="main">
        {messages.map((message, i) => (
          <Message key={i} {...{ [message.type]: true }}>
            {message.body}
          </Message>
        ))}
        <Switch>
          <Route exact path="/graph_gists" component={GraphGists} />
          <Route exact path="/people/:slug" component={PersonGraphGists} />
          <Route exact path="/my_graphgists" component={MyGraphGists} />
          <Route exact path="/graph_guides" component={GraphGuides} />
          <Route exact path="/my_gallery" component={MyGallery} />
          <Route exact path="/challenges" component={ChallengesList} />
          <Route exact path="/challenges/new" component={ChallengeCreate} />
          <Route
            exact
            path="/challenges/:id/edit"
            component={ChallengeUpdate}
          />
          <Route exact path="/submit_graphgist" component={GraphGistCreate} />
          <Route exact path="/graph_gists/:id" component={GraphGistPage} />
          <Route
            exact
            path="/(challenges|industries|use_cases)/:categorySlug"
            component={CategoryPage}
          />
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
          <Route exact path="*" component={Home} />
        </Switch>
      </Container>
    </React.Fragment>
  );
}

export default App;
