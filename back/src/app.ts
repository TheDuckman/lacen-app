import express from "express";
import helmet from "helmet";
import cors from "cors";

import routes from "./routes/routes";
import logger from "./logger";

/* Creates an Express application. */
const app = express();

/* Help secure the Express app with various HTTP headers */
app.use(helmet());

/* CORS middleware */
app.use(cors());

/* Parses urlencoded bodies */
app.use(
  express.urlencoded({
    extended: true, // Parses the URL-encoded data with the qs library.
  }),
);

/* Parses json */
app.use(express.json());

/* Logger */
app.use(logger);

/* Serves static content (images) */
app.use("/static", express.static(process.env.SAVED_FILES_PATH));

/* Routes */
app.use(routes);

export default app;
