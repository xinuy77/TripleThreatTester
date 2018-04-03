# TripleThreat Testing Framework
- 3008 Project Part 2.3
- Node.js (v 8.0.0) required
- MongoDB (v 3.4.11) required
- **If you have .pem, change paths in options at line 23**
- **If you don't have .pem, follow steps below**

```
// change port number
const PORT = process.env.PORT || 3000; // line 15

// Comment out options
/*
var options = {   // line 23
  key: fs.readFileSync( './privkey.pem' ),
  cert: fs.readFileSync( './cert.pem' )
};
*/

// comment out https.createServer at line 238
// https.createServer(options, app).listen(PORT, start);

// uncomment line 235
app.listen(PORT, start); 
```

## Usage

```
// install dependencies
$ npm install

// start app
$ node app.js
```
