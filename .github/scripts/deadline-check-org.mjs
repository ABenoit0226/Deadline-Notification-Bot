import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const octokit = new Octokit({
  auth: process.env.PERSONAL_ACCESS_TOKEN, // Use the token passed from the workflow
  request: { fetch },
});

const org = "" //ORGANIZATION NAME HERE

const { data: repos } = await octokit.repos.listForOrg({
  org: org,
  type: "all",
});

const getDateDifferenceInDays = (date1, date2) => {
  const normalizedDate1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const normalizedDate2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

  // Calculate the difference in days
  const differenceInDays = (normalizedDate2 - normalizedDate1) / (1000 * 60 * 60 * 24);

  return differenceInDays;
};

for (const repo of repos) {
  console.log(`Checking repository: ${repo.name}`);
  await checkDeadlines(org, repo.name);
}



async function checkDeadlines(owner, repo) {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    const today = new Date();

    for (const issue of issues) {
      console.log(`Checking issue #${issue.number}: ${issue.title}`);

      const assignees = issue.assignees.map((assignee) => `@${assignee.login}`).join(", ");
      const deadlineLabel = issue.labels.find(label => label.name.startsWith("deadline:"));
      const reviewerLabel = issue.labels.find(label => label.name.startsWith("reviewer:"));

      if (deadlineLabel) {
        const deadlineString = deadlineLabel.name.replace("deadline:", "").trim();
        const deadlineDate = new Date(deadlineString.replace(/-/g, "/"));

        const daysLeft = getDateDifferenceInDays(today, deadlineDate);

        console.log(`Issue #${issue.number} has a deadline in ${daysLeft} days`);

        // Notify if the deadline is approaching or today
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
            body: `${assignees} ${message}`,
          });
          console.log(`Comment posted on issue #${issue.number}`);
        }

        // Notify if the deadline has passed
        if (daysLeft < 0) {
          if (reviewerLabel) {
            const reviewer = reviewerLabel.name.replace("reviewer:", "").trim();
            const message = `@${reviewer} The deadline for this issue has passed.`;

            await octokit.issues.createComment({
              owner,
              repo,
              issue_number: issue.number,
              body: message,
            });
            console.log(`Late notification sent to reviewer ${reviewer} for issue #${issue.number}`);
          } else {
            console.log(`No reviewer label found for overdue issue #${issue.number}`);
          }
        }
      } else {
        console.log(`No deadline label found on issue #${issue.number}`);
      }
    }
  } catch (error) {
    console.error("Error checking deadlines:", error);
  }
}