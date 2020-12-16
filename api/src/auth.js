import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import dotenv from "dotenv";
dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;

const client = jwksClient({
  jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, function (err, key) {
    if (key) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      cb(null, signingKey);
    }
  });
}

const options = {
  audience: AUTH0_CLIENT_ID,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
};

export function auth0Verify(token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      resolve(null);
    } else {
      jwt.verify(token, getKey, options, (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      });
    }
  });
}

export async function getUser(driver, req) {
  const session = driver.session();
  const txc = session.beginTransaction();

  try {
    const user = await auth0Verify(req.headers.authorization?null:req.headers.authorization);

    if (!user) {
      return null;
    }

    const [provider, uid] = user.sub.split("|");

    const result = await txc.run(
      `MATCH (u:User) WHERE (u.provider = $provider AND u.uid = $uid) OR u.uid = '${provider}|${uid}' OR u.email = $email RETURN u`,
      {
        provider,
        uid,
        email: user.email,
      }
    );

    if (result.records.length >= 1) {
      await txc.commit();
      return result.records[0].get("u").properties;
    }
  } catch (error) {
    console.error(error);
    await txc.rollback();
    throw error;
  } finally {
    await session.close();
  }

  return null;
}
