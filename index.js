#!/usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
var getIssue = require('./issue');

var selected_issue = [];

exec('git log `git describe --tags --abbrev=0`..HEAD --oneline --format=%s --grep=# > commit.txt',{cwd: process.cwd()}, function(error, stdout, stderr) {
    if (error) {
        console.log(error);
    }
    fs.readFile(process.cwd() + '/commit.txt', function(error, data) {
        if(error) {
            throw error;
        }
        var lines = data.toString().split('\n');
        var issueNumber = [];
        var pattern = /#[\d+]/;
        lines.forEach(function(message) {
            for (var i = 0; i < message.length; i++) {
                if (message.charAt(i) == '#') {
                    var j = i;
                    while (message.charAt(i+1).match(/\d/)) {
                        i++;
                    }
                    if (j != i) {
                        var num = parseInt(message.substring(j+1, i+1));
                        if (issueNumber.indexOf(num) == -1) {
                            issueNumber.push(num);
                        }
                    }
                }
            }
        });
        issueNumber.sort();
        var page = 1,
              issues = [],
              selected_issue = [];
        getIssue(page, issues, function(data) {
            issueNumber.forEach(function(iid) {
                data.some(function(issue) {
                    if (issue.iid == iid) {
                        selected_issue.push({
                            "title": issue.title,
                            "description": issue.description
                        });
                        fs.appendFile(process.cwd() + '/commit.txt', issue.title + '\n', function(err) {
                            if (err) {
                                throw err;
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
            });
            selected_issue.forEach(function(el) {
                fs.appendFile(process.cwd() + '/commit.txt', '\n' + el.title + '\n' + el.description + '\n', function(err) {
                    if (err) {
                        throw err;
                    }
                });
            });
            console.log("The issues' info are written in file ----'commit.txt' successfully.");
        });
    });
});


