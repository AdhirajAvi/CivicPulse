let ioRef;

export function attachSockets(io) {
  ioRef = io;

  io.on('connection', (socket) => {
    socket.emit('socket:ready', { id: socket.id });
  });
}

export function getIo() {
  return ioRef;
}
