import { app } from './app.js';
import { PORT } from './util/config.js';
import { connectToDatabase } from './util/db.js';

const main = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
};

void main();
