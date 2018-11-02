
import * as express from 'express';

const app: express.Application = express();
const port = 3000;

app.get('/', (request, response) => {
  response.send('ITS WORKING, ITS WORKING');
});

const server = app.listen(port, () => {
  console.log(
    "  App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});