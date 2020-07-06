import React from "react";
import { Switch, Route, NavLink } from "react-router-dom";
import { Menu, Container } from "semantic-ui-react";
import { createUseStyles } from "react-jss";

import Home from "./Home";
import GraphGists from "./graphgists/GraphGists";

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
			<Menu pointing fixed="top">
				<Menu.Item as={NavLink} exact to="/">Home</Menu.Item>
				<Menu.Item as={NavLink} to="/graph_gists">GraphGists</Menu.Item>
			</Menu>
			<Container className={classes.container}>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/graph_gists" component={GraphGists} />
				</Switch>
			</Container>
		</React.Fragment>
	);
}

export default App;
