const express = require("express");
const { connectToDB } = require("./config/db");
const config = require("./config/config.json");
const http = require("http");
const userRoutes = require("./routes/users");
const differentialPressureRoutes = require("./routes/differentialPressure");
const tempratureRecordRoutes = require("./routes/tempratureRecords");
const siteRoutes = require("./routes/sites");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoutes);
app.use("/differential-pressure", differentialPressureRoutes);
app.use("/temprature-record", tempratureRecordRoutes);
app.use("/site", siteRoutes);
app.use(express.static(path.join(__dirname, "documents")));

server.listen(config.development.PORT, "0.0.0.0", async () => {
  connectToDB()
    .then(() => {
      console.log("Server is running at port: " + config.development.PORT);
    })
    .catch((e) => {
      console.log("Error in database connection", e);
    });
});
