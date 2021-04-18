const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const passport = require("passport");
const compress = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const methodOverride = require("method-override");
const rateLimiter = require("../middleware/rateLimiter");

const { ErrorHandler, ConvertError, NotFound } = require("../middleware/error");
const { logs, morganConfig } = require("./env-vars");
const { Jwt } = require("./passport");

const app = express();

app.use(morgan(logs, morganConfig));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compress());

// PUT | DELETE => In places where the client doesn't support it
app.use(methodOverride());

// Static assets directory setup
app.use(express.static(path.join(__dirname, "../public")));

app.use(helmet());
app.use(cors());
app.use(rateLimiter());

app.use(passport.initialize());
passport.use("jwt", Jwt);

app.use("/api/v1", require("../api/routes"));

app.use(ConvertError);
app.use(NotFound);
app.use(ErrorHandler);

module.exports = app;
