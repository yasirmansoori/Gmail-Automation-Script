const express = require('express');
const app = express();

// Import configuration and Gmail service functions
const { port, labelName, credentialsPath, scopes } = require('./config');
const { loadCredentials,
  authenticateGmail,
  createLabel,
  getUnreadMessages,
  getEmailFromMessage,
  sendReply,
  addLabel, } = require('./gmailService');


app.get('/', async (req, res) => {
  try {
    const credentials = await loadCredentials(credentialsPath);
    const auth = await authenticateGmail({ keyfilePath: credentialsPath, scopes });
    await main(auth);
    res.send('You have successfully subscribed to the Vacation Responder');
  } catch (error) {
    console.error('Error during initialization:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Main logic
async function main(auth) {
  // Set is used to store email addresses that have already been replied to
  const repliedEmails = new Set();
  let isProcessing = false;
  console.log("repliedEmails", repliedEmails);

  // Create a new label if it doesn't exist
  const labelId = await createLabel(auth, labelName);
  console.log(`Label ${labelName} created with id ${labelId}`);

  // Settting interval to periodically check for unread emails
  setInterval(async () => {
    // Skip processing if the previous interval is still ongoing (it takes some time to process the huge chunk of emails)
    if (isProcessing) {
      console.log('Previous interval still processing. Skipping.');
      return;
    }
    // Setting flag to indicate processing has started
    isProcessing = true;
    try {
      const unreadMessages = await getUnreadMessages(auth);
      console.log('Unread messages: ', unreadMessages);

      // Iterating through unread messages and sending replies to each of them by fulfillung required conditions
      for (const message of unreadMessages) {
        // Get the email address from the message
        const emailFromMessage = await getEmailFromMessage(auth, message);

        // Check if the email has already been replied to
        if (!repliedEmails.has(emailFromMessage) && emailFromMessage !== null) {
          // Send a reply to the email and add label
          await sendReply(auth, message, emailFromMessage);
          console.log(`Replied to message ${message.id} to the user with email ${emailFromMessage}`);
          repliedEmails.add(emailFromMessage);

          // Add label to the processed message
          await addLabel(auth, message);
          console.log(`Added label ${labelName} to message ${message.id}`);
        } else if (emailFromMessage === null) {
          // Handle replies to existing messages and adding label to the processed message
          console.log(`This is a reply to the message ${message.id}`);
          await addLabel(auth, message);
          console.log(`Added label ${labelName} to message ${message.id}`);
        } else {
          // Handle already replied emails
          console.log(`Already replied to the user with email ${emailFromMessage} once`);
          await addLabel(auth, message);
          console.log(`Added label ${labelName} to message ${message.id}`);
        }
      }
    } catch (error) {
      // Logging and handle errors
      console.error('Error in main logic:', error);
    } finally {
      // Reset processing flag after processing is complete
      isProcessing = false;
    }
    // Set interval between 5 to 10 seconds for demo purposes
  }, Math.floor(Math.random() * (10 - 5 + 1) + 5) * 1000);
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
