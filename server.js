var express = require('express')
var path = require('path');
var dotenv = require('dotenv')
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const connectDB = require('./config/db')
const morgan = require('morgan')
const https = require('https')
const fs = require('fs')
const bcrypt = require('bcryptjs')

dotenv.config({ path: './config/config.env' }) //load config file

const app = express();
const PORT = process.env.PORT || 3000;

//db connection
connectDB()
    // This is to enable cross-origin access
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


//setting view engine
//app.set("view engine", "pug")
//app.set('views', path.join(__dirname, 'views'))
//app.set('views', path.join(__dirname, 'views/patient'))

app.use(express.static(__dirname + '/public'));

//loading assets
app.use("/css", express.static(path.resolve(__dirname, "public/css")))
app.use("/img", express.static(path.resolve(__dirname, "public/img")))
app.use("/js", express.static(path.resolve(__dirname, "public/js")))
app.use("/patient", express.static(path.resolve(__dirname, "public/patient")))

//loading routers
app.use('/', require('./routes/index'));
app.use('/api/patient', require('./routes/patient'));
app.use('/api/physician', require('./routes/physician'));
app.use('/patient', require('./routes/patient'));
app.use('/physician', require('./routes/physician'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500)
    res.render('error')
});

//creates the https server
const sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'certificate', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certificate', 'cert.pem'))
}, app)
sslServer.listen(PORT), () => { console.log('server running') };
//app.listen(PORT), () => { console.log('server running') };