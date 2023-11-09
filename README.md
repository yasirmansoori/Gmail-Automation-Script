# Gmail Automation Script
- Do you want to spend your vacation stress-free, or are you sick of receiving these emails? This Node.js script automates the processing of unread emails in your Gmail account. It retrieves unread emails, checks for prior replies, and sends a predefined response if none exist. It also adds a custom label ('Vacation') to the email and moves it out of the inbox.
# Getting Started
## Prerequisites
### Google Cloud Console Account
- Make sure you have a google cloud account registerd, if not goto [cloud.google.com](https://accounts.google.com/InteractiveLogin/signinchooser?continue=https%3A%2F%2Fconsole.cloud.google.com%2Ffreetrial%3Ffacet_utm_source%3D01%26facet_utm_campaign%3D01%26facet_utm_medium%3D01%26facet_url%3Dhttps%3A%2F%2Fcloud.google.com&followup=https%3A%2F%2Fconsole.cloud.google.com%2Ffreetrial%3Ffacet_utm_source%3D01%26facet_utm_campaign%3D01%26facet_utm_medium%3D01%26facet_url%3Dhttps%3A%2F%2Fcloud.google.com&osid=1&passive=1209600&service=cloudconsole&ifkv=AVQVeyxTyKEP7qHJJUCVbJvYQqVyuhGtkuuEq3D3FvNcM8U8V7rry3m2LB6J5pKy4pBA2tI--uTbLw&theme=glif&flowName=GlifWebSignIn&flowEntry=ServiceLogin)

- Navigate to [Create Project](https://console.cloud.google.com/projectcreate?previousPage=%2Fhome%2Fdashboard%3Fproject%3Dopeninappchallenge&organizationId=0)

     ![Create Project Page](./Do%20not%20touch/assets/img/1.png)
- Add desired project name and click on create button.
- On Quick Access section of main page click on APIs & Services tab and then click on `+Enable APIs & Services`
  
     ![Alt text](./Do%20not%20touch/assets/img/2.png)
- Search for Gmail API and enable it.
  
  ![Alt text](./Do%20not%20touch/assets/img/3.png)

- Next is to create credentials to use the app, so click on create credentials button.
  
  ![Alt text](./Do%20not%20touch/assets/img/4.png)
## **Now follow the steps carefully -*
### Credential Type
- `Gmail API`
### What data will you be accessing?
- `User data`
  
  ![Alt text](./Do%20not%20touch/assets/img/5.png)
### OAuth Consent Screen
- App name - `<Give your own desired name>`
- User support email - `Give your own email`
- Developer contact information `Give your own email for contact`
### Scopes
- click on -> `Add/remove scopes` -> checkbox the `../auth/gmail.modify` scope and click -> `update` -> `continue`
  
  ![Alt text](./Do%20not%20touch/assets/img/6.png)
### OAuth Client ID
- Application type - `Desktop App`
- Application name - `<Give your desired name>`
- Click on create button
  
  ![Alt text](./Do%20not%20touch/assets/img/7.png)
### Download credentials file and save it as credentials.json 

  ![Alt text](./Do%20not%20touch/assets/img/8.png)

If you have done everything correctly then you should see the download button, if not you can refer the google docs here [cloud.google.com](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id)
### Setup Test users in OAuth Consent Screen
- Navigate to OAuth Consent Screen in APIs and Services tab
- Scroll down and click on Add users button
- Add email for testing -> `save`
  
  ![Alt text](./Do%20not%20touch/assets/img/9.png)
- All set 
### Node.js:
- Make sure you have Node.js installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).

### Installation
1. Clone the repository:

   ```bash
   gh repo clone yasirmansoori/Gmail-Automation-Script
2. Navigate to the project directory:  

     ```bash
     cd Gmail-Automation-Script
3. Install dependencies:

     ```bash
    npm install
4. To take a fresh look 
   
     ```bash
    npm start
5. Do the authentication process and you are all set.
   
# Technology and Library Specification:
## Libraries and Technologies Used:
### Node.js:
- Node.js is a runtime environment that allows executing JavaScript code server-side. It is used for building scalable network applications.
### fs.promises (File System Promises):
- The 'fs.promises' module provides an asynchronous API for interacting with the file system. It is used for reading and writing files in a non-blocking manner.
### path:
- The 'path' module provides utilities for working with file and directory paths. It is used to construct file paths in a platform-independent way.
### process:
- The 'process' module provides information about, and control over, the current Node.js process. It is used for obtaining the current working directory.
### @google-cloud/local-auth:
- The '@google-cloud/local-auth' module provides a local authentication flow for Google Cloud services. It is used to authenticate the application locally and obtain user consent for accessing Gmail.
### googleapis:
- The 'googleapis' library provides a set of APIs for various Google services. In this script, it is used to interact with the Gmail API.