import React from 'react';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import gql from 'graphql-tag';
import { Helmet } from 'react-helmet';
import _ from 'lodash';
import GraphGistsByPerson from '../graphgists/GraphGistsByPerson';
import PageLoading from '../components/PageLoading';

const GET_ME = gql`
  query personQuery($slug: String!) {
    Person(slug: $slug) {
      uuid
      name
    }
  }
`;

function PersonGraphGists() {
  const { slug } = useParams();

  const { data, loading, error } = useQuery(GET_ME, { variables: { slug } });
  const person = _.get(data, 'Person[0]', {});
  const uuid = _.get(person, 'uuid');

  return (
    <PageLoading obj={data} loading={loading} error={error}>
      {uuid && (
        <>
          <Helmet title="My GraphGists" />
          <h1>{person.name}</h1>
          <GraphGistsByPerson personUUID={uuid} />
        </>
      )}
    </PageLoading>
  );
}

export default PersonGraphGists;
