import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const octokit = new Octokit({
  auth: process.env.PERSONAL_ACCESS_TOKEN, // Use the token passed from the workflow
  request: { fetch },
});

console.log("Authentication Token:", process.env.PERSONAL_ACCESS_TOKEN ? "Present" : "Missing");

const { data: repos } = await octokit.repos.listForOrg({
  org: "ABenoitOrg",
  type: "all",
});

for (const repo of repos) {
  console.log(`Checking repository: ${repo.name}`);
  await checkDeadlines("ABenoitOrg", repo.name);
}

async function checkDeadlines(owner, repo) {
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: "open",
    });

    for (const issue of issues) {
      const deadlineLabel = issue.labels.find(label => label.name.startsWith("deadline:"));
      if (!deadlineLabel) continue;

      const deadlineDate = new Date(deadlineLabel.name.replace("deadline:", "").trim());
      const today = new Date();
      const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 7 && daysLeft >= 0) {
        const message = daysLeft === 0
          ? "⏰ Today is the deadline for this issue!"
          : `⏰ Reminder: This issue is due in ${daysLeft} day(s).`;

        console.log(`Posting comment to issue #${issue.number} in ${repo}`);
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: issue.number,
          body: message,
        });
      }
    }
  } catch (error) {
    console.error("Error checking deadlines:", error.response?.data || error);
  }
}
