import dotenv from "dotenv";

(async function() {
  dotenv.config();
  const temp = require("neo4j-temp-db");

  const session = temp.neo4j_system_driver.session({ database: "system" });
  const result = await session.run("SHOW DATABASES");
  console.log("Total DBs: ", result.records.length);
  // await temp.removeDatabasesOlderThan(60 * 60 * 24); // 24h
  await temp.neo4j_system_driver.close();
  process.exit();
})();
