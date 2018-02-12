var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var path = require('path');
var fs = require('fs');
var session = require('express-session');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');

exports.boot = function(callback) {
    var app = express();

    var startup = [
        BootApplication,
        BootModels,
        BootControllers
    ];

    function next() {
        var step = startup.shift();

        if(step)
            step(app, next);
        else
            callback(app);
    }

    next();

    return app;
};

// Setup any server configurations
function BootApplication(app, next)
{
    // all environments
    app.set('port', process.env.PORT || 3000);
    app.use("/public", express.static(path.join(__dirname, 'public')));
    app.use('/Views/Templates', express.static(path.join(__dirname, 'Views/Templates')));
    app.set('views',path.join( __dirname, '/Views'));
    app.set('view engine', 'pug');
    app.engine('pug', require('pug').__express);
    app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser('legacybass'));
    app.use(session({ resave: true,
        saveUninitialized: true,
        secret: 'uwotm8' }));

    var env = process.env.NODE_ENV || 'development';
    if ('development' === app.get('env')) {
        app.set('db-uri', 'mongodb://localhost/jeopardy-dev');
        app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    }

    if('production' === app.get('env')) {
        app.set('db-uri', 'mongodb://localhost/jeopardy');
        app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    }

    if('test' === app.get('env')) {
        app.set('db-uri', 'mongodb://localhost/jeopardy-test');
        app.use(errorHandler({ dumpExceptions: true, showStack: true }));
    }

    next();
}

// Load the controllers into the routing domain
function BootControllers(app, next)
{
    // routing
    var homeController = require('./Controllers/HomeController').default;
    var apiController = require('./Controllers/ApiController').default;

    apiController(app);
    homeController(app);

    next();
}

// Load the models into the mongoose framework
function BootModels(app, next)
{
    fs.readdir('./Schemas', function(err, files)
    {
        if(err)
            throw err;

        files.forEach(function(file)
        {
            var name = file.replace(".js", ""),
                schema = require("./Schemas/" + name);
            mongoose.model(name, schema);
        });

        mongoose.connect(app.get('db-uri'));
        var db = mongoose.connection;
        db.on('error', function() {
            var message = ['connection error:'];
            Array.prototype.map.call(arguments, function(item) { message.push(item); });
            console.error.apply(console, message);
        });
        db.once('open', function()
        {
            next();
        });
    });
}

// Load the socket configurations and handlers
function BootSockets(server)
{
    require('./Controllers/SocketController').default(server);
}

var app = exports.boot(function(app) {
    var server = http.createServer(app);
    server.listen(app.get('port'), function(){
        console.log('Express server listening on port %d.', app.get('port'));
    });
    BootSockets(server);
});
