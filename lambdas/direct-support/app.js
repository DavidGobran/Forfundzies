let response;
const mysql = require('mysql');

var config = require('./config.json');
var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    let response = {
        headers: {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST"
        }
    };
    
    let actual_event = event.body;
    let info = JSON.parse(actual_event);
    console.log("info:" + JSON.stringify(info));
    
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
    
    let GetSupporter = (email) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM Supporters WHERE email=?", [email], (error, rows) => {
                console.log(JSON.stringify(rows));
                if (error) { return reject(error); }
                if ((rows) && (rows.length == 1)) {
                    return resolve(rows);
                } else {
                    return resolve(false);
                }
            });
        });
    };
    
    let UpdateBalance = (balance, email) => {
        return new Promise((resolve, reject) => {
            pool.query("UPDATE Supporters SET balance=? WHERE email=?", [balance, email], (error, rows) => {
                if (error) { return reject(error); }
                if (rows) {
                    return resolve(true);
                } else {
                    return resolve(false);
                }
            });
        });
    };
    
    let InsertDirectSupport = (email, name, amount) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO DirectSupports (supporterEmail,projectName,amount) VALUES(?,?,?)", [email, name, amount], (error, rows) => {
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
        console.log(info.email);
        let supporter = await GetSupporter(info.email);
        console.log(JSON.stringify(supporter));
        let newBalance = supporter[0].balance - parseInt(info.amount, 10);
        let project = await GetProject(info.name);
        let newRaised = parseInt(info.amount, 10) + project[0].currRaised;
        await UpdateRaised(newRaised, info.name);
        await UpdateBalance(newBalance, info.email);
        await InsertDirectSupport(info.email, info.name, info.amount);
        response.statusCode = 200;
        response.pledges = await GetPledges(info.name);
        response.details = await GetProject(info.name);
    } catch (error) {
        console.log(error);
        response.statusCode = 400;
        response.error = error;
    }
    
    return response;
};