const express = require("express");
const app = express();
const indexRouters = require("./routes/index");
app.set("view engine", "ejs");
app.use("/", indexRouters);
app.listen(3000, () => {
  console.log("Server running on port 3000。。。");
});
