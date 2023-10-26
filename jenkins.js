import http from "https";
import open from 'open';
import {changeStatus} from './changeStatus.js';
import {creds} from './credentials.js' 


const options = {
  "method": "GET",
  "hostname": "cicd.ds.datanimbus.com",
  "port": null,
  "path": "/job/Cloud_Ops/job/PROXY/job/version%252F2.8.1/lastBuild/api/json/",
  "headers": {
    "Accept": "*/*",
    "Authorization": "Basic "+creds.jenkinksToken
  }
};

const req = http.request(options, async function (res) {
  let rawData = '';

  res.on("data", function (chunk) {
      rawData += chunk;
  });

  res.on("end", async function () {
      const body = JSON.parse(rawData);
      const changeSets = body.changeSets || [];
      const commits = changeSets
          .flatMap(ele => ele.items)
          .filter(data => data?.author?.fullName === 'utkarsh')
          .map(data => ({
              comment: data?.comment,
              author: data?.author?.fullName
          }))
          .filter(commit => commit.comment.includes('Defect DS-'))
          .map(comment => {
              const match = comment.comment.match(/DS-\S+/);
              return match ? match[0] : '';
          });
    
      for (const defect of commits) {
          await changeStatus(defect);
      }
    
      open('https://appveen.atlassian.net/jira/software/projects/DS/issues/?jql=project%20%3D%20%22DS%22%20and%20assignee%20%3D%20currentUser%28%29%20and%20status%20%3D%20%22Ready%20for%20QA%22%20ORDER%20BY%20created%20DESC');
  });
});

req.end();