const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

const razorpayRoutes = require('./routes/razorpay');
app.use('/api/razorpay', razorpayRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
