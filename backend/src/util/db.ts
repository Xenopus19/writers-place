import { Sequelize } from 'sequelize'

import { Umzug, SequelizeStorage } from 'umzug'
import { DATABASE_URL } from './config.js'

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
})

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    await runMigrations()
    console.log('Database connected and migrations ran successfully');
  } catch (error) {
    console.error('Failed to connect to the database or run migrations:', error);
    return process.exit(1)
  }
}

export const runMigrations = async () => {
  const migrator = new Umzug({
    migrations: {
      glob: 'src/migrations/*.ts',
      resolve: ({ name, path, context }) => {
        return {
          name,
          up: async () => {
            const migration = await import(`file://${path}`);
            return migration.up({ context });
          },
          down: async () => {
            const migration = await import(`file://${path}`);
            return migration.down({ context });
          },
        };
      },
    },
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    context: sequelize.getQueryInterface(),
    logger: console,
  })
  
  await migrator.up()
}