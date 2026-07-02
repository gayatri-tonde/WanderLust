const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 8080;
const Listing = require("./models/listing");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.get("/listing", async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
});

app.get("/listing/new", (req, res) => {
  res.render("new.ejs");
});

app.get("/listing/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

app.get("/", () => {
  console.log("server working");
});

app.listen(port, () => {
  console.log("listening on port 8080");
});
