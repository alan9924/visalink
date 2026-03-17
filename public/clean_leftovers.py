import os

files_to_check = ['index.html', 'dashboard.html', 'login.html', 'styles.css', 'app.js']

for f in files_to_check:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove U+FE0F (Variation Selector-16) and any other invisible leftovers
        new_content = content.replace('\uFE0F', '')
        
        # Are there any other emojis? Let's aggressively remove any chars in surrogate blocks or typical emoji ranges
        # Just to be absolutely certain no emoji is left. 
        # Range of emojis includes: 1F300-1F5FF, 1F600-1F64F, 1F680-1F6FF, 2600-26FF, 2700-27BF
        import re
        new_content = re.sub(r'[\U0001F300-\U0001F64F\U0001F680-\U0001F6FF\u2600-\u26FF\u2700-\u27BF]', '', new_content)
        
        if new_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Cleaned {f}")
        else:
            print(f"No more emojis in {f}")
