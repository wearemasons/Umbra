const fs = require('fs');
const path = require('path');

// Read the file
const filePath = 'C:/Umbra/umbra/src/components/logo-cloud.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all img tags with Image components
content = content.replace(/<img\s+([^>]*?)\s*\/>/g, (match, attrs) => {
    // Convert the attributes to Image component format
    let imageAttrs = attrs
        // Replace height and width attributes
        .replace(/height="([^"]*)"/g, 'height={$1}')
        .replace(/width="auto"/g, 'width={100}');
    
    return `<Image ${imageAttrs} />`;
});

// Write the updated content back to the file
fs.writeFileSync(filePath, content);

console.log('All img tags replaced with Image components');