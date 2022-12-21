import { instance } from "../App";

export const register = (e, userRole, designer, supporter, loggedIn, redraw, forceRedraw) => {
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let name = document.getElementById("name");

    let msg = {};
    msg["email"] = email.value;
    msg["password"] = password.value;
    msg["role"] = userRole.toLowerCase();
    if (userRole === "Designer") {
        msg["name"] = name.value;
    }
    let value = JSON.stringify(msg);
    let data = { "body": value };

    if (userRole === "Supporter") {
        instance.post('/register-supporter', data)
            .then(function (response) {
                console.log(response);
                if (response.data.statusCode === 200) {
                    supporter = document.getElementById("email").value;
                    loggedIn = userRole.toLowerCase();
                }
                email.value = '';
                password.value = '';
                forceRedraw(redraw + 1);
            })
            .catch(function (error) {
                console.log(error);
            })
    } else {
        instance.post('/register-designer', data)
            .then(function (response) {
                console.log(response);
                if (response.data.statusCode === 200) {
                    designer = document.getElementById("email").value;
                    loggedIn = userRole.toLowerCase();
                }
                email.value = '';
                password.value = '';
                if (userRole === "Designer") {
                    name.value = '';
                }
                forceRedraw(redraw + 1);
            })
            .catch(function (error) {
                console.log(error);
            })
    }
}