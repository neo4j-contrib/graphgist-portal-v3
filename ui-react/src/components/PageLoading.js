import React from "react";
import { Grid } from "semantic-ui-react";

function PageLoading({ children, loading, error, obj }) {
  if (loading) {
    return (
      <Grid>
        <Grid.Column width={16}>
          <p>Loading...</p>
        </Grid.Column>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid>
        <Grid.Column width={16}>
          <p>error...</p>
        </Grid.Column>
      </Grid>
    );
  }

  if (!obj) {
    return (
      <Grid>
        <Grid.Column width={16}>
          <p>Not found</p>
        </Grid.Column>
      </Grid>
    );
  }

  return children;
}

export default PageLoading;
