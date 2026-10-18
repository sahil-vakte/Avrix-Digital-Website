#!/usr/bin/python3
"""Forced SSH command: no shell, forwarding, uploads elsewhere or arbitrary sudo."""

import os
import re
import sys

command = os.environ.get("SSH_ORIGINAL_COMMAND", "")
match = re.fullmatch(r"deploy ([0-9a-f]{40})", command)
if not match:
    sys.exit("Only an Avrix deployment with a full commit SHA is allowed.")
os.execv("/usr/bin/sudo", ["sudo", "-n", "/usr/local/sbin/avrix-deploy", match[1]])
