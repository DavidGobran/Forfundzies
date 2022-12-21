import { instance } from "../App";


export const searchString = (e, setCurrentSearch) => {
    let msg = {}
    msg["story"] = document.getElementById("search-bar").value
    let data = { 'body': JSON.stringify(msg) }
    instance.post('/search-story', data).then((response) => {
        console.log('Search: ' + response.data.statusCode)
        let projects = response.data.projects
        console.table(projects)
        if (projects) {
            let nonReaped = projects.filter((project) => {
                return (!project.failure && !project.success)
            })
            console.table(nonReaped)
            setCurrentSearch({ projects: nonReaped });
        } else {
            setCurrentSearch({});
        }
        document.getElementById("search-bar").value = ''
    }).catch((error) => {
        console.log(error)
    })
}

export const viewProjectSupp = (projectName, supporterState, setCurrentProject) => {
    let project = projectName;
    let msg = {};
    msg["name"] = project;
    supporterState = "view-project-supp";
    let data = { 'body': JSON.stringify(msg) };
    instance.post('/view-proj', data)
        .then(function (response) {
            let projectDetails = response.data.details[0];
            console.log(projectDetails);
            let pledgeList = response.data.pledges;
            console.log(pledgeList);
            setCurrentProject({ details: projectDetails, pledges: pledgeList });
        })
        .catch(function (error) {
            console.log(error);
        })
}

export const viewPledge = (id, supporterState, setCurrentPledge) => {
    let msg = {}
    msg["id"] = id
    supporterState = "view-pledge";
    let data = { 'body': JSON.stringify(msg) }

    instance.post('/view-pledge', data).then((response) => {
        let pledge = response.data.pledges
        setCurrentPledge({ pledge: pledge });
    }).catch((error) => {
        console.log(error)
    })
}

export const claimPledge = (pledgeId, supporter, supporterState, balance, setCurrentProject) => {
    let amount = document.getElementById("pledge-amount").innerHTML;
    console.log(amount);
    let id = pledgeId
    let msg = {};
    msg["amount"] = amount;
    msg["id"] = id;
    msg["email"] = supporter;
    supporterState = "view-project-supp";
    let data = { 'body': JSON.stringify(msg) };
    instance.post('/claim-pledge', data)
        .then(function (response) {
            console.log(response);
            let projectDetails = response.data.details[0];
            let pledgeList = response.data.pledges;
            balance -= amount;
            setCurrentProject({ details: projectDetails, pledges: pledgeList });
        })
        .catch(function (error) {
            console.log(error);
        })
}

export const showAccountInfo = (supporter, supporterState, setSupporterInfo) => {
    let msg = {};
    msg["email"] = supporter;
    supporterState = "view-account";
    let data = { 'body': JSON.stringify(msg) };
    instance.post('/view-supp-activity', data)
        .then(function (response) {
            console.log(response);
            let accountDetails = response.data.suppInfo[0];
            let pledgeSupports = response.data.pledgeSupports;
            let directSupports = response.data.directSupports;

            setSupporterInfo({ accountDetails: accountDetails, pledgeSupports: pledgeSupports, directSupports: directSupports });
        })
        .catch(function (error) {
            console.log(error);
        })
}

export const addFunds = (directSup, pledgeSup, supporter, supporterState, balance, setSupporterInfo) => {
    let amount = document.getElementById("add-amount");
    console.log(amount.value);
    let msg = {};
    msg["email"] = supporter;
    msg["amount"] = amount.value;
    supporterState = "view-account";
    let data = { 'body': JSON.stringify(msg) };
    instance.post('/add-funds', data)
        .then(function (response) {
            console.log(response);
            let newBalance = response.data.balance;
            let accountDetails = response.data.accountDetails[0];
            balance = newBalance;
            setSupporterInfo({ accountDetails: accountDetails, balance: newBalance, pledgeSupports: pledgeSup, directSupports: directSup });
        })
        .catch(function (error) {
            console.log(error);
        })
    document.getElementById("add-amount").value = '';
}

export const searchGenre = (selectedGenre, supporterState, setCurrentSearch) => {
    let msg = {}
    msg["genre"] = selectedGenre
    supporterState = "search-projects";
    let data = { 'body': JSON.stringify(msg) }

    instance.post('/search-proj', data).then((response) => {
        let projects = response.data.projects
        console.table(projects)
        if (projects) {
            let nonReaped = projects.filter((project) => {
                return (!project.failure && !project.success)
            })
            console.table(nonReaped)
            setCurrentSearch({ projects: nonReaped });
        } else {
            setCurrentSearch({});
        }
    }).catch((error) => {
        console.log(error)
    })
}

export const directSupport = (projectName, supporter, balance, setCurrentProject) => {
    let msg = {};
    msg["name"] = projectName;
    msg["email"] = supporter;
    let amount = document.getElementById("direct-support").value;
    msg["amount"] = amount;
    let data = { 'body': JSON.stringify(msg) };
    instance.post('/direct-support', data)
        .then(function (response) {
            let projectDetails = response.data.details[0];
            let pledgeList = response.data.pledges;
            balance -= amount;
            setCurrentProject({ details: projectDetails, pledges: pledgeList });
        })
        .catch(function (error) {
            console.log(error);
        })
    document.getElementById("direct-support").value = '';
}

export const headerClick = (e, setCurrentSearch, supporterState) => {
    setCurrentSearch(null)
    supporterState = ""
}