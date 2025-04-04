const express = require('express');

const app = express();

const http = require('http');

const fs = require('fs');

const port = 3000;

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);

  res.setHeader('Content-Type', 'text/html');

  let path = './public';

  fs.readFile('./public/index.html', (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.end(data);
    }
  });
});

server.listen(3000, 'localhost', () =>
  console.log('listening for requests on port 3000')
);
