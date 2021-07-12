const fs = require('fs')
const ospath = require('path')
const fetch = require('node-fetch')

const graphGistHost = 'https://graphgist-v3-api.herokuapp.com/graphql'

const sendRequest = function (data) {
  return fetch(graphGistHost, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  }).then(res => res.json())
}

/**
 * Get all GraphGists with the status live.
 * @returns {Promise<Object>}
 */
const getLiveGraphGists = async function () {
  const response = await sendRequest({
    query: `{
  GraphGist (status: live) {
    slug asciidoc
  }
}`,
  })
  return response.data.GraphGist
}

const root = ospath.join(__dirname, '..')

;(async () => {
  try {
    const graphGists = await getLiveGraphGists()
    for (const graphGist of graphGists) {
      fs.writeFileSync(ospath.join(root, 'build', `${graphGist.slug}.adoc`), graphGist.asciidoc, 'utf-8')
    }
  } catch (err) {
    console.log('Something went wrong while fetching GraphGists from the GraphQL API!', err)
  }
})()
