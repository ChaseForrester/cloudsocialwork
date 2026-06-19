import os

directory = "/Users/stormyforrester/cloudsocialwork"
files = [f for f in os.listdir(directory) if f.endswith(".html")]

for f in files:
    path = os.path.join(directory, f)
    with open(path, "r") as file:
        content = file.read()
    
    # Replace all occurrences of btn-primary with btn-cta
    if "btn-primary" in content:
        content = content.replace("btn-primary", "btn-cta")
        with open(path, "w") as file:
            file.write(content)

print("Replaced all btn-primary with btn-cta")
