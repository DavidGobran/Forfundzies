import { instance, adminPassword } from "../App";

export const reap = (e, forceRedraw, redraw) => {
    let data = {}
    instance.post('/reap', data)
        .then(function (response) {
            console.log('Reap: ' + response.data.statusCode)
            // forceRedraw(redraw + 1)
            alert('Projects have been reaped 💀')
        })
        .catch(function (error) {
            console.log(error);
        })
}

export const listAdmin = (setAdminList) => {
    let msg = {}
    msg["password"] = adminPassword;
    let data = { 'body': JSON.stringify(msg) }

    instance.post('/list-admin', data).then((response) => {
        console.log('List admin: ' + response.data.statusCode)
        let projects = response.data.result
        console.table(projects)
        projects ? setAdminList({ projs: projects }) : setAdminList({ projs: [] })
    }).catch((error) => {
        console.log(error)
    })
}

export const deleteAdmin = (e, setAdminList) => {
    let project = document.getElementById("list-admin").value
    if (project === 'default') {
        return
    }
    let msg = {}
    msg["name"] = project
    let data = { 'body': JSON.stringify(msg) }
    instance.post('/delete-proj', data)
        .then(function (response) {
            console.log('Delete project: ' + response.data.statusCode)
            listAdmin(setAdminList)
        }
        )
        .catch(function (error) {
            console.log(error);
        }
        )
}

export const sumFunds = (projects) => {
    let total = 0
    if (projects) {
        projects.forEach((p) => {
            total += p.currRaised
        })
        return `$${total}`
    }
    return '$0'
}