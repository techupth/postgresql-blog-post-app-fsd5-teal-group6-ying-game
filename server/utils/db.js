// Creating PostgreSQL Client here
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:138820123@127.0.0.1:5432/post",
});

export { connectionPool };
