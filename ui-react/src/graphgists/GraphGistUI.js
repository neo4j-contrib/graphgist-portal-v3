import React from "react";
import { Link } from "react-router-dom";
import { Button, Item, Icon, Grid, Header, Divider } from "semantic-ui-react";
import moment from "moment";
import { Helmet } from "react-helmet";
import SimpleFormat from "../components/SimpleFormat.js";
import GraphGistRenderer from "./render/GraphGistRenderer.js";
import PageLoading from "../components/PageLoading.js";

import "./GraphGistPage.scss";

function GraphGistPage({graphGist, loading, error, candidate}) {
  return (
    <PageLoading loading={loading} error={error} obj={graphGist}>
      {graphGist && <React.Fragment>
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

            {graphGist.status === "live" && (
              <a href={`https://neo4j.com/graphgist/${candidate ? graphGist.graphgist.slug : graphGist.slug}`}>
                Live Version
              </a>
            )}

            <AssetExtraButtons graphGist={graphGist} candidate={candidate} />
          </Grid.Column>
        </Grid>
      </React.Fragment>}
    </PageLoading>
  );
}

function AssetExtraButtons({ graphGist, candidate }) {
  return (
    <React.Fragment>
      <a href=".">Run this gist in the Neo4j console</a>
      {graphGist.my_perms.indexOf('edit') >= 0 && <React.Fragment><Divider /><Button
        icon
        labelPosition="left"
        fluid
        as={Link}
        to={`/graph_gists/${candidate ? graphGist.graphgist.uuid : graphGist.uuid}/edit_by_owner`}
      >
        <Icon name="edit" />
        Edit GraphGist
        </Button>
      </React.Fragment>}

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

      <Divider />
      <Button
        icon
        labelPosition="left"
        fluid
        as={Link}
        to={`/graph_gists/${candidate ? graphGist.graphgist.slug : graphGist.slug}/source`}
      >
        <Icon name="file text" />
        Show Source
      </Button>

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
        {!candidate && <Item>
          <Item.Content>
            <Divider horizontal>Rating</Divider>
            <Item.Description>{graphGist.avg_rating}</Item.Description>
          </Item.Content>
        </Item>}
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
