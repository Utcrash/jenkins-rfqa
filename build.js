import axios from 'axios';
import inquirer from 'inquirer';
import { creds } from './credentials.js'

async function main() {
    // Step 1: Ask for version
    const versionChoices = [
        { name: '2.8', value: 'rh' },
        { name: '2.9', value: 'version%2F2.9.0' }, // Note the URL encoding for '/'
        { name: 'main', value: 'main' }
    ];

    const { version } = await inquirer.prompt({
        type: 'list',
        name: 'version',
        message: 'Choose the version:',
        choices: versionChoices
    });

    // Step 2: Ask for module
    const moduleChoices = ['BM', 'GM', 'COMMON', 'GW', 'MON', 'NE', 'PROXY', 'SM', 'USER'];

    const { module } = await inquirer.prompt({
        type: 'list',
        name: 'module',
        message: 'Choose the module:',
        choices: moduleChoices
    });

    // Step 3: Update Jenkins URL based on selections
    let jenkinsUrl = `https://cicd.datanimbus.io/cicd/job/DNIO/job/${module}/job/${version}/buildWithParameters`

    // Step 4: Ask for additional parameters
    let paramChoices = [
        { name: 'cleanBuild', value: 'cleanBuild', checked: false },
        { name: 'pushToS3', value: 'pushToS3', checked: false },
        { name: 'deploy', value: 'deploy', checked: false },
        { name: 'dockerHub', value: 'dockerHub', checked: false }
    ];
    if (module === 'BM') {
        paramChoices = paramChoices.concat([
            { name: 'buildAgent', value: 'buildAgent', checked: false },
            { name: 'buildAgentWatcher', value: 'buildAgentWatcher', checked: false }])
    }
    if (module === 'GW') {
        paramChoices = paramChoices.concat([{ name: 'buildAuthorUI', value: 'buildAuthorUI', checked: false },
        { name: 'buildAppcenterUI', value: 'buildAppcenterUI', checked: false },
        { name: 'buildSwaggerUI', value: 'buildSwaggerUI', checked: false }
        ])
    }
    console.log(paramChoices);
    const { tagName, options } = await inquirer.prompt([
        {
            type: 'input',
            name: 'tagName',
            message: 'Enter the tag name:',
            default: 'test'
        },
        {
            type: 'checkbox',
            name: 'options',
            message: 'Select options:',
            choices: paramChoices

        }
    ]);

    // Prepare the params object
    const params = {
        tag: tagName,
        cleanBuild: options.includes('cleanBuild').toString(),
        pushToS3: options.includes('pushToS3').toString(),
        deploy: options.includes('deploy').toString(),
        dockerHub: options.includes('dockerHub').toString()
    };

    // extraParams.forEach(param => {
    //     params[param] = 'true';
    // });

    // Jenkins credentials
    const username = 'admin';  // Replace with your Jenkins username
    const apiToken = creds.jenkinksToken; // Replace with your Jenkins API token

    // Base64 encode the username and API token for Basic Auth
    const token = Buffer.from(`${username}:${apiToken}`).toString('base64');

    // Set up the headers with the Authorization token
    const headers = {
        'Authorization': `Basic ${token}`
    };

    // Send the POST request to trigger the build
    console.log(jenkinsUrl);
    try {
        const response = await axios.post(jenkinsUrl, null, {
            params: params,
            headers: headers
        });
        console.log('Build triggered successfully.');
    } catch (error) {
        console.error('Error triggering build:', error.message);
    }
}

main();
