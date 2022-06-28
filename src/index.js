const express = require("express");
const bodyParser = require("body-parser");
const route = require("./Routes/route.js");
const { default: mongoose } = require("mongoose");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(
    //Database name: "group-75-Database"
    "mongodb+srv://Vikas:pAeAi3B.8Rhcfa2@cluster0.tnyfk.mongodb.net/`group-75-Database",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("Your MongoDb is connected."))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
