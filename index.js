const server = require('live-server');
var options = {
    port: 8080,
    host: "0.0.0.0",
    root: "",
    open: true,
    ignore: 'scss',
    file: "index.html",
    wait: 1000,
    mount: [['/components', '/node_module']],
    logLevel: 2,
    middleware: [function(req, res, next) { next(); }]
};
server.start(options);