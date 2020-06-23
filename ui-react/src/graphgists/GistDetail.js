import React from "react";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import "./GraphGists.css";
import { Card, Image, Divider, Header, Icon } from "semantic-ui-react";
import { Link } from "react-router-dom";
const styles = {
  featured: {
    fontSize: "12 !important",
    marginTop: 12,
    textAlign: "right"
  },
  rows: {
    marginTop: 12
  }
};

function GistDetail(props) {
  const { gist } = props;

  return (
    <Card key={gist.id} style={{ maxHeight: 600, margin: 20 }}>
      <Card.Content
        style={{
          justifyContent: "space-between",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Card.Header>
          <Header as="h5" color="blue" style={{ fontSize: "1.25em" }}>
            {gist.title}
          </Header>
        </Card.Header>

        <Card.Description>
          <Image
            width="100%"
            src={
              gist.image
                ? gist.image.source_url
                : "https://graphgist-portal.herokuapp.com/assets/missing-3de5afa143a851909bf3ab0ac4add47749974608b7b790a2bcb0a2203a53eb92.png"
            }
          />
          {gist.featured && (
            <div className={styles.rows}>
              <div style={{ display: "flex", marginTop: 10 }}>
                <Icon name="fire" />
                <div className={styles.featured}>Featured by Neo Team</div>
              </div>
            </div>
          )}
          {gist.featured && gist.author && <Divider />}
        </Card.Description>
        <Card.Description>
          {gist.author && (
            <div className={styles.rows}>
              <div style={{ display: "flex", marginTop: 10 }}>
                <Icon name="user" />
                <Link to={"people/" + gist.author.slug}>
                  {gist.author.name}
                </Link>
              </div>
            </div>
          )}
          {gist.author && gist.categories[0] && <Divider />}
        </Card.Description>
        <Card.Description>
          {gist.categories[0] && (
            <div className={styles.rows}>
              <div style={{ display: "flex", marginTop: 10 }}>
                <img
                  src={gist.categories[0].image.source_url}
                  alt={gist.categories[0].name}
                  style={{ marginRight: 5, marginTop: 3 }}
                  width={16}
                  height={14}
                />
                <Link to={"use_cases/" + gist.categories[0].slug}>
                  {gist.categories[0].name}
                </Link>
              </div>
            </div>
          )}
          {gist.categories[0] && gist.categories[1] && <Divider />}
        </Card.Description>
        <Card.Description>
          {gist.categories[1] && (
            <div className={styles.rows}>
              <div style={{ display: "flex", marginTop: 10 }}>
                <img
                  src={gist.categories[1].image.source_url}
                  style={{ marginRight: 5, marginTop: 3 }}
                  alt={gist.categories[1].name}
                  width={16}
                  height={14}
                />
                <Link to={"category/" + gist.categories[1].slug}>
                  {gist.categories[1].name}
                </Link>
              </div>
            </div>
          )}
          {gist.categories[1] && gist.categories[2] && <Divider />}
        </Card.Description>
        <Card.Description>
          {gist.categories[2] && (
            <div className={styles.rows}>
              <div style={{ display: "flex", marginTop: 10 }}>
                <Icon name="ellipsis horizontal" />
                More categories
              </div>
            </div>
          )}
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

export default GistDetail;
