/******************************************************************************************************
 * Data Server
 * Chris Biedermann
 * V1.0
 * November 2025
 * 
 * Links to app.js 
 * Link the actual server to routing code in app.js
 *******************************************************************************************************/

//App.js contains main functions
const app = require("./app");



//Start REST Server
console.log("Listening")
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`[SERVER] Server Started: Running on port ${port}`);
});