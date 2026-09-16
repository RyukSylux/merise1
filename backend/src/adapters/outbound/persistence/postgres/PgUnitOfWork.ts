import { pool } from "./PgConnectionPool.js";
import { IUnitOfWork } from "../../../../domain/ports/outbound/IUnitOfWork.js";

export class PgUnitOfWork implements IUnitOfWork {
  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await operation();
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
