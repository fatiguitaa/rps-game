const io = new Server(server)

let rooms = []

function joinRoom(socket, id) {
    if (!id) {
        id = rooms.length + 1

        rooms.push(id)

        socket.join(id)

        socket.emit("room-join", {id})
    }
    else {
        const room = rooms.find(room => room == id)
        if (!room) return socket.emit("error", {error: "Room does not exists."})

        else {
            socket.join(room)
            io.to().emit("room-join", {id})
        }
    }
}

io.on("connection", socket => {
    joinRoom(socket)

    socket.on("room-join", ({id}) => {
        joinRoom(socket, id)
    })

}) 