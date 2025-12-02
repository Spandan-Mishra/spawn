const express = require('express');

const app = express();

app.listen(3001, () => {
    console.log("Spawn Backend started on port 3001");
})