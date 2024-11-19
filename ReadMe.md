# Deadline Notification GitHub Bot

This repository contains a GitHub Bot that helps notify users about upcoming deadlines for tasks, issues, or pull requests within a GitHub repository.

## Table of Contents

1. [How to Run](#how-to-run)
2. [Modifying the Code](#modifying-the-code)

## How to Run

Follow the steps below to run the Deadline Notification GitHub Bot:

### 1. Clone the Repository
Clone the repository to your local machine:
```bash
git clone https://github.com/your-username/deadline-notification-bot.git
```
2. Install Dependencies
Navigate to the project directory and install the necessary dependencies:
```
cd deadline-notification-bot
npm install
```
3. Configure the Bot
You’ll need to set up a GitHub App or Personal Access Token for authentication:

Create a GitHub App or generate a personal access token on GitHub.
Set the token in the configuration file config.json.
Example config.json:

```
{
  "token": "your-github-token-here",
  "repo": "your-repository-name"
}
```
4. Start the Bot
Run the bot with the following command:


## Modifying the Code
To modify the functionality of the Deadline Notification GitHub Bot, follow these guidelines:

1. Modify Notification Logic
The logic for calculating deadlines and sending notifications is located in bot.js. You can customize the notification criteria by adjusting the code there. For example, you can modify the notification period or adjust how the bot handles different types of tasks (issues, pull requests, etc.).

2. Update Notification Message
The notification message sent to users is configurable in the notifyUser function in bot.js. You can change the content, formatting, or even the medium (such as sending messages to a Slack channel instead of a GitHub issue comment).

3. Change Bot Settings
For settings such as GitHub token or repository name, edit the config.json file. You can also add additional settings for custom behavior (e.g., time zones, reminder frequency, etc.).

4. Add More Features
You can extend the bot with more features such as:

Multiple repositories support
Custom deadlines for different types of issues or pull requests
Notifications for specific users or teams To do this, add new functions or modify existing ones in bot.js based on your needs.

