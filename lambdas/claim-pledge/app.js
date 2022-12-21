// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const mysql = require('mysql');

var config = require('./config.json');
var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

// https://www.freecodecamp.org/news/javascript-promise-tutorial-how-to-resolve-or-reject-promises-in-js/#:~:text=Here%20is%20an%20example%20of,message%20Something%20is%20not%20right!%20.
function query(conx, sql, params) {
    return new Promise((resolve, reject) => {
        conx.query(sql, params, function(err, rows) {
            if (err) {
                // reject because there was an error
                reject(err);
            } else {
                // resolve because we have result(s) from the query. it may be an empty rowset or contain multiple values
                resolve(rows);
            }
        });
    });
}


// Take in as input a payload.
//
// {  body: '{    "name" : "abc",   "value" : "8"}'
//
// }
//
// ===>  { "result" : "SUCCESS"}
//
exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

   // ready to go for CORS. To make this a completed HTTP response, you only need to add a statusCode and a body.
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*", // Allow from anywhere
            "Access-Control-Allow-Methods": "POST" // Allow POST request
        }
    }; // response


    let actual_event = event.body;
    let info = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2

    // get raw value or, if a string, then get from database if exists.
    let CheckExistence = (pledgeId) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Pledges WHERE id=?", [pledgeId], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length == 1)) {
                    return resolve(rows);   // TRUE if does exist
                } else { 
                    return resolve(false);   // FALSE if doesn't exist
                }
            });
        });
    };
    
    let GetPledges = (projectName) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Pledges WHERE projectName=?", [projectName], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length >- 1)) {
                    return resolve(rows);
                } else {
                    return resolve(false);
                }
            });
        });
    };
    
    let GetProject = (projectName) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Projects WHERE name=?", [projectName], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length == 1)) {
                    return resolve(rows);
                } else {
                    return resolve(false);
                }
            });
        });
    };
    
    let UpdateRaised = (newRaised, projectName) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Projects SET currRaised=? WHERE name=?", [newRaised, projectName], (error, rows) => {
                if (error) { return reject(error); }
                if (rows) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
    };
    
    let UpdateSupporters = (newSupporters, pledgeId) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Pledges SET currSupporters=? WHERE id=?", [newSupporters, pledgeId], (error, rows) => {
                if (error) { return reject(error); }
                console.log(rows);
                if (rows) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
    };
    
    let InsertPledgeSupport = (pledgeId, projectName, email, amount) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO PledgeSupports (id,project,supporterEmail,amount) VALUES(?,?,?,?)", [pledgeId, projectName, email, amount], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length == 1)) {
                    return resolve(true);
                } else {
                    return resolve(true);
                }
            });
        });
    };
    
    try {
        // 1. Query RDS for the first constant value to see if it exists!
        //   1.1. If doesn't exist then ADD
        //   1.2  If it DOES exist, then I need to replace
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
        let pledge = await CheckExistence(info.id);
        if (pledge) {
            let projectName = pledge[0].projectName;
            let newSupporters = pledge[0].currSupporters + 1;
            let updatedSupp = await UpdateSupporters(newSupporters, info.id);
            if (updatedSupp) {
                let project = await GetProject(projectName);
                if (project) {
                    let newRaised = parseInt(info.amount, 10) + project[0].currRaised;
                    let updatedRaised = await UpdateRaised(newRaised, projectName);
                    if (updatedRaised) {
                        let inserted = await InsertPledgeSupport(info.id, projectName, info.email, info.amount);
                        if (inserted) {
                            response.statusCode = 200;
                            response.pledges = await GetPledges(projectName);
                            response.details = await GetProject(projectName);
                        } else {
                            response.statusCode = 400;
                            response.error = "Couldn't insert " + info.email + " into PledgeSupports.";
                        }
                    } else {
                        response.statusCode = 400;
                        response.error = "Couldn't update current amount raised.";
                    }
                } else {
                    response.statusCode = 400;
                    response.error = "Project couldn't be found.";
                }
            } else {
                response.statusCode = 400;
                response.error = "Couldn't update current supporter count.";
            }
        }
        
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}
