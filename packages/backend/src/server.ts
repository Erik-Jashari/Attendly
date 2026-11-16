import { createApp } from './app.js';
import { env } from './common/config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Attendly API listening on http://localhost:${env.port}`);
});
