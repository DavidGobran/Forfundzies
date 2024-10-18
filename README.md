# Forfundzies

Forfundzies is a crowdsourcing application similar to Kickstarter. It has support for three roles: Project Designer, Supporter, and Admin. The frontend is built in React and backend uses Node.js lambda functions.

## Setup

In the app directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Structure

- This project relies on AWS lambda functions for the backend. 
- To acheive full functionality, all the directories in the lambdas directory should be uploaded as functions in AWS lambda. 
    - These functions should then have triggers POST methods in AWS API Gateway. 
- Once the API has been deployed, the baseURL of instance in App.js should be updated to the appropriate URL of the API.

## Dependencies
 - This project relies on axios to make HTTP requests. You can use `npm install axios` in the app directory to take advantage of this functionality.


