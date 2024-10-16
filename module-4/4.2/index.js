const express = require('express');

const app = express();

const port = 3000;

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(
    '<h1>Hello, world!</h1><p>This is hello world with content-type HTML header.</p>'
  );
});

app.listen(port, function () {
  console.log('server started at <http://localhost:' + port);
});
