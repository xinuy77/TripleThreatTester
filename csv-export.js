var csv_export   = require('csv-export');
var fs           = require('fs');

function exportCSV(data, callback) {
    csv_export.export(data, function(buffer) {
        fs.writeFileSync('./log.zip', buffer);
        callback();
    });
};

module.exports = exportCSV;
