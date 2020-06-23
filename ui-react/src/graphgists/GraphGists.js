import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { Input, Card, Grid, Divider, Pagination } from "semantic-ui-react";
import GistDetail from "./GistDetail";

const GET_GISTS = gql`
  query gistsPaginateQuery($first: Int, $offset: Int) {
    GraphGist(
      first: $first
      offset: $offset
      orderBy: [avg_rating_desc, title_asc]
    ) {
      title
      featured
      avg_rating
      image {
        source_url
      }
      categories {
        __typename
        uuid
        slug
        name
        image {
          source_url
        }
      }
      author {
        name
        slug
        image {
          source_url
        }
      }
    }
  }
`;

function GraphGists() {
  const [order, setOrder] = React.useState("desc");
  const [orderBy, setOrderBy] = React.useState("[avg_rating_desc, title_asc]");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(30);
  const [filterState, setFilterState] = React.useState({ usernameFilter: "" });

  const getFilter = () => {
    return filterState.usernameFilter.length > 0
      ? { name_contains: filterState.usernameFilter }
      : {};
  };

  const { loading, data, error } = useQuery(GET_GISTS, {
    variables: {
      first: rowsPerPage,
      offset: rowsPerPage * page,
      orderBy: orderBy + "_" + order,
      filter: getFilter()
    }
  });

  const handleSortRequest = property => {
    const newOrderBy = property;
    let newOrder = "desc";

    if (orderBy === property && order === "desc") {
      newOrder = "asc";
    }

    setOrder(newOrder);
    setOrderBy(newOrderBy);
  };

  const handleFilterChange = filterName => event => {
    const val = event.target.value;

    setFilterState(oldFilterState => ({
      ...oldFilterState,
      [filterName]: val
    }));
  };

  return (
    <Grid columns={1}>
      <Grid.Row>
        <Input
          id="search"
          icon="search"
          placeholder="Search..."
          value={filterState.usernameFilter}
          onChange={handleFilterChange("usernameFilter")}
          margin="normal"
          type="text"
        />
      </Grid.Row>
      <Grid.Row>
        <div>Displaying 30 of 300 Total</div>
      </Grid.Row>
      <Divider />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Grid columns={3} divided>
          <Grid.Row>
            <Card.Group>
              {data.GraphGist.map(n => {
                return (
                  <Grid.Column key={n.id}>
                    <GistDetail gist={n} />
                  </Grid.Column>
                );
              })}
            </Card.Group>
          </Grid.Row>
        </Grid>
      )}
    </Grid>
  );
}

export default GraphGists;
