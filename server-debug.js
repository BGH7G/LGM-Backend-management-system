const express = require('express');
// Try to load the router index. 
// Note: You might need to adjust the path if you place this script in a different folder.
// Assuming this script is in the root 'dataweboflgm' folder, same as app.js
try {
    const router = require('./router/index');
    console.log("Successfully loaded router/index.js");

    console.log("Inspecting Router Stack:");
    let found = false;
    router.stack.forEach(layer => {
        if (layer.route) {
            console.log(`Route: ${layer.route.path}`);
        } else if (layer.name === 'router') {
            // For router.use('/path', subRouter), the layer.regexp shows the path.
            const pathRegex = layer.regexp.toString();
            console.log(`Sub-router detected: ${pathRegex}`);
            if (pathRegex.includes('datasheet')) {
                found = true;
                console.log(">>> FOUND 'datasheet' router! <<<");
            }
        }
    });

    if (!found) {
        console.error("!!! 'datasheet' router NOT found in the stack. !!!");
        console.error("Please check router/index.js content on this server.");
    }

} catch (e) {
    console.error("Failed to load router/index.js:", e);
}
