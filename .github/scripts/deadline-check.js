// .github/scripts/deadline-check.js
const { Octokit } = require("@octokit/rest");
const axios = require("axios");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = "YOUR_USERNAME";
const repo = "YOUR_REPOSITORY_NAME";

const getDateDifferenceInDays = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

async function checkDeadlines() {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    const today = new Date();

    for (const issue of issues) {
      const assignees = issue.assignees.map((assignee) => `@${assignee.login}`).join(", ");
      const deadlineLabel = issue.labels.find(label => label.name.startsWith("deadline:"));

      if (deadlineLabel) {
        const deadlineString = deadlineLabel.name.replace("deadline:", "").trim();
        const deadlineDate = new Date(deadlineString);

        const daysLeft = getDateDifferenceInDays(today, deadlineDate);

        if (daysLeft === 7 || daysLeft === 1 || daysLeft === 0) {  // Notify at 7 days, 1 day, and on the day
          let message = `⏰ Reminder: This issue is due in ${daysLeft} day(s).`;
          if (daysLeft === 0) message = "⏰ Today is the deadline for this issue!";
          
          await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issue.number,
            body: `${assignees} ${message}`
          });
        }
      }
    }
  } catch (error) {
    console.error("Error checking deadlines:", error);
  }
}

checkDeadlines();
