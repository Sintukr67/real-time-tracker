const express = require("express");
const app = express();
const path = require("path");

//step-2->this is the boiler plate of socketio
const http = require("http"); //socket run on http server so we need to create it
const socketio = require("socket.io");
const server = http.createServer(app); //now http server is created
const io = socketio(server); //socketio is a function now i am calling it

//step-3-> now setup the ejs
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Keep track of last known locations for active connections
const activeLocations = new Map();
const activeNumbers = new Map();

function allocateNumber() {
  const used = new Set(activeNumbers.values());
  let n = 1;
  while (used.has(n)) n++;
  return n;
}

io.on("connection", function (socket) {
  // assign a stable small number to each connection
  const number = allocateNumber();
  activeNumbers.set(socket.id, number);
  // Provide active locations when client requests them (avoids race with client listener setup)
  socket.on("request-active-locations", function () {
    socket.emit(
      "active-locations",
      Array.from(activeLocations.entries()).map(([id, loc]) => ({
        id,
        number: activeNumbers.get(id) || null,
        ...loc,
      }))
    );
  });

  socket.on("send-location", function (data) {
    //here we have received from socket to backend and now
    activeLocations.set(socket.id, { latitude: data.latitude, longitude: data.longitude });
    io.emit("receive-location", { id: socket.id, number: activeNumbers.get(socket.id), ...data }); //...data is spread operator lat,long,zoom, // here from backend we are sending to frontend
    // io.emit se kya hoga jitne log connected honge sabko location dikhengi
  });

  socket.on("disconnect", function () {
    activeLocations.delete(socket.id);
    activeNumbers.delete(socket.id);
    io.emit("user-disconnected", socket.id);
  });
  // console.log('connected');
});

app.get("/", (req, res) => {
  res.render("index");
});

// app.listen(3000);
server.listen(3000);
