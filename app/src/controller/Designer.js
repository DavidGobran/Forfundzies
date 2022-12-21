import { designer, instance } from "../App";

export const updateProjects = (setProjectList) => {
    let msg = {}
    msg["designer"] = designer
    let data = { 'body': JSON.stringify(msg) }
    let projects = []
    instance.post('/list-designer', data).then((response) => {
        console.log('List project: ' + response.data.statusCode)
        projects = response.data.result
        console.table(projects)
        if (projects) {
            setProjectList({ projs: projects })
        }
        else {
            setProjectList({ projs: [] })
        }
    }).catch((error) => {
        console.log(error)
    })
}

export const createProject = (e, forceRedraw, redraw, setProjectList, setProjectActive, setCurrentProject, setCurrentPledge) => {
    let name = document.getElementById("project-name")
    let story = document.getElementById("story")
    let genre = document.getElementById("genre")
    let goal = document.getElementById("goal")
    let deadline = document.getElementById("deadline")

    let msg = {}
    msg["name"] = name.value
    msg["designer"] = designer
    msg["story"] = story.value
    msg["genre"] = genre.value
    msg["goal"] = goal.value
    msg["deadline"] = deadline.value
    // TODO
    let value = JSON.stringify(msg)
    let data = { 'body': value }

    instance.post('/create-proj', data)
        .then(function (response) {
            // handle success
            console.log('Create project: ' + response.data.statusCode)
            viewProject(null, name.value, setProjectActive, setCurrentProject, setCurrentPledge)
            // clear inputs
            name.value = ''
            story.value = ''
            genre.value = ''
            goal.value = ''
            deadline.value = ''
            forceRedraw(redraw + 1)
            updateProjects(setProjectList)
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}

export const viewProject = (e, p, setProjectActive, setCurrentProject, setCurrentPledge) => {
    let project = document.getElementById("projects").value
    if (p) {
        project = p // for use with createProject
    }
    if (project !== 'default') {
        setCurrentPledge(null)
    }
    else {
        setCurrentProject(null)
        return
    }
    let msg = {}
    msg["name"] = project
    let data = { 'body': JSON.stringify(msg) }

    let pledgeList = []
    instance.post('/view-proj', data)
        .then(function (response) {
            // handle success
            console.log('View project: ' + response.data.statusCode)
            let projectDetails = response.data.details[0]
            if (projectDetails.active === 1)
                setProjectActive(true)
            else
                setProjectActive(false)
            pledgeList = response.data.pledges
            if (pledgeList)
                setCurrentProject({ details: projectDetails, pledges: pledgeList })
            else
                setCurrentProject({ details: projectDetails, pledges: [] })

        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })

}

export const deleteProject = (e, setCurrentProject, setProjectList) => {
    let project = document.getElementById("projects").value
    let msg = {}
    msg["name"] = project
    let data = { 'body': JSON.stringify(msg) }
    instance.post('/delete-proj', data)
        .then(function (response) {
            console.log('Delete project: ' + response.data.statusCode)
            setCurrentProject(null)
            updateProjects(setProjectList)
        }
        )
        .catch(function (error) {
            // handle error
            console.log(error);
        }
        )
}


export const launchProject = (e, setProjectActive) => {
    let project = document.getElementById("projects").value
    let msg = {}
    msg["name"] = project
    let value = JSON.stringify(msg)
    let data = { 'body': value }
    instance.post('/launch-proj', data)
        .then(function (response) {
            console.log('Launch Project: ' + response.data.statusCode);
            setProjectActive(true)
        })
        .catch(function (error) {
            console.log(error);
        })
}


export const createPledge = (e, forceRedraw, redraw, setProjectActive, setCurrentProject, setCurrentPledge) => {
    let pledge = document.getElementById("pledge-name")
    let project = document.getElementById("projects")
    let description = document.getElementById("description")
    let amount = document.getElementById("amount")
    let maxSupporters = document.getElementById("max-supporters")

    let msg = {}
    msg["pledgeName"] = pledge.value
    msg["projectName"] = project.value
    msg["amount"] = amount.value
    msg["descript"] = description.value
    msg["maxSupporters"] = maxSupporters.value
    msg["currSupporters"] = 0

    let data = { 'body': JSON.stringify(msg) }
    instance.post('/create-pledge', data)
        .then(function (response) {
            // handle success
            console.log('Create pledge: ' + response.data.statusCode);
            pledge.value = ''
            description.value = ''
            amount.value = ''
            maxSupporters.value = ''
            viewProject(null, project.value, setProjectActive, setCurrentProject, setCurrentPledge) // refresh pledge list
            forceRedraw(redraw + 1)
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}


export const viewPledgeDes = (e, setCurrentPledge) => {
    let pledge = document.getElementById("pledge-list").value
    if (pledge === 'default') {
        setCurrentPledge(null)
        return
    }
    let msg = {}
    msg["id"] = pledge
    let data = { 'body': JSON.stringify(msg) }
    instance.post('/view-pledge-supports', data)
        .then(function (response) {
            // handle success
            console.log('View pledge supports: ' + response.data.statusCode)
            let pledgeList = response.data.supporters
            if (pledgeList)
                setCurrentPledge({ pledges: pledgeList })
            else
                setCurrentPledge({ pledges: [] })
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })

}

export const deletePledge = (e, setProjectActive, setCurrentProject, setCurrentPledge) => {
    let pledge = document.getElementById("pledge-list").value
    let project = document.getElementById("projects").value
    let msg = {}
    msg["pledgeID"] = pledge
    msg["projectName"] = project
    let data = { 'body': JSON.stringify(msg) }
    instance.post('/delete-pledge', data)
        .then(function (response) {
            // handle success
            console.log('Delete pledge: ' + response.data.statusCode);
            viewProject(null, project, setProjectActive, setCurrentProject, setCurrentPledge) // refresh pledge list
        }
        )
        .catch(function (error) {
            // handle error
            console.log(error);
        }
        )
}