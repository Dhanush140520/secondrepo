var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require("path");
routesuser = require('./routes/product.route');
superadminroutes = require('./routes/superadmin.route');
memberroutes = require('./routes/member.route');
androidroutes = require('./routes/android.route');

var mysql      = require('mysql');

const app = express();
var http = require('http');
console.log('in app')

app.use(bodyParser.json());
app.use(cors());
// app.use(logger('dev'));
app.use(bodyParser.urlencoded({'extended':'false'}));
// app.use(express.static(path.join(__dirname, 'src/assets')));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/login', express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'President')));
// app.use('presidentimg',express.static(path.join(__dirname, '/presidentimg')));
app.use(express.static(path.join(__dirname, 'dist')));
// app.use('/app/api', apiRoutes);
const port = process.env.PORT || '7000';
var server = http.createServer(app);
server.listen(port, () => console.log(`API running on localhost:${port}`));
app.use('/callapi',routesuser);
// app.use('/pdf',pdfroutes);
app.use('/member',memberroutes);
app.use('/superadmin',superadminroutes);
app.use('/android',androidroutes);

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  next();
});
console.log("dir_name",__dirname);


module.exports = app;
// module.exports=app;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      








