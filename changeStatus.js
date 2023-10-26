
import http from "https";
import {creds} from './credentials.js';

export const changeStatus = (defectId) => {
  const options = {
    "method": "POST",
    "hostname": "appveen.atlassian.net",
    "port": null,
    "path": "/rest/api/3/issue/"+defectId+"/transitions",
    "headers": {
      "Accept": "*/*",
      "Authorization": "Basic "+creds.bitBucketApiToken,
      "Content-Type": "application/json"
    }
  };

  const req = http.request(options, function (res) {
    const chunks = [];

    res.on("data", () => {});

    res.on("end", () => {});
  });

  req.write(JSON.stringify({transition: {id: '3'}}));
  req.end();
};