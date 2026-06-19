import os

directory = "/Users/stormyforrester/cloudsocialwork"
files = [f for f in os.listdir(directory) if f.endswith(".html")]

email_target = "<p>mmcgowan1@outlook.com</p>"
email_replacement = '<a href="mailto:mmcgowan1@outlook.com" class="footer-link">mmcgowan1@outlook.com</a>'

phone_target = "<p>0451 011 473</p>"
phone_replacement = '<a href="tel:0451011473" class="footer-link">0451 011 473</a>'

for f in files:
    path = os.path.join(directory, f)
    with open(path, "r") as file:
        content = file.read()
    
    modified = False
    if email_target in content:
        content = content.replace(email_target, email_replacement)
        modified = True
    if phone_target in content:
        content = content.replace(phone_target, phone_replacement)
        modified = True
        
    if modified:
        with open(path, "w") as file:
            file.write(content)

print("Replaced text with links")
