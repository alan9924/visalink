import re
import emoji

def find_emojis(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    emojis = [c for c in content if c in emoji.EMOJI_DATA]
    if emojis:
        print(f"{filename}: Found emojis {set(emojis)}")

for f in ['index.html', 'dashboard.html', 'login.html', 'styles.css', 'app.js']:
    try:
        find_emojis(f)
    except Exception as e:
        print(f"Error {f}: {e}")
