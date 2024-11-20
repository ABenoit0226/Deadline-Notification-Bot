import { Octokit } from "@octokit/rest";
import fetch from "node-fetch"; // Import fetch from node-fetch

const owner = "ABenoit0226" //OWNER NAME HERE
const repo = "AI-Safety-Simplified" //REPO NAME HERE

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  request: { fetch }, // Pass fetch to Octokit
});


const getDateDifferenceInDays = (date1, date2) => {
  const normalizedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const normalizedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  // Calculate the difference in days
  const differenceInDays = (normalizedDate2 - normalizedDate1) / (1000 * 60 * 60 * 24);

  return differenceInDays
};

async function checkDeadlines() {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    console.log("Retrieved issues:", issues);

    const today = new Date();

    for (const issue of issues) {
      console.log(`Checking issue #${issue.number}: ${issue.title}`);

      const assignees = issue.assignees.map((assignee) => `@${assignee.login}`).join(", ");
      const deadlineLabel = issue.labels.find(label => label.name.startsWith("deadline:"));

      if (deadlineLabel) {
        const deadlineString = deadlineLabel.name.replace("deadline:", "").trim();
        const deadlineDate = new Date(deadlineString.replace(/-/g, '\/'));

        const daysLeft = getDateDifferenceInDays(today, deadlineDate);

        console.log(`Issue #${issue.number} has a deadline in ${daysLeft} days`);

        if (daysLeft === 7 || daysLeft === 1 || daysLeft === 0) {
          let message;
          if (daysLeft === 0) {
            message = "⏰ Today is the deadline for this issue!";
          } else {
            message = `⏰ Reminder: This issue is due in ${daysLeft} day(s).`;
          }

          await octokit.issues.createComment({
            owner,
            repo,
            issue_number: issue.number,
            body: `${assignees} ${message}`
          });
          console.log(`Comment posted on issue #${issue.number}`);
        }
      } else {
        console.log(`No deadline label found on issue #${issue.number}`);
      }
    }
  } catch (error) {
    console.error("Error checking deadlines:", error);
  }
}

checkDeadlines();
