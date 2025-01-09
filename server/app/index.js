import express from "express"
import { createServer } from "node:http"
import path from "node:path"
import { Server } from "socket.io"
import { Player } from "./models/Player.js"
import cookieParser from "cookie-parser"

import { Room } from "./models/Room.js"

const app = express()
const server = createServer(app)

const PORT = process.env.PORT ?? 3000

const io = new Server(server)

let rooms = []

function joinRoom(socket, id) {
    const room = rooms.find(room => room.id == id)

    if (!room) return socket.emit("error", {error: "Room does not exists."})
    else {
        try {
            if (socket.player.roomId == room.id) throw new Error("You are already in this room.")

            room.playerList.add(socket.player)

            socket.leave(socket.player.roomId)
            socket.join(room.id)
            
            socket.player.roomId = room.id
            
            
            io.to(room.id).emit("room-joined", {
                room: {
                    id: room.id,
                    players: room.playerList.players
                },
                player: {
                    id: socket.id,
                    name: socket.player.name
                }
            })
        }
        catch (error) {
            socket.emit("error", {error: error.message})
        }
    }
}

function createRoom(socket) {
    const room = new Room(socket.player)

    socket.player.roomId = room.id

    socket.join(room.id)

    rooms.push(room)

    socket.emit("room-created", {id: room.id})
}

io.on("connection", socket => {
    let name = socket.handshake.auth.username

    try {
        Player.validate({name})
    }
    catch (error) {
        return socket.emit("error", {error: error.message})
    }
    socket.player = new Player({id: socket.id, name})

    createRoom(socket)
    
    socket.on("room-join", ({id}) => {
        joinRoom(socket, id)
    })

    socket.on("match-start", () => {

    })
}) 

app.use("/css", express.static(path.join(process.cwd(), "client", "src", "css")))
app.use("/js", express.static(path.join(process.cwd(), "client", "src", "js")))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd() + "/client/public/index.html"))
})

app.get("/play", (req, res) => {
    const { username } = req.cookies

    if (!username) return res.redirect("/")

    res.sendFile(path.join(process.cwd(), "/client/public/play.html"))
})

app.post("/players", (req, res) => {
    const player = req.body

    try {
        Player.validate(player)

        return res.cookie("username", player.name).send()
    }
    catch (error) {
        return res.status(400).json({error: error.message})
    }
})

server.listen(PORT, () => {
    console.log("Listening on: http://localhost:3000")
})