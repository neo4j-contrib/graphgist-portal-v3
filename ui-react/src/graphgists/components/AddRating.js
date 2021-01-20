import React, { useState } from "react";
import { Rating } from "semantic-ui-react";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import _ from "lodash";

const ADD_RATING = gql`
  mutation addRatingMutation($to: ID!, $level: Int!) {
    Rate(to: $to, level: $level) {
      level
    }
  }
`;

function AddRating({ to, my_rating }) {
  const [currentRating, setCurrentRating] = useState(
    _.get(my_rating, "level", "")
  );

  const [addRating, { loading }] = useMutation(ADD_RATING, {
    onCompleted: (d) => {
      setCurrentRating(d.Rate.level);
    },
  });

  const onRate = (e, d) => {
    addRating({ variables: { to, level: d.rating } });
  };

  if (loading) {
    return <div>saving...</div>;
  }

  return (
    <Rating maxRating={5} onRate={onRate} rating={currentRating} clearable />
  );
}

export default AddRating;
