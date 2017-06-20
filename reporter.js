/**
 * Additions for writing files borrowed/inspired by gulp-jshint-xml-file-reporter
 * https://github.com/lourenzo/gulp-jshint-xml-file-reporter
 */

'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

function reset() {
    exports.out = [];
    exports.opts = {};
}
reset();

/**
 * Creates the output dir
 * @param {String} filePath
 * @param cb
 */
function createDirectory(filePath, cb) {
    var dirname = path.dirname(filePath);

    mkdirp(dirname, function (err) {
        if (!err) {
            cb();
        } else {
            console.error('Error creating directory: ', err);
        }
    });
}

function formatIssue(result, resultsByfiles) {
    var output = "";
    output = '\t<issue';
    if (result.severity === 'error') {
        output += ' severity="error"';
    } else {
        output += ' severity="warning"';
    }
    if (result.line) {
        output += ' line="' + result.line + '"';
    }
    if (result.column) {
        output += ' char="' + result.column + '"';
    }

    output += ' reason="' + result.linter + ': ' + result.message.replace(/"/g, '&quot;') + '"';
    output += ' />\n';
    return output
}

exports.report = function (results) {
    var resultsByfiles = {};
    var output = '';
    var ret = '';

    results.forEach(function (result) {
        if (resultsByfiles[result.file] === undefined) {
            resultsByfiles[result.file] = '';
        }
        resultsByfiles[result.fullPath] += formatIssue(result);
    });

    ret += '<?xml version="1.0" encoding="utf-8"?><lint>';

    Object.keys(resultsByfiles).forEach(function (file) {
        ret += '<file name="' + file + '">';
        ret += resultsByfiles[file];
        ret += '</file>';
    });

    ret += '</lint>';
    exports.out.push(ret);
};

exports.writeFile = function (opts) {
    opts = opts || {};
    opts.filePath = opts.filePath || 'lesslint.xml';
    return function () {
        createDirectory(opts.filePath, function () {
            var outStream = fs.createWriteStream(opts.filePath);
            outStream.write(exports.out[0]);
            reset();
        });
    };
};
