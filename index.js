// import module `cors`, `body-parser`, `path`, `cookie-parser`, `express`
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require('cookie-parser');
const express = require("express");
require("dotenv").config();

const app = express();

// MIDDLEWARES
if(process.env.ENV && process.env.ENV === "development") 
  app.use(require("morgan")("tiny"));

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
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(bodyParser.json({ limit: "50mb" }))
app.use(cookieParser());

const db = require('./models/database');
db.connect(process.env.MONGODB_URL);

// import module `routes` from `./routes/routes.js`
const routes = require("./routes/api.js");

// define the paths contained in `./routes/routes.js`
app.use("/api", routes);

// set the folder `public` as folder containing static assets
// such as css, js, and image files
app.use(express.static(path.resolve(__dirname, "./build")));

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

const port = process.env.PORT;

app.listen(port, () => console.debug("app listening at port " + port));