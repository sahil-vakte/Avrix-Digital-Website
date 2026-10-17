SERVICES = [
    "performance-marketing",
    "ga4-consulting",
    "web-development",
    "web-application-development",
    "ai-automation",
    "microsoft-365-copilot",
    "google-workspace",
    "aws-consulting",
    "talent-acquisition",
    "voice-call-agent",
    "wims",
    "hr-desk",
    "not-sure",
]
BUDGETS = ["under-1k", "1k-3k", "3k-5k", "5k-10k", "10k-plus", "monthly-retainer", "not-sure"]
TIMELINES = ["asap", "1-3-months", "3-6-months", "exploring"]
CONTACTS = ["email", "phone", "video-call"]
STATUSES = ["new", "contacted", "qualified", "proposal-sent", "won", "lost", "spam"]
PRIORITIES = ["low", "normal", "high"]


def choices(values):
    return [(v, v.replace("-", " ").title()) for v in values]
