import { instance } from "../App";

export const login = (e, userRole, designer, adminPassword, supporter, balance, loggedIn, redraw, forceRedraw) => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let name = document.getElementById("name");

    let msg = {};
    msg["email"] = (userRole === "Admin") ? "" : email.value;
    msg["password"] = password.value;
    msg["role"] = userRole.toLowerCase();
    let value = JSON.stringify(msg);
    let data = { "body": value };

    instance.post('/login', data)
        .then(function (response) {
            console.log(response);
            if (response.data.statusCode === 200) {
                if (userRole === "Designer") {
                    designer = document.getElementById("email").value;
                }
                if (userRole === "Admin") {
                    adminPassword = password.value;
                }
                if (userRole === "Supporter") {
                    supporter = document.getElementById("email").value;
                    balance = response.data.balance;
                }
                loggedIn = userRole.toLowerCase();
            }
            if (userRole !== "Admin") {
                email.value = '';
                if (userRole === "Designer") {
                    name.value = '';
                }
            }

            password.value = '';
            forceRedraw(redraw + 1);
        })
        .catch(function (error) {
            console.log(error);
        })
}