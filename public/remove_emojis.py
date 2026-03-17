import sys

def remove_emojis(text):
    import re
    # Match emojis and symbols, but keep ascii and common latin-1 (spanish accents)
    # Emojis are generally above U+2000, but some symbols like punctuations are in U+2000-U+206F
    # Let's use a regex that matches mostly emojis.
    # Alternatively, use a known emoji regex.
    emoji_pattern = re.compile(
        "["
        u"\U0001f600-\U0001f64f"  # emoticons
        u"\U0001f300-\U0001f5ff"  # symbols & pictographs
        u"\U0001f680-\U0001f6ff"  # transport & map symbols
        u"\U0001f1e0-\U0001f1ff"  # flags (iOS)
        u"\U00002702-\U000027b0"
        u"\U000024C2-\U0001F251"
        u"\u2b50"
        "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)

files_to_check = ['index.html', 'dashboard.html', 'login.html', 'styles.css', 'app.js']

for filename in files_to_check:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = remove_emojis(content)
    # Also look out for things like 📅, 📄, 🚀, 💬, ⚠️, 🛂, ✈️
    
    # We can also do a broader regex or just iterate through characters
    # Emojis are typically in the range of surrogates or above some Unicode.
    res = ""
    for char in content:
        code = ord(char)
        # Keep ascii, latin-1 supplement (for ñáéíóú), and general punctuation
        # Exclude common emoji ranges: Let's remove any character > 0x200D unless it's a specific punctuation.
        if code > 0x200D:
            if code in [0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2032, 0x2033, 0x2039, 0x203A, 0x2044, 0x20AC]:
                res += char
            else:
                pass # it's likely an emoji or weird symbol
        else:
            res += char
            
    if res != content:
        print(f"Removed characters from {filename}")
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(res)
    else:
        print(f"No changes for {filename}")

