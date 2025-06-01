require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const urlparser = require("url");
const dns = require("dns");
const md5 = require("js-md5");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const urls = [];

app.post("/api/shorturl", (req, res) => {
  const dnslookup = dns.lookup(
    urlparser.parse(req.body.url).hostname,
    (err, address) => {
      if (!address) {
        res.json({ error: "invalid url" });
        return;
      }

      const url = urls.find((url) => url.original_url === address);
      if (url) {
        res.json(url);
        return;
      }

      const shortUrl = md5.create().update(req.body.url).hex();
      const newUrl = { original_url: req.body.url, short_url: shortUrl };
      urls.push(newUrl);
      res.json(newUrl);
    }
  );
});

app.get("/api/shorturl/:url", (req, res) => {
  const url = urls.find((url) => url.short_url === req.params.url);
  if (url) {
    res.redirect(url.original_url);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
