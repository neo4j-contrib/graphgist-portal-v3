import React from "react";
import { useQuery } from "@apollo/client";
import { Select } from "semantic-ui-react";
import _ from "lodash";

function GraphQLSelect({ query, onChange, name, ...props }) {
  const { loading, data, error } = useQuery(query, {
    fetchPolicy: "cache-and-network",
  });

  const options = _.get(data, "items", []);

  const onChangeSelect = (e, { value }) => {
    e.target.name = name;
    e.target.value = value;
    onChange(e);
  };

  return (
    <Select
      {...props}
      name={name}
      onChange={onChangeSelect}
      options={options}
      loading={loading}
      error={!!error}
    />
  );
}

export default GraphQLSelect;
