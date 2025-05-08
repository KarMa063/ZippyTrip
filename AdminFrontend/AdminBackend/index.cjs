const express = require('express');
const bodyParser = require('body-parser');
const { router, attractionTableExists } = require('./Attractions.cjs');
const cors = require('cors'); // <-- Add this line

const app = express();
const port = 3000;

app.use(cors()); // <-- Add this line
app.use(bodyParser.json());
app.use('/attractions', router);

// Ensure table exists before starting server
attractionTableExists().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});