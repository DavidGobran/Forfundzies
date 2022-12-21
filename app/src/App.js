import React from 'react';
import './App.css';
import axios from "axios";
import { register } from './controller/Register';
import { login } from './controller/Login';
import { updateProjects, createProject, viewProject, deleteProject, launchProject, createPledge, viewPledgeDes, deletePledge } from './controller/Designer';
import { searchString, viewProjectSupp, viewPledge, claimPledge, showAccountInfo, addFunds, searchGenre, directSupport, headerClick } from './controller/Supporter';
import { deleteAdmin, reap, listAdmin, sumFunds } from './controller/Admin';

export var designer = '';
export var adminPassword = '';
var loggedIn = '';
var userRole = '';
var supporter = '';
var supporterState = '';
var balance = 0;
var genres = ["Game", "Movie", "Book", "Technology", "Music"];

export const instance = axios.create({
  baseURL: '' // TODO: change to your own API Gateway endpoint
});

function App() {
  const [redraw, forceRedraw] = React.useState(0)
  // designer state variables
  const [projectList, setProjectList] = React.useState()
  const [currentProjectDes, setCurrentProjectDes] = React.useState()
  const [projectActive, setProjectActive] = React.useState()
  const [currentPledgeDes, setCurrentPledgeDes] = React.useState()
  // supporter state variables
  const [currentProject, setCurrentProject] = React.useState();
  const [currentPledge, setCurrentPledge] = React.useState();
  const [currentSupporterInfo, setSupporterInfo] = React.useState();
  const [searchedProjects, setCurrentSearch] = React.useState();
  // admin state variable
  const [adminList, setAdminList] = React.useState()

  /** Ensures initial rendering is performed, and that whenever model changes, it is re-rendered. */
  React.useEffect(() => {
    if (loggedIn === "designer") {
      updateProjects(setProjectList)
    }
    if (loggedIn === "admin") {
      listAdmin(setAdminList)
    }
  }, [loggedIn])

  const changeRole = (e) => {
    userRole = document.getElementById("role").value;
    forceRedraw(redraw + 1);
  }

  return (
    <div className="App">
      {(!loggedIn) ?
        (<div id="login">
          <select name="roleSelect" id="role" onInput={(e) => changeRole()}>
            <option value="">Select a role</option>
            <option value="Designer">Designer</option>
            <option value="Supporter">Supporter</option>
            <option value="Admin">Admin</option>
          </select>
          {(userRole !== "Admin") ? (<h1>{"Register/Login " + userRole}</h1>) : (<h1>{"Login " + userRole}</h1>)}
          {(userRole === "Designer") ?
            (<div>
              Name: <input id='name' />
              <br></br>
            </div>) : null}
          {(userRole !== "Admin") ?
            (<div>
              Email: <input id='email' />
              <br></br>
            </div>) : null}
          Password: <input id='password' />
          <br></br>
          {(userRole && userRole !== "Admin") ? (<button onClick={(e) => register(e, userRole, designer, supporter, loggedIn, redraw, forceRedraw)}>{"Register " + userRole}</button>) : null}
          {userRole ? (<button onClick={(e) => login(e, userRole, designer, adminPassword, supporter, balance, loggedIn, redraw, forceRedraw)}>{"Login " + userRole}</button>) : null}
        </div>) : null
      }

      {(loggedIn === "designer") ?
        (<div id="designer-page">
          <h1>Welcome {designer}</h1>
          <div id="create-project">
            Name: <input id="project-name" />
            <br></br>
            Story: <input id="story" />
            <br></br>
            Genre:
            <select name="List Genres" id="genre" className="form-control" required="required">
              <option value="">Select a Genre</option>
              <option value="game">Game</option>
              <option value="movie">Movie</option>
              <option value="book">Book</option>
              <option value="technology">Technology</option>
              <option value="music">Music</option>
            </select>
            <br></br>
            Goal: <input type="number" min="1" id="goal" />
            <br></br>
            Deadline: <input type="date" id="deadline" /> <br></br>
            <br></br>
            <button onClick={(e) => createProject(e, forceRedraw, redraw, setProjectList, setProjectActive, setCurrentProjectDes, setCurrentPledgeDes)}>Create Project</button>
          </div>
          <br></br>
          <label htmlFor="projects">View a project: </label>
          <select name="List Projects" id="projects" onInput={(e) => viewProject(e, null, setProjectActive, setCurrentProjectDes, setCurrentPledgeDes)} value={currentProjectDes ? currentProjectDes.details.name : "default"}>
            <option value="default">Select a Project</option>
            {projectList ? projectList.projs.map(project => <option
              value={project}
              key={project}>
              {project}
            </option>) : null}
          </select>
          <br></br>

          {currentProjectDes ?
            (<div id="project-details">
              <br></br>
              {!projectActive ?
                (
                  <div id="project-actions">
                    <button onClick={(e) => deleteProject(e, setCurrentProjectDes, setProjectList)}>Delete Project</button>
                    <button onClick={(e) => launchProject(e, setProjectActive)}>Launch Project</button>
                  </div>
                ) : null}
              <h2>Project Details</h2>
              <p>{`Story: ${currentProjectDes.details.story}`}</p>
              <p>{`Genre: ${currentProjectDes.details.genre}`}</p>
              {(currentProjectDes.details.currRaised >= currentProjectDes.details.goal) ?
                <p>{`Progress: $${currentProjectDes.details.currRaised}/$${currentProjectDes.details.goal} 🥳`}</p> :
                <p>{`Progress: $${currentProjectDes.details.currRaised}/$${currentProjectDes.details.goal}`}</p>}
              <p>{`Deadline: ${currentProjectDes.details.deadline.substring(0, 10)}`}</p>
              <p>{projectActive ? `Active: Yes` : `Active: No`}</p>
              <h3>Pledges: </h3>
              <div id="pledge-list-div">
                <label htmlFor="pledge-list">View a pledge: </label>
                <select name="List Pledges" id="pledge-list" onInput={(e) => viewPledgeDes(e, setCurrentPledgeDes)}>
                  <option value="default">Select a Pledge</option>
                  {currentProjectDes.pledges.map(pledge => <option
                    value={pledge.id}
                    key={pledge.id}>
                    {`${pledge.pledgeName} $${pledge.amount} ${pledge.description}`}
                  </option>)}
                </select>
                {!projectActive ? (
                  <div id="inactive">
                    <br></br>
                    {currentPledgeDes ? (<button onClick={(e) => deletePledge(e, setProjectActive, setCurrentProjectDes, setCurrentPledgeDes)}>Delete Pledge</button>) : null}
                    <div id="create-pledge">
                      <br></br>
                      Name: <input id="pledge-name" />
                      <br></br>
                      Amount: <input type="number" min="1" id="amount" />
                      <br></br>
                      Description: <input id="description" />
                      <br></br>
                      Max Supporters: <input type="number" min="1" id="max-supporters" /> <br></br>
                      <br></br>
                      <button onClick={(e) => createPledge(e, forceRedraw, redraw, setProjectActive, setCurrentProjectDes, setCurrentPledgeDes)}>Create Pledge</button>
                    </div>
                  </div>) : null}
                {currentPledgeDes ?
                  <div id="pledge-details">
                    {projectActive ? (
                      <div id="pledge-supporters">
                        <h3>Supporters: </h3>
                        {currentPledgeDes.pledges.map(supporter => <li
                          key={supporter.supporterEmail}>
                          {supporter.supporterEmail}</li>)}
                      </div>) : null}
                  </div>
                  : null}
              </div>
            </div >) : null}
        </div>) : null
      }

      {(loggedIn === "supporter") ?
        (<div>
          <h1 onClick={(e) => headerClick(e, setCurrentSearch, supporterState)}
            style={{
              float: 'left',
              marginLeft: '40%',
              border: '1px solid',
              borderColor: '#81EA8E'
            }}>forFUNDzies</h1>
          <p onClick={showAccountInfo(supporter, supporterState, setSupporterInfo)}
            style={{
              marginLeft: '90%',
              height: '20px',
              backgroundColor: '#ADE6D1',
              fontSize: '15px',
              border: '1px solid'
            }}>{supporter}</p>
          <p onClick={showAccountInfo(supporter, supporterState, setSupporterInfo)}
            style={{
              marginLeft: '90%',
              height: '20px',
              backgroundColor: '#ADE6D1',
              fontSize: '15px',
              border: '1px solid'
            }}>${balance}</p>
          <table id="genres-table" style={{ align: 'center', width: '100%', border: '1px dotted', backgroundColor: '#C1FFC9' }}>
            <tbody>
              <tr>
                {genres.map(genre => <th
                  onClick={function () { searchGenre(genre, supporterState, setCurrentSearch) }}
                  key={genre}
                  style={{ fontSize: '37px', border: '1px solid', backgroundColor: '#DAFADE' }}>
                  {genre}</th>)}
              </tr>
            </tbody>
          </table>
          <input type="text" id="search-bar" placeholder="Search by description" />
          <button onClick={(e) => searchString(e, setCurrentSearch)}>Search</button>
        </div>) : null}

      {(loggedIn === "supporter" && !searchedProjects) ?
        (<div>Click on a genre above or enter a keyword to search for a project.</div>) : null}

      {(searchedProjects) ?
        (<table id="result-table" style={{ align: 'center', border: '1px solid', width: '50%', marginLeft: '25%' }} rules='rows'>
          <tbody>
            {(searchedProjects.projects) ? (searchedProjects.projects.map(project => <tr key={project.name}>
              <td
                onClick={function () { viewProjectSupp(project.name, supporterState, setCurrentProject) }}
                style={{ color: 'black', textDecoration: 'underline #97E7A1', fontSize: '25px' }}>
                {project.name}</td>
              <td>
                <progress value={project.currRaised} max={project.goal}></progress>
              </td>
              <td>{project.deadline.substring(0, 10)}</td>
            </tr>)) : (<tr><td>No projects matching search 😔</td></tr>)}
          </tbody>
        </table>) : null}

      {(supporterState === "view-project-supp" && currentProject) ?
        (<div id='view-project'>
          <br></br>
          <div style={{ width: '100%' }}>
            <div style={{
              fontSize: '24px',
              float: 'left',
              width: '49.5%',
              height: '200px',
              backgroundColor: '#D7F0F1',
              border: '1px solid'
            }}>
              <p id='project-title'>{currentProject.details.name}</p>
              <p id='genre'>{currentProject.details.genre}</p>
              <p id='description'>{currentProject.details.story}</p>
              <br></br>
              <progress id='progress-bar' value={currentProject.details.currRaised} max={currentProject.details.goal}></progress>
              <div id='progress'>Amount raised: ${currentProject.details.currRaised} / ${currentProject.details.goal}</div>
            </div>
            <div id='pledge-list-supp'
              style={{
                marginLeft: '50%',
                height: '150px',
                backgroundColor: '#D7F0F1',
                border: '1px solid'
              }}>
              <p>Pledges</p>
              <p style={{ fontSize: '12px' }}>Click on one of the available pledges below to view and claim!</p>
              {(currentProject.pledges) ? (currentProject.pledges.map(pledge => <div
                key={pledge.id}
                onClick={(pledge.currSupporters < pledge.maxSupporters || pledge.maxSupporters === 0) ? (function () { viewPledge(pledge.id) }) : function () { }}
                style={(pledge.currSupporters < pledge.maxSupporters || pledge.maxSupporters === 0) ? { color: 'blue', textDecoration: 'underline blue' } : {}}>
                {`${pledge.pledgeName} ${pledge.description}`}
              </div>)) : "This project has no pledges."}
            </div>
            <br></br>
            <div style={{
              marginLeft: '50%',
              height: '100px',
              backgroundColor: '#D7F0F1',
              border: '1px solid'
            }}>
              <p>Direct Support</p>
              <input id='direct-support' type='number' min='1' />
              <button onClick={function () { directSupport(currentProject.details.name, supporter, balance, setCurrentProject) }}>Support Directly</button>
            </div>
          </div>
        </div>) : null}

      {(supporterState === "view-pledge" && currentPledge) ?
        (<div id="claim-pledge">
          Pledge Tier: <div id="pledge-tier">{currentPledge.pledge[0].pledgeName}</div>
          <br></br>
          Amount:  <div id="pledge-amount">{currentPledge.pledge[0].amount}</div>
          <br></br>
          Rewards: <div id="pledge-rewards">{currentPledge.pledge[0].description}</div>
          <br></br>
          <button id="claim-pledge" onClick={function () { claimPledge(currentPledge.pledge[0].id, supporter, supporterState, balance, setCurrentProject) }}>Claim Pledge</button>
        </div>) : null}

      {(supporterState === "view-account" && currentSupporterInfo) ?
        (<div>
          <div style={{ width: '100%' }}>
            <br></br>
            <div
              style={{
                color: 'black',
                fontSize: '24px',
                float: 'left',
                width: '50%',
                height: '100px',
                backgroundColor: '#DBFDDF',
                border: '1px solid'
              }}>
              Account Information
              <br></br>
              Email: <div>{currentSupporterInfo.accountDetails.email}</div>
            </div>
            <div
              style={{
                marginLeft: '50%',
                height: '100px',
                fontSize: '24px',
                backgroundColor: '#DAFADE',
                border: '1px solid'
              }}>
              Balance: <div>${currentSupporterInfo.accountDetails.balance}</div>
              <input id="add-amount"
                type="number"></input>
              <button onClick={function () { addFunds(currentSupporterInfo.directSupports, currentSupporterInfo.pledgeSupports, supporter, supporterState, balance, setSupporterInfo) }}>Add to Balance</button>
            </div>
          </div>
          <br></br>
          <br></br>
          <div style={{ fontSize: '25px' }}>Past Activity</div>
          <br></br>
          <div style={{ fontSize: '20px' }}>Pledge Support:</div>
          <table id="pledge-table" style={{ align: 'center', border: '1px solid', width: '90%', marginLeft: '5%' }} rules='rows'>
            <tbody>
              <tr style={{ fontSize: '20px' }}>
                <th>Project  </th>
                <th>Pledge Name</th>
                <th>Amount</th>
                <th>Refunded Amount</th>
              </tr>
              {currentSupporterInfo.pledgeSupports ? (
                currentSupporterInfo.pledgeSupports.map(pledgeSupport => (
                  <tr>
                    <td onClick={function () { viewProjectSupp(pledgeSupport.project) }}
                      style={{ textDecoration: 'underline #97E7A1' }}>{pledgeSupport.project}</td>
                    <td onClick={function () { viewPledge(pledgeSupport.id) }}
                      style={{ textDecoration: 'underline #97E7A1' }}>{pledgeSupport.pledgeName}</td>
                    <td>{pledgeSupport.amount}</td>
                    <td>{pledgeSupport.refunded ? ("Yes") : ("No")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td></td>
                  <td>No recent direct support found</td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
          <br></br>
          <div style={{ fontSize: '20px' }}>Direct Support:</div>
          <table id="directt-table" style={{ align: 'center', border: '1px solid', width: '55%', marginLeft: '22.5%', fontSize: '18px' }} rules='rows'>
            <tbody>
              <tr style={{ fontSize: '20px' }}>
                <th>Project</th>
                <th>Amount</th>
                <th>Refunded Amount</th>
              </tr>
              {currentSupporterInfo.directSupports ? (
                currentSupporterInfo.directSupports.map(directSupport => (
                  <tr>
                    <td onClick={function () { viewProjectSupp(directSupport.projectName) }}
                      style={{ textDecoration: 'underline #97E7A1' }}>{directSupport.projectName}</td>
                    <td>{directSupport.amount}</td>
                    <td>{directSupport.refunded ? ("Yes") : ("No")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>No recent direct support found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>) : null}

      {(loggedIn === "admin") ?
        (<div id="admin-page">
          <h1>Welcome Admin</h1>
          <div id="admin-stats">
            <table id="admin-table" style={{ margin: "auto" }}>
              <thead>
                <tr>
                  <th>Number of Projects </th>
                  <th>Total Amount Raised </th>
                </tr>
                <tr>
                  <td>{adminList ? adminList.projs.length : 0}</td>
                  <td>{adminList ? sumFunds(adminList.projs) : 0}</td>
                </tr>
              </thead>
            </table>
          </div>
          <br></br>
          <select id="list-admin">
            <option value="default">Select a Project</option>
            {adminList ? adminList.projs.map(project => <option
              value={project.name}
              key={project.name}>
              {`${project.name} ($${project.currRaised}/$${project.goal})`}
            </option>) : null}
          </select>
          <br></br>
          <button onClick={(e) => deleteAdmin(e, setAdminList)}>Delete Project</button> <br></br>
          <br></br>
          <button onClick={(e) => reap(e, forceRedraw, redraw)}>Reap 💀</button>
        </div>) : null
      }
    </div>
  );
}

export default App;