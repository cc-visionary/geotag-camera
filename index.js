// import module `cors`, `body-parser`, `path`, `cookie-parser`, `express`
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require('cookie-parser');
const express = require("express");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());

// set the folder `build` as folder containing static assets
// such as css, js, and image files
app.use(express.static(path.resolve(__dirname, "./build")));

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

const port = process.env.PORT;

app.listen(port, () => console.debug("app listening at port " + port));