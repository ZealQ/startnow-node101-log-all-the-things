// calming my constse

const express = require('express');
const fs = require('fs');
const app = express();
const dateFormat = require("dateformat");
var obj = {};
let totalLogs = [];

// app.use will use my array obj
// obj has the info pulled from server activity
// server activity was pulled  useing console log req and res

app.use((req, res, next) => {
    // all obj in array except time and status need the req status needs the res from a reponce from the server code

    obj = [
        // used regex to replace camma in globle likes with empty spaces

        req.headers["user-agent"].replace(/,/g, ''),

        // to get date and in ios form to appear logs

        new Date().toISOString(),
        req.method,
        req.originalUrl,
        "HTTP/" + req.httpVersion,
        res.statusCode
    ].join(',');

    // fs(file system) is what is used to creat a custome web log
    // appending file to new created file(los.csv) 

    fs.appendFile("./server/log.csv", "\n" + obj, function (err) {
        if (err) throw (err);
        next();
    });
});

// a request to root server
app.get('/', (req, res) => {
    res.status(200).send("ok");
    console.log(obj);
});
// a request for a single log to the log server
app.get('/log', (req, res) => {
    res.status(200).send(obj);

});
// a request to the  server of logs 
// importent to have utf-8 as  it is neede to return text
app.get('/logs', (req, res, ) => { console.log('inside /logs');
    fs.readFile("./server/log.csv", 'utf-8', function (err, data) { console.log('reading file')
        if (err) throw (err);

        // declering my rows and waht will be done to them
        var rows = data.split('\n');

        // an if statment for the rows and the length of them the length bing no grater then 20
        if (rows.length > 20) {
            // decaring my now as this will be  what will allow the logs to incears with out repeating same number it will add by one
            let now = dateFormat(new Date(), "yyyy_mm_dd_HH_MM_ss");

            // total logs my array will push the now var and pull log info
            totalLogs.push(now);
            // fs is copying my serve logs info from log.csv 
            fs.copyFileSync("./server/log.csv", "./logs/logs_" + totalLogs[totalLogs.length - 1] + ".csv");
            // fs is  witing the info it copyed to a new file with key values
            fs.writeFileSync("./server/log.csv", "Agent, Time, Method, Resource, Version, Status");
            if (totalLogs.length >= 5) {
                let logToDelete = totalLogs.shift();
                //once the array reaches it max of  20 it will then unlink and start a new file
                fs.unlink("./logs/logs_" + logToDelete + ".csv", function (err) {
                    if (err) throw (err);

                });

                // the header with its key values
                var headers = rows.shift().split(",");

                // pObj my array 
                var poObj = [];
                // returning as a json with key vaules
                rows.forEach(function (item) {
                    var row = item.split(',');
                    var obj = {
                        Agent: row[0],
                        Time: row[1],
                        Method: row[2],
                        Resource: row[3],
                        Version: row[4],
                        Status: row[5]
                    };
                    // pushing the obj array in to the new array of pObj
                    pObj.push(obj);


                });
                // reponding with a 200 and sending the new pObj array
                res.status(200).send(pObj);

            }
        }
    });


});

module.exports = app;

