import React from "react";
import { Switch, Route, NavLink } from "react-router-dom";
import { Menu, Container } from "semantic-ui-react";
import { createUseStyles } from "react-jss";

import ScrollToTop from "./components/ScrollToTop";

import Home from "./Home";
import GraphGists from "./graphgists/GraphGists";
import GraphGuides from "./graphgists/GraphGuides";
import GraphGistPage from "./graphgists/GraphGistPage";

import "semantic-ui-css/semantic.min.css";

const useStyles = createUseStyles({
	container: {
		marginTop: 60,
	},
});

function App() {
  const classes = useStyles();

	return (
		<React.Fragment>
      <ScrollToTop />
			<Menu pointing fixed="top">
				<Menu.Item as={NavLink} exact to="/">Home</Menu.Item>
				<Menu.Item as={NavLink} to="/graph_gists">GraphGists</Menu.Item>
				<Menu.Item as={NavLink} to="/graph_guides">Graph Guides</Menu.Item>
			</Menu>
			<Container className={classes.container} id="main">
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/graph_gists" component={GraphGists} />
					<Route exact path="/graph_guides" component={GraphGuides} />
          <Route exact path="/graph_gists/:id" component={GraphGistPage} />
				</Switch>
			</Container>
		</React.Fragment>
	);
}

export default App;
