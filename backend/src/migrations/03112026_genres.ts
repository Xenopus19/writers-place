import { DataTypes, type QueryInterface } from 'sequelize';

const GENRES = [
  'Fiction',
  'Drama',
  'Culture',
  'Essay',
  'Technology',
  'Design',
  'Poetry',
  'Science',
  'History',
  'Opinion',
];

export const up = async ({
  context: queryInterface,
}: {
  context: QueryInterface;
}) => {
  await queryInterface.createTable('genres', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: queryInterface.sequelize.literal('gen_random_uuid()'),
    },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  });

  const values = GENRES.map((name) => `('${name}')`).join(', ');
  await queryInterface.sequelize.query(
    `INSERT INTO genres (name) VALUES ${values}`
  );

  await queryInterface.createTable('article_genres', {
    article_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'articles', key: 'id' },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    genre_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'genres', key: 'id' },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
  });
};

export const down = async ({
  context: queryInterface,
}: {
  context: QueryInterface;
}) => {
  await queryInterface.dropTable('article_genres');
  await queryInterface.dropTable('genres');
};
