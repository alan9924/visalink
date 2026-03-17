const fs = require('fs');

const files = ['index.html', 'dashboard.html', 'login.html', 'styles.css', 'app.js'];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Use regex to remove emojis and emoji presentations
    // \p{Emoji_Presentation} gets things that render as emojis
    // \p{Extended_Pictographic} gets other emojis
    let newContent = content.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
    
    if (newContent !== content) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`Removed emojis from ${file}`);
    } else {
      console.log(`No emojis found in ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
  }
});
