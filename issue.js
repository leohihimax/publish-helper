var config = require('./config');
var http = require('http');

module.exports = function(page, issues, callback) {
    var opt = {
        host: config.host,
        port: "80",
        path: "/api/v3/projects/ustack%2F" + config.project +"/issues?per_page=100&page=" + page ,
        method: "GET",
        headers: {
            "PRIVATE-TOKEN": config.private_token
        }
    };
    var req = http.request(opt, function(res) {
        res.setEncoding('utf8');
        var total_issues = '';
        res.on('data', function(chunk) {
            total_issues += chunk;
        });
        res.on('end', function() {
            total_issues = JSON.parse(total_issues);
            issues = issues.concat(total_issues);
            var link = res.headers.link;
            if (link.indexOf('next') != -1) {
                return getIssue(page+1, issues, callback);
            } else {
                callback(issues);
            }
        });
    });
    req.on('error', function(e) {
        console.log(e.message);
    });
    req.end();
}