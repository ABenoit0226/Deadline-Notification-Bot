import requests
import os
from datetime import datetime, timedelta

# GitHub API Token
GITHUB_TOKEN = os.getenv("PERSONAL_ACCESS_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"}

# Organization and repository details
ORG = ""  # Replace with organization name
OWNER = "ABenoit0226"  # Replace with owner name
REPO = "Deadline-Notification-Bot"  # Replace with repository name


def get_repos(org):
    url = f"https://api.github.com/orgs/{org}/repos"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error fetching repositories:", response.json())
        return []


def get_issues(owner, repo):
    url = f"https://api.github.com/repos/{owner}/{repo}/issues?state=open"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 404:
        print(f"Repository {owner}/{repo} not found. Check if the repository name is correct.")
        return []
    try:
        issues = response.json()
        if isinstance(issues, list):
            return issues
        else:
            print("Unexpected response format for issues:", issues)
            return []
    except ValueError:
        print("Failed to parse JSON response for issues.")
        return []


def post_comment(owner, repo, issue_number, message):
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}/comments"
    data = {"body": message}
    response = requests.post(url, json=data, headers=HEADERS)
    return response.json()


def get_date_difference_in_days(date1, date2):
    return (date2 - date1).days


def check_deadlines(owner, repo):
    today = datetime.today()
    issues = get_issues(owner, repo)
    
    for issue in issues:
        if not isinstance(issue, dict):
            print("Skipping unexpected issue format:", issue)
            continue
        
        issue_number = issue.get("number")
        title = issue.get("title", "Unknown Title")
        print(f"Checking issue #{issue_number}: {title}")
        
        assignees = ", ".join([f"@{assignee['login']}" for assignee in issue.get("assignees", [])])
        labels = {label["name"]: label["name"] for label in issue.get("labels", [])}
        
        deadline_label = next((label for label in labels if label.startswith("deadline:")), None)
        reviewer_label = next((label for label in labels if label.startswith("reviewer:")), None)
        
        if deadline_label:
            deadline_string = deadline_label.replace("deadline:", "").strip()
            try:
                deadline_date = datetime.strptime(deadline_string, "%Y-%m-%d")
            except ValueError:
                print(f"Invalid date format for issue #{issue_number}: {deadline_string}")
                continue
            
            days_left = get_date_difference_in_days(today, deadline_date)
            
            print(f"Issue #{issue_number} has a deadline in {days_left} days")
            
            if days_left in [7, 1, 0]:
                message = "⏰ Today is the deadline for this issue!" if days_left == 0 else f"⏰ Reminder: This issue is due in {days_left} day(s)."
                post_comment(owner, repo, issue_number, f"{assignees} {message}")
                print(f"Comment posted on issue #{issue_number}")
            
            if days_left < 0 and reviewer_label:
                reviewer = reviewer_label.replace("reviewer:", "").strip()
                post_comment(owner, repo, issue_number, f"@{reviewer} The deadline for this issue has passed.")
                print(f"Late notification sent to reviewer {reviewer} for issue #{issue_number}")
        else:
            print(f"No deadline label found on issue #{issue_number}")


if ORG:
    repos = get_repos(ORG)
    for repo in repos:
        if isinstance(repo, dict) and "name" in repo:
            print(f"Checking repository: {repo['name']}")
            check_deadlines(ORG, repo['name'])
        else:
            print("Skipping invalid repository format:", repo)
elif OWNER and REPO:
    check_deadlines(OWNER, REPO)
