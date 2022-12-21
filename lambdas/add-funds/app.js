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
// {  body: '{    "name" : "project-name"  }'
//
// }
//
// ===>  { "pledges" : PLEDGE-LIST, "details": story", "genre", "goal", "deadline" }
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
    let checkBalance = (name) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Supporters WHERE email=?", [name], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length >= 1)) {
                    return resolve(rows);   // TRUE if does exist
                } else { 
                    return resolve(false);   // FALSE if doesn't exist
                }
            });
        });
    }
    
    let updateBalance = (newBalance, name) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Supporters SET balance=? WHERE email=?", [newBalance, name], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length >= 1)) {
                    return resolve(rows);   // TRUE if does exist
                } else { 
                    return resolve(false);   // FALSE if doesn't exist
                }
            });
        });
    }

    try {
        let balance = await checkBalance(info.email)
        if(balance){
            let newBalance = parseInt(info.amount, 10) + balance[0].balance
            await updateBalance(newBalance, info.email)
            let newAccInfo = await checkBalance(info.email)
            response.statusCode = 200
            response.accountDetails = newAccInfo
            response.balance = newBalance;
        } else {
            response.statusCode = 400
            response.error = "Unable to locate balance"
        }
   
        
    } catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error.toString();
    }
    
    // full response is the final thing to send back
    return response;
}