import { app } from './app.js';

const PORT = process.env.PORT || 8090;

app.listen(PORT, () => {
  console.log(`MediDash backend listening on port ${PORT}`);
});
