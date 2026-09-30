#!/usr/bin/env python3
"""
Remove all "Brevo" mentions from user-facing code.
Keep Brevo ONLY in platform-settings.tsx (superadmin-only view).

Also rename internal field names:
  brevoMessageId -> messageId
  brevoStatus -> deliveryStatus
  brevoDotColor -> deliveryDotColor
  msg_brevo_ -> msg_
"""

import os
import re

ROOT = "/home/z/my-project/src"

# Files to process (everything EXCEPT platform-settings.tsx)
files_to_process = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    for fn in filenames:
        if fn.endswith((".ts", ".tsx")):
            fullpath = os.path.join(dirpath, fn)
            # Skip platform-settings.tsx — superadmin only, Brevo stays
            if "platform-settings" in fullpath:
                continue
            files_to_process.append(fullpath)

# Also process layout.tsx (meta tags)
layout_path = "/home/z/my-project/src/app/layout.tsx"
if layout_path not in files_to_process:
    files_to_process.append(layout_path)

# Text replacements (case-sensitive, order matters)
text_replacements = [
    # Specific phrases first (longer matches first)
    ("powered by Brevo webhooks", "real-time email tracking"),
    ("Brevo webhook live", "Email tracking live"),
    ("Brevo connected", "Email delivery active"),
    ("Brevo transactional", "Transactional email"),
    ("Send via Brevo", "Send for signature"),
    ("via Brevo", "via email"),
    ("Brevo delivers the email", "The email is delivered to the recipient"),
    ("Brevo will deliver the email", "The email will be delivered"),
    ("Brevo accepted the message for delivery", "Email accepted for delivery"),
    ("Brevo accepted the message", "Email accepted for delivery"),
    ("Simulate Brevo dispatch", "Simulate email dispatch"),
    ("dispatched to " , "dispatched to "),  # no-op, just keeping
    ("Brevo delivered ", "Email delivered "),
    ("Brevo integration", "Email integration"),
    ("Brevo: ", "Email: "),
    ("Brevo.", "Email service."),
    # Field/function renames
    ("brevoMessageId", "messageId"),
    ("brevoStatus", "deliveryStatus"),
    ("brevoDotColor", "deliveryDotColor"),
    ("msg_brevo_", "msg_"),
    # Actor name in events (when it appears as a standalone string value)
    ('actor: "Brevo"', 'actor: "Email Service"'),
    ('"Brevo"', '"Email Service"'),
    # Remaining standalone "Brevo" references
    ("Brevo webhooks", "email webhooks"),
    ("Brevo webhook", "email webhook"),
    ("Brevo dispatch", "email dispatch"),
    ("Brevo will", "The email will"),
    ("Brevo", "Email Service"),
]

# Also process the comment in shell.tsx
comment_replacements = [
    ("Status pill — Brevo health", "Status pill — email health"),
]

changed_files = []

for filepath in sorted(files_to_process):
    with open(filepath, "r") as f:
        original = f.read()

    content = original

    # Apply text replacements
    for old, new in text_replacements:
        content = content.replace(old, new)

    # Apply comment replacements
    for old, new in comment_replacements:
        content = content.replace(old, new)

    if content != original:
        with open(filepath, "w") as f:
            f.write(content)
        changed_files.append(filepath)

print(f"Processed {len(files_to_process)} files")
print(f"Changed {len(changed_files)} files:")
for f in changed_files:
    # Show relative path
    rel = f.replace("/home/z/my-project/", "")
    print(f"  ✓ {rel}")
