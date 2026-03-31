const fs = require('fs');
const path = require('path');

function deleteGitkeep(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      deleteGitkeep(fullPath);
    } else if (item === '.gitkeep') {
      fs.unlinkSync(fullPath);
      console.log('Deleted:', fullPath);
    }
  }
}

deleteGitkeep('backend');
deleteGitkeep('frontend');

// Also delete setup script if exists
if (fs.existsSync('delete-gitkeep.js')) {
  fs.unlinkSync('delete-gitkeep.js');
  console.log('Deleted: delete-gitkeep.js');
}

console.log('Cleanup done!');
