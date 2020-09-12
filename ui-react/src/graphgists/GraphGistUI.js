import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Button, Item, Icon, Grid, Header, Divider, Label } from "semantic-ui-react";
import moment from "moment";
import { Helmet } from "react-helmet";
import _ from "lodash";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import SimpleFormat from "../components/SimpleFormat.js";
import GraphGistRenderer from "./render/GraphGistRenderer.js";
import PageLoading from "../components/PageLoading.js";

import "./GraphGistPage.scss";

const PUBLISH_GRAPHGIST = gql`
  mutation publishGraphGistCandidateMutation($uuid: ID!) {
    PublishGraphGistCandidate(uuid: $uuid) {
      uuid
      status
    }
  }
`;

const DISABLE_GRAPHGIST = gql`
  mutation disableGraphGistMutation($uuid: ID!) {
    DisableGraphGist(uuid: $uuid) {
      uuid
      status
    }
  }
`;

function GraphGistPage({ graphGist, loading, error, candidate, refetch }) {
  const slug = candidate ? _.get(graphGist, 'graphgist.slug') : _.get(graphGist, 'slug');
  return (
    <PageLoading loading={loading} error={error} obj={graphGist}>
      {graphGist && (
        <React.Fragment>
          <Helmet title={graphGist.title} />

          <Header as="h1" textAlign="center" size="huge">
            {graphGist.title}
          </Header>

          <Grid>
            <Grid.Column width={13}>
              {graphGist.summary && (
                <React.Fragment>
                  <Divider horizontal>Summary</Divider>
                  <SimpleFormat text={graphGist.summary} />
                </React.Fragment>
              )}
              <GraphGistRenderer>
                <div
                  id="gist-body"
                  data-gist-id={graphGist.render_id || graphGist.uuid}
                  className={graphGist.cached && "cached"}
                  dangerouslySetInnerHTML={{ __html: graphGist.raw_html }}
                />
              </GraphGistRenderer>
            </Grid.Column>
            <Grid.Column width={3}>
              {(!candidate && graphGist.status === "live" && slug ) && (<>
                <a
                  href={`https://neo4j.com/graphgist/${slug}`}
                >
                  Live Version
                </a>
                <Divider />
              </>)}

              {graphGist.my_perms.indexOf("edit") >= 0 && (
                <>
                {(candidate && _.get(graphGist, 'graphgist.status') === 'live') && <p><Label as={Link} color="red" to={`/graph_gists/${graphGist.graphgist.slug}`}>
                    Go to live version.
                  </Label></p>}
                  
                {(!candidate && graphGist.is_candidate_updated) && <p><Label as={Link} color="red" to={`/graph_gist_candidates/${graphGist.candidate.uuid}`}>
                    This version is outdated.<br />
                    Go to candidate version.
                  </Label></p>}

                  <Label color={_.get({candidate: 'orange', live: 'teal', disabled: 'red'}, graphGist.status, undefined)}>
                    {graphGist.status}
                  </Label>

                  <Divider />
                </>
              )}

              <AssetExtraButtons graphGist={graphGist} candidate={candidate} slug={slug} refetch={refetch} />
            </Grid.Column>
          </Grid>
        </React.Fragment>
      )}
    </PageLoading>
  );
}

function AssetExtraButtons({ graphGist, candidate, slug, refetch }) {
  const history = useHistory();

  const uuid = candidate ? _.get(graphGist, 'graphgist.uuid') : graphGist.uuid

  const [publishGraphGistCandidateMutation, { loading: isPublishing }] = useMutation(PUBLISH_GRAPHGIST, {
    onCompleted: () => {
      history.push(`/graph_gists/${slug}`);
    }
  });

  const handlePublish = () => {
    publishGraphGistCandidateMutation({ variables: { uuid }});
  };

  const [disableGraphGistMutation, { loading: isDisabling }] = useMutation(DISABLE_GRAPHGIST, {
    onCompleted: () => {
      refetch();
      history.push(`/graph_gists/${slug}`);
    }
  });

  const handleDisable = () => {
    disableGraphGistMutation({ variables: { uuid }});
  };

  return (
    <React.Fragment>
      {graphGist.my_perms.indexOf("admin") >= 0 && (
        <React.Fragment>
          {candidate && <>
            <Button icon labelPosition="left" color="teal" loading={isPublishing} onClick={handlePublish}>
              <Icon name="checkmark" />
              Approve
            </Button>
            <Divider />
          </>}
          <Button icon labelPosition="left" loading={isDisabling} onClick={handleDisable}>
            <Icon name="remove" />
            Disable
          </Button>
          <Divider />
        </React.Fragment>
      )}

      <a href=".">Run this gist in the Neo4j console</a>

      {(graphGist.my_perms.indexOf("edit") >= 0 && uuid) && (
        <React.Fragment>
          <Divider />
          <Button
            icon
            labelPosition="left"
            fluid
            as={Link}
            to={`/graph_gists/${uuid}/edit_by_owner`}
          >
            <Icon name="edit" />
            Edit GraphGist
          </Button>
        </React.Fragment>
      )}

      {/*
	- if @asset.persisted?
    - if @access_level == 'write'
      .ui.divider
      div
        a.ui.labeled.icon.button href="#{graph_edit_by_owner_path(id: asset.is_a?(GraphGist) ? @asset.id : @asset.graphgist.id)}"
          i.edit.icon
          | Edit Graphgist
      - if asset.is_guide == false
        .ui.divider
        = form_tag make_graphgist_as_guide_path(id: asset.is_a?(GraphGistCandidate) ? asset.graphgist.id : asset.id)
          button.ui.button type="submit"
            | Optimized as Guide
      - if asset.is_guide == true
        .ui.divider
        p
          | This is optimized as Guide
        = form_tag make_graphgist_not_guide_path(id: asset.is_a?(GraphGistCandidate) ? asset.graphgist.id : asset.id)
          button.ui.button type="submit"
            | Remove from guides
      - if asset.status == 'draft'
        .ui.divider
        = form_tag make_graphgist_candidate_path(id: asset.is_a?(GraphGistCandidate) ? asset.graphgist.id : asset.id)
          button.ui.button type="submit"
            | Submit for Approval
      - if asset.status == 'candidate'
        .ui.divider
        div
          | Submitted for approval
      .ui.divider
      div
        | If approved, your graphgist will appear on the Neo4j.com/graphgists. You can make edits at any time, and when you are ready for the edits to appear on the Neo4j.com/graphgists you can submit again
*/}

      {slug && <>
        <Divider />
        <Button
          icon
          labelPosition="left"
          fluid
          as={Link}
          to={`/graph_gists/${slug}/source`}
        >
          <Icon name="file text" />
          Show Source
        </Button>
      </>}

      <Item.Group>
        <Item>
          <Item.Content>
            <Divider horizontal>Author</Divider>
            <Item.Description>
              <Icon name="user" size="large" />
              <Link to={`/people/${graphGist.author.slug}`}>
                {graphGist.author.name}
              </Link>
            </Item.Description>
          </Item.Content>
        </Item>
        {!candidate && (
          <Item>
            <Item.Content>
              <Divider horizontal>Rating</Divider>
              <Item.Description>{graphGist.avg_rating}</Item.Description>
            </Item.Content>
          </Item>
        )}
        <Item>
          <Item.Content>
            <Divider horizontal>Created</Divider>
            <Item.Description>
              {moment.unix(graphGist.created_at.formatted).format()}
            </Item.Description>
          </Item.Content>
        </Item>
      </Item.Group>
    </React.Fragment>
  );
}

export default GraphGistPage;
