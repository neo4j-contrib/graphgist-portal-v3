export async function getGraphGistByUUID(txc, uuid) {
  const result = await txc.run(`MATCH (g:GraphGist) WHERE g.uuid = $uuid RETURN g`, { uuid });

  if (result.records.length >= 1) {
    return result.records[0].get('g').properties;
  }
}
