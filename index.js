const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const labelName = 'Vacation';// lets say you want to label the email as Vacation

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

// Load client secrets from a local file.
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.error('Error loading saved credentials:', err.message);
        return null;
    }
}
// Fetch a new access token and save it locally
async function saveCredentials(client) {
    try {
        const content = await fs.readFile(CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
    } catch (error) {
        console.error('Error saving credentials:', error.message);
    }
}
// Create an OAuth2 client with the given credentials.json file
async function authorize() {
    try {

        let client = await loadSavedCredentialsIfExist();
        if (client) {
            return client;
        }
        client = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        if (client.credentials) {
            await saveCredentials(client);
        }
        return client;
    } catch (error) {
        console.error('Authorization error:', error.message);
        throw error;
    }
}
// Fetch the unread emails
async function fetchUnreadEmails(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    // Fetch only unread emails
    const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
    });
    const emails = listResponse.data.messages;
    // console.log(emails); --> This will give you the unread emails (debugging purpose)
    for (const email of emails) {
        await processEmail(auth, email.id);
    }
}
// Process the email as per the requirements
async function processEmail(auth, emailId) {
    const gmail = google.gmail({ version: 'v1', auth });
    // Fetch the email details
    const email = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
    });
    // Checking if the email has prior replies or not 
    const hasPriorReplies = email.data.threadInfo && email.data.threadInfo.replies > 0;

    if (!hasPriorReplies) {
        // If not then Send a reply
        const replyText = 'Thank you for your email. I am currently on vacation, I will get back to you as soon as possible.';
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: Buffer.from(
                    `From: me\nTo: ${email.data.payload.headers.find((header) => header.name === 'From').value}\nSubject: Re: ${email.data.payload.headers.find((header) => header.name === 'Subject').value}\n\n${replyText}`
                ).toString('base64')
            },
        });
        const labels = await listLabels(auth);
        // Move the email to the label Testing
        await gmail.users.messages.modify({
            userId: 'me',
            id: emailId,
            requestBody: {
                addLabelIds: [labels[labels.length - 1].id],//---> This will add the label to the email (debugging purpose)
                removeLabelIds: ['INBOX'],
            },
        });
    }
}
// List all the labels
async function listLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({
        userId: 'me',
    });
    const labels = res.data.labels;
    const existingLabel = labels.find((label) => label.name === labelName);
    if (!existingLabel) {
        // If the label doesn't exist, create it
        const createdLabel = await gmail.users.labels.create({
            userId: 'me',
            resource: { name: labelName, labelListVisibility: 'labelShow' },
        });
        // Add the created label to the list
        labels.push(createdLabel.data);
    }
    if (!labels || labels.length === 0) {
        console.log('No labels found.');
        return;
    }
    /*  This will give you all the labels (debugging purpose)
    labels.forEach((label) => {
        console.log(`- ${label.name}: ${label.id}`);
    });
    */
    return labels;
}
// Main Code
function mainSequence() {
    authorize()
        .then(fetchUnreadEmails)
        .catch((error) => console.error(error));
}
setInterval(mainSequence, Math.floor(Math.random() * (120000 - 45000 + 1) + 45000));