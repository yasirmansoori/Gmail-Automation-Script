// gmailService.js
const fs = require('fs').promises;
const { authenticate } = require('@google-cloud/local-auth');
const { labelName } = require('./config');
const { google } = require('googleapis');

async function loadCredentials(credentialsPath) {
  try {
    const data = await fs.readFile(credentialsPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading client secret file:', err);
    throw err;
  }
}

async function authenticateGmail({ keyfilePath, scopes }) {
  try {
    const auth = await authenticate({
      keyfilePath,
      scopes,
    });
    return auth;
  } catch (err) {
    console.error('Error authenticating with Gmail:', err);
    throw err;
  }
}

async function createLabel(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });
    return res.data.id;
  } catch (error) {
    if (error.code === 409) {
      const res = await gmail.users.labels.list({
        userId: 'me',
      });
      const label = res.data.labels.find((label) => label.name === labelName);
      return label.id;
    } else {
      console.error('Error creating or fetching label:', error);
      throw error;
    }
  }
}

async function getUnreadMessages(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'in:inbox is:unread',
    });
    return response.data.messages || [];
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    throw error;
  }
}

async function getEmailFromMessage(auth, message) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const emailData = await gmail.users.threads.get({
      userId: 'me',
      id: message.threadId,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject'],
    })
    // Get the email address from the message
    const fromHeader = emailData.data.messages[0].payload.headers.find(
      (header) => header.name === 'From'
    ).value

    // Get the subject from the message
    const subject = emailData.data.messages[0].payload.headers.find(
      (header) => header.name === 'Subject'
    ).value
    // Defined a regular expression pattern to match the email addresses
    const emailRegex = /[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}/;
    const match = fromHeader.match(emailRegex);

    // First condition is to check if the email is a reply to the message 
    if (subject.startsWith('Re:')) {
      return null;
    }
    // If match found return the email address
    else if (match) {
      return match[0];
      // If no match found return null
    } else {
      console.log("No email address found");
      return null;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Send reply to message
async function sendReply(auth, message) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'metadata',
      metadataHeaders: ['Subject', 'From'],
    });

    const subject = res.data.payload.headers.find(
      (header) => header.name === 'Subject'
    ).value;

    const from = res.data.payload.headers.find(
      (header) => header.name === 'From'
    ).value;

    const replyTo = from.match(/<(.*)>/)[1];
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
    const replyMessage = `Hi ,\n\nI'm currently on vacation and will get back to you soon.\n\nRegards,\nYasir Mansoori`;

    const rawMessage = [
      `From: me`,
      `To: ${replyTo}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${message.id}`,
      `References: ${message.id}`,
      "",
      replyMessage,
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    message = {}

  } catch (error) {
    console.log(error);
    throw error;
  }
}

// function to create a label
async function createLabel(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    const res = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
      },
    });
    return res.data.id;
  } catch (error) {
    if (error.code === 409) {
      const res = await gmail.users.labels.list({
        userId: 'me',
      });
      const label = res.data.labels.find((label) => label.name === labelName);
      return label.id
    } else {
      throw error
    }
  }
}

// Add label to message and move it to label folder
async function addLabel(auth, message, labelId) {
  const gmail = google.gmail({ version: 'v1', auth });
  try {
    if (labelId === undefined) {
      labelId = await createLabel(auth);
    }
    await gmail.users.messages.modify({
      userId: 'me',
      id: message.id,
      requestBody: {
        addLabelIds: [labelId],
        removeLabelIds: ['INBOX',],
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  loadCredentials,
  authenticateGmail,
  createLabel,
  getUnreadMessages,
  getEmailFromMessage,
  sendReply,
  addLabel,
};
