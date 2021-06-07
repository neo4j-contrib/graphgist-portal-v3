import React from 'react';
import { Helmet } from 'react-helmet';
import GraphGistsByPerson from './GraphGistsByPerson';

function MyGraphGists() {
  return (
    <React.Fragment>
      <Helmet title="My GraphGists" />
      <h1>My GraphGists</h1>
      <GraphGistsByPerson myGraphGists />
    </React.Fragment>
  );
}

export default MyGraphGists;
