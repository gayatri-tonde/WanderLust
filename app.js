const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;

main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.get("testListing", (res, req) => {
  console.log("");
});

app.get("/", () => {
  console.log("server working");
});

app.listen(port, () => {
  console.log("listening on port 8080");
});
