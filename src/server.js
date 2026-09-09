//src/server.js
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const cors = require('cors')

app.use(cors({
  origin: 'http://localhost:3000', // your frontend URL
  credentials: true,
}))

app.use('/api', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/spaces', require('./routes/spaces'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/booking-periods', require('./routes/bookingPeriods'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/event-days', require('./routes/eventDays'));
app.use('/api/availability', require('./routes/availability'));

app.get('/', (req, res) => {
  res.send('✅ RICEC Backend Running');
});

app.listen(process.env.PORT || 8080);