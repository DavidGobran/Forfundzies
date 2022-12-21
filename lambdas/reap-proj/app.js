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
            }
            else {
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


    // let actual_event = event.body;
    // let info = JSON.parse(actual_event);
    // console.log("info:" + JSON.stringify(info)); //  info.arg1 and info.arg2

    // get raw value or, if a string, then get from database if exists


    let checkSuccess = () => {

        return new Promise((resolve, reject) => {
            pool.query("UPDATE Projects SET success=true WHERE deadline < Current_Date() && currRaised >= goal && active=1 ", (error, result) => {
                console.log(result);
                if (error) { return reject(error); }
                if ((result) && (result.changedRows == 1)) {
                    return resolve(true); // TRUE if was able to add
                }
                else {
                    return resolve(false); // REJECT if couldn't add  WAIT TO CHECK
                }
            });
        });

    }


    let checkFailures = () => {

        return new Promise((resolve, reject) => {
            pool.query("UPDATE Projects SET failure=true WHERE deadline < Current_Date() && currRaised <= goal && active=1", (error, result) => {
                console.log(result);
                if (error) { return reject(error); }
                if ((result) && (result.changedRows > 0 )) {
                    return resolve(result.changedRows); // TRUE if was able to add
                }
                else {
                    return resolve(0); // REJECT if couldn't add  WAIT TO CHECK
                }
            });
        });

    }


    let getFailures = () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Projects WHERE failure=1 && refunded !=TRUE ", (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length >= 1)) {
                    return resolve(rows); // TRUE if does exist
                }
                else {
                    return resolve([]); //
                }
            });
        });
    }

    let getPledges = (project) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM PledgeSupports WHERE project=? ", [project], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length >= 1)) {
                    return resolve(rows); // TRUE if does exist
                }
                else {
                    return resolve([]); // 
                }
            });
        });
    }


    let getSupporterBalance = (email) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Supporters WHERE email=?", [email], (error, rows) => {
                if (error) {
                    return reject(error)
                }
                if (rows && rows.length == 1) {
                    return resolve(rows)
                }
                else {
                    return resolve(false)
                }
            })
        })
    }

    let getRefund = (email, balance, amount) => {

        return new Promise((resolve, reject) => {
            pool.query("UPDATE Supporters SET balance=? WHERE email=?", [balance + amount, email], (error, result) => {
                console.log(result);
                if (error) { return reject(error); }
                if ((result) && (result.changedRows == 1)) {
                    return resolve(true); // TRUE if was able to add
                }
                else {
                    return resolve(false); // REJECT if couldn't add  WAIT TO CHECK
                }
            });
        });

    }
    
    let getDirect = (projectName) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM DirectSupports WHERE projectName=? ", [projectName], (error, rows) => {
                if (error) { return reject(error); }
                if ((rows) && (rows.length >= 1)) {
                    return resolve(rows); // TRUE if does exist
                }
                else {
                    return resolve([]); // 
                }
            });
        });
    }
    
    let refunded = (name) => { 
        
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Projects SET refunded=TRUE WHERE name=?", [name], (error, result) => {
                console.log(result);
                if (error) { return reject(error); }
                if ((result) && (result.changedRows == 1)) {
                    return resolve(true); // TRUE if was able to add
                }
                else {
                    return resolve(false); // REJECT if couldn't add  WAIT TO CHECK
                }
            });
        });
        
    } 
     



    try {

        //checks and updates successful projects
        await checkSuccess();

        //checks and updates failed projects 
        const failedProjects = await checkFailures();

       
        //if failedProject then must do more in order to return funds 
        if (failedProjects > 0) {
            let projects = await getFailures()
            console.table(projects)
            for (let project of projects) { 
                let projectName = project.name
                console.log(projectName)
                let pledges = await getPledges(projectName);
                    console.table(pledges)
                    //if projects with that name exist you must do more to find pledge amount, frequency and record email
                    if (pledges) { 
                        
                        for (let ind of pledges) { 
                            console.table(ind)
                            let email = ind.supporterEmail
                            console.log(email)
                            let amount = ind.amount
                            console.log(amount)
                            let supporters = await getSupporterBalance(email)
                            console.table(supporters)
                            let refund = await getRefund(email, supporters[0].balance, amount)
                            console.log(refund)
                            response.refund = refund 
                        }
                    }
                    
                let direct = await getDirect(projectName);
                    if (direct) { 
                    for (let ind of direct) { 
                        console.table(ind)
                        let email = ind.supporterEmail
                        console.log(email)
                        let amount = ind.amount
                        console.log(amount)
                        let supporters = await getSupporterBalance(email)
                        console.table(supporters)
                        let refund = await getRefund(email, supporters[0].balance, amount)
                        console.log(refund)
                        response.statusCode = 200;
                        response.refund = refund 
                    }
                    }
                     await refunded(projectName)
                     response.statusCode = 200;
                     
                    
                    //let ind = pledges.forEach(element => loopPledges(element));
                } 
                
            }
        else
        {
            console.log("no fa")
        }


    }
    catch (error) {
        console.log("ERROR: " + error);
        response.statusCode = 400;
        response.error = error.toString();
    }

    // full response is the final thing to send back
    return response;
}