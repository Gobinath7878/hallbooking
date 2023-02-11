const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));


const port=process.env.PORT || 8000;
// parse application/json
app.use(bodyParser.json());

const msg="<div><h1>A home away from home</h1><p>1. List of Rooms (/rooms)</p><p>2. List the customers (/customers)</p><img src=https://img.freepik.com/free-photo/elegant-hotel-room-with-big-bed_1203-1494.jpg?w=740&t=st=1676112015~exp=1676112615~hmac=486c29213bab38dd67fae57a10a50b2aa98541e105d0c479e79055181311bc84 src=img ></img></div>"

app.get('/', function (req, res) {
    res.send(`${msg}`);
  })


let bookings = [{
  customerName: "John Doe",
  roomName: "Conference Room A",
  date: "2023-03-15",
  startTime: "14:00",
  endTime: "17:00"
}];

// room static data
let rooms =[
  {
    "roomName": "Conference Room A",
    "numSeats": 20,
    "amenities": ["projector", "whiteboard", "Wi-Fi"],
    "pricePerHour": 50,
    "id":1
  },
  {
    "roomName": "Conference Room B",
    "numSeats": 30,
    "amenities": ["projector", "whiteboard", "Wi-Fi"],
    "pricePerHour": 70,
    "id":2
  },
  {
    "roomName": "Conference Room C",
    "numSeats": 40,
    "amenities": ["projector", "whiteboard", "Wi-Fi"],
    "pricePerHour": 100,
    "id":3
  },
  {
    "roomName": "Conference Room D",
    "numSeats": 50,
    "amenities": ["projector", "whiteboard", "Wi-Fi"],
    "pricePerHour": 150,
    "id":4
  }
    
    
]
// create rooms
app.post('/create-room', (req, res) => {
  const { roomName, numSeats, amenities, pricePerHour,id } = req.body;
  const room = {
    roomName,
    numSeats,
    amenities,
    pricePerHour,
    id,
  };
  rooms.push(room);
  res.send(`Room "${roomName}" created successfully`);
});

// booking rooms
app.post('/book-room', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    return res.status(404).send('Room not found');
  }

  const conflictingBooking = bookings.find(b => b.roomName === room.roomName && b.date === date && ((b.startTime >= startTime && b.startTime < endTime) || (b.endTime > startTime && b.endTime <= endTime)));
  if (conflictingBooking) {
    return res.status(400).send(`Room "${room.roomName}" is already booked on ${date} from ${conflictingBooking.startTime} to ${conflictingBooking.endTime}`);
  }

  const booking = {
    customerName,
    roomName: room.roomName,
    date,
    startTime,
    endTime
  };
  bookings.push(booking);
  res.send(`Room "${room.roomName}" booked successfully for ${customerName}`);
});

// get rooms
app.get('/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => {
    const roomBookings = bookings.filter(b => b.roomName === room.roomName);
    return {
      roomName: room.roomName,
      numSeats: room.numSeats,
      amenities: room.amenities,
      pricePerHour: room.pricePerHour,
      booked: roomBookings.length > 0,
      bookings: roomBookings
    };
  });
  res.json(roomsWithBookings);
});

//customers list
app.get('/customers', (req, res) => {
  const customersWithBookings = bookings.reduce((customers, booking) => {
    const customer = customers.find(c => c.customerName === booking.customerName);
    if (customer) {
      customer.bookings.push(booking);
    } else {
      customers.push({
        customerName: booking.customerName,
        bookings: [booking]
      });
    }
    return customers;
  }, []);
  res.json(customersWithBookings);
});

app.listen(port, () => {
  console.log('Hall booking app listening on port',port);
});
