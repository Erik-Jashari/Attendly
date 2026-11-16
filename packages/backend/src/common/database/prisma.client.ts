import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from '../config/env.js';

/**
 * Singleton (design pattern): one PrismaClient (and one connection pool) for the whole app.
 * Only classes in the `data` layer may import this.
 */
export class Database {
  private static instance: PrismaClient | undefined;

  private constructor() {}

  static getClient(): PrismaClient {
    if (!Database.instance) {
      const adapter = new PrismaPg({ connectionString: env.databaseUrl });
      Database.instance = new PrismaClient({ adapter });
    }
    return Database.instance;
  }

  static async disconnect(): Promise<void> {
    await Database.instance?.$disconnect();
    Database.instance = undefined;
  }
}
