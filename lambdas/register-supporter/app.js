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
    let CheckExistence = (email) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Credentials WHERE email=?", [email], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length == 1)) {
                    return resolve(true);   // TRUE if does exist
                } else { 
                    return resolve(false);   // FALSE if doesn't exist
                }
            });
        });
    }
    
    let insertSupporter = (email, password, role) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO Credentials (email,password,role) VALUES(?,?,?)", [email, password, role], (error, rows) => {
                if (error) { return reject(error); }
                console.log(rows.length);
                console.log(rows);
                if ((rows) && (rows.length == 1)) {
                    return resolve(true);   // TRUE if was able to add
                } else { 
                    return resolve(true);   // REJECT if couldn't add  WAIT TO CHECK
                }
            });
            
            
        });
    }
    
     let insertSupporterTable = (email, balance) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO Supporters (email,balance) VALUES(?,?)", [email, balance], (error, rows) => {
                if (error) { return reject(error); }
                console.log(rows.length);
                console.log(rows);
                if ((rows) && (rows.length == 1)) {
                    return resolve(true);   // TRUE if was able to add
                } else { 
                    return resolve(true);   // REJECT if couldn't add  WAIT TO CHECK
                }
            });
            
            
        });
    }
    
    try {
        
        // 1. Query RDS for the first constant value to see if it exists!
        //   1.1. If doesn't exist then ADD
        //   1.2  If it DOES exist, then I need to replace
        // ----> These have to be done asynchronously in series, and you wait for earlier 
        // ----> request to complete before beginning the next one
        console.log("e1")
        const exists = await CheckExistence(info.email)
        console.log("e2")
        if (!exists) {
            const inserted = await insertSupporter(info.email, info.password, info.role);
            const insertedTable = await insertSupporterTable(info.email, 0);
            if (inserted || insertedTable) {
                response.statusCode = 200;
            } else {
                response.statusCode = 400;
                response.error = "Couldn't insert " + info.email;
            }
        } else {
            response.statusCode = 400;
            response.error = info.email + " already exists.";
        }
        
        
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error;
    }
    
    // full response is the final thing to send back
    return response;
}
