import React from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Button,
  Item,
  Icon,
  Grid,
  Header,
  Divider,
  Label,
} from "semantic-ui-react";
import moment from "moment";
import { Helmet } from "react-helmet";
import _ from "lodash";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { createUseStyles } from "react-jss";
import SimpleFormat from "../components/SimpleFormat.js";
import GraphGistRenderer from "./render/GraphGistRenderer.js";
import PageLoading from "../components/PageLoading.js";
import AddRating from "./components/AddRating.js";

import "./GraphGistPage.scss";
import { FacebookShareButton, TwitterShareButton } from "react-share";

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

const FLAG_GRAPHGIST_AS_GUIDE = gql`
  mutation flagGraphGistAsGuideMutation($uuid: ID!, $is_guide: Boolean!) {
    FlagGraphGistAsGuide(uuid: $uuid, is_guide: $is_guide) {
      uuid
      is_guide
    }
  }
`;

const useStyles = createUseStyles({
  sidebarImg: {
    maxWidth: "100%",
  },
});

function GraphGistPage({ graphGist, loading, error, candidate, refetch }) {
  const slug = candidate
    ? _.get(graphGist, "graphgist.slug")
    : _.get(graphGist, "slug");
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
              {!candidate && graphGist.status === "live" && slug && (
                <>
                  <a href={`https://neo4j.com/graphgist/${slug}`}>
                    Live Version
                  </a>
                  <Divider />
                </>
              )}

              {graphGist.my_perms.indexOf("edit") >= 0 && (
                <>
                  {candidate && (
                    <p>
                      <Label
                        as={Link}
                        color="red"
                        to={`/graph_gists/${graphGist.graphgist.slug}`}
                      >
                        Go to master version.
                      </Label>
                    </p>
                  )}

                  {!candidate && graphGist.is_candidate_updated && (
                    <p>
                      <Label
                        as={Link}
                        color="red"
                        to={`/graph_gist_candidates/${graphGist.candidate.uuid}`}
                      >
                        This version is outdated.
                        <br />
                        Go to candidate version.
                      </Label>
                    </p>
                  )}

                  <Label
                    color={_.get(
                      { candidate: "orange", live: "teal", disabled: "red" },
                      graphGist.status,
                      undefined
                    )}
                  >
                    {graphGist.status}
                  </Label>

                  <Divider />
                </>
              )}

              <AssetExtraButtons
                graphGist={graphGist}
                candidate={candidate}
                slug={slug}
                refetch={refetch}
              />
            </Grid.Column>
          </Grid>
        </React.Fragment>
      )}
    </PageLoading>
  );
}

function AssetExtraButtons({ graphGist, candidate, slug, refetch }) {
  const history = useHistory();
  const classes = useStyles();
  const uuid = candidate ? _.get(graphGist, "graphgist.uuid") : graphGist.uuid;

  const [
    publishGraphGistCandidateMutation,
    { loading: isPublishing },
  ] = useMutation(PUBLISH_GRAPHGIST, {
    onCompleted: () => {
      history.push(`/graph_gists/${slug}`);
    },
  });

  const handlePublish = () => {
    publishGraphGistCandidateMutation({ variables: { uuid } });
  };

  const [flagAsGuideMutation, { loading: isSavingAsGuide }] = useMutation(
    FLAG_GRAPHGIST_AS_GUIDE,
    {
      onCompleted: () => {
        refetch();
      },
    }
  );

  const handleMarkAsGuide = () => {
    flagAsGuideMutation({ variables: { uuid, is_guide: !graphGist.is_guide } });
  };

  const [disableGraphGistMutation, { loading: isDisabling }] = useMutation(
    DISABLE_GRAPHGIST,
    {
      onCompleted: () => {
        refetch();
        history.push(`/graph_gists/${slug}`);
      },
    }
  );

  const handleDisable = () => {
    disableGraphGistMutation({ variables: { uuid } });
  };

  const playUrl = encodeURI(
    `https://guides.neo4j.com/graph-examples/${graphGist.slug}/graph_guide`
  );

  const shareUrl = `https://portal.graphgist.org/graph_gists/${graphGist.slug}`;

  const isLoginEnabled =
    typeof window !== "undefined" && !window.neo4jDesktopApi;

  return (
    <React.Fragment>
      {graphGist.my_perms.indexOf("admin") >= 0 && (
        <React.Fragment>
          {candidate && (
            <>
              <Button
                icon
                labelPosition="left"
                color="teal"
                loading={isPublishing}
                onClick={handlePublish}
              >
                <Icon name="checkmark" />
                Approve
              </Button>
              <Divider />
            </>
          )}
          <Button
            icon
            labelPosition="left"
            loading={isDisabling}
            onClick={handleDisable}
          >
            <Icon name="remove" />
            Disable
          </Button>
          <Divider />
        </React.Fragment>
      )}

      {!candidate && (
        <Button
          icon
          labelPosition="left"
          color="teal"
          as="a"
          href={`neo4j-desktop://graphapps/neo4j-browser?cmd=play&arg=${playUrl}`}
        >
          <Icon name="play" />
          Play as Browser Guide
        </Button>
      )}

      {!candidate && graphGist.my_perms.indexOf("admin") >= 0 && (
        <React.Fragment>
          <Divider />
          <Button
            icon
            labelPosition="left"
            fluid
            loading={isSavingAsGuide}
            onClick={handleMarkAsGuide}
          >
            {graphGist.is_guide ? "Remove from guides" : "Optimized as Guide"}
          </Button>
        </React.Fragment>
      )}
      {graphGist.my_perms.indexOf("edit") >= 0 && uuid && (
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

      {slug && (
        <>
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
        </>
      )}

      <Item.Group>
        {graphGist.image.length > 0 && (
          <Item>
            <Item.Content>
              <Divider horizontal>Image</Divider>
              <Item.Description>
                {graphGist.image.map((image, i) => {
                  return (
                    <a
                      href={image.source_url}
                      key={i}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={image.source_url}
                        alt={graphGist.title}
                        className={classes.sidebarImg}
                      />
                    </a>
                  );
                })}
              </Item.Description>
            </Item.Content>
          </Item>
        )}
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
        {isLoginEnabled && !candidate && (
          <Item>
            <Item.Content>
              <Divider horizontal>Rating</Divider>
              <Item.Description>
                <AddRating to={uuid} my_rating={graphGist.my_rating} />
              </Item.Description>
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
        {!candidate && (
          <Item>
            <Item.Content>
              <Divider horizontal>Share</Divider>
              <TwitterShareButton
                url={shareUrl}
                title={"Check out this graph gist! " + graphGist.title}
                style={{ width: "100%", height: 40 }}
              >
                <Button primary style={{ width: "100%", height: "100%" }}>
                  Twitter
                </Button>
              </TwitterShareButton>

              <FacebookShareButton
                url={shareUrl}
                hashtag="graphgist"
                quote={"Check out this graph gist! " + graphGist.title}
                style={{ width: "100%", height: 40, marginTop: 10 }}
              >
                <Button secondary style={{ width: "100%", height: "100%" }}>
                  Facebook
                </Button>
              </FacebookShareButton>
            </Item.Content>
          </Item>
        )}
      </Item.Group>
    </React.Fragment>
  );
}

export default GraphGistPage;
