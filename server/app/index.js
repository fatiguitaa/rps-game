import express from "express"
import { createServer } from "node:http"
import path from "node:path"
import { Server } from "socket.io"
import { Player } from "./models/Player.js"
import cookieParser from "cookie-parser"

import { Room } from "./models/Room.js"
import { Movement } from "./models/Movement.js"
import { Match } from "./models/Match.js"
import { Round } from "./models/Round.js"

const app = express()
const server = createServer(app)

const PORT = process.env.PORT ?? 3000

const io = new Server(server)

let rooms = []

function createRoom(socket) {
    const roomId = Room.generateId(6, rooms)
    
    const room = new Room(roomId, socket.player)

    socket.player.roomId = room.id

    socket.join(room.id)

    rooms.push(room)

    socket.emit("room-created", {id: room.id})
}

function deleteRoom(roomId) {
    const roomIndex = rooms.findIndex(room => room.id == roomId)
    
    rooms.splice(roomIndex, 1)
}

function joinRoom(socket, id) {
    const room = rooms.find(room => room.id == id)
    const player = socket.player

    if (!room) return socket.emit("error", {error: "Room does not exists."})
    else {
        try {
            if (socket.player.roomId == room.id) throw new Error("You are already in this room.")
            const previousRoom = rooms.find(room => room.id == player.roomId)

            if (previousRoom.players.length <= Room.MIN_PLAYERS) {
                const previousRoomIndex = rooms.findIndex(room => room.id == previousRoom.id)

                rooms.splice(previousRoomIndex, 1)
            }

            room.players.push(socket.player)

            socket.leave(socket.player.roomId)
            socket.join(room.id)
            
            player.roomId = room.id
            
            io.to(room.id).emit("room-joined", {
                room: {
                    id: room.id,
                    players: room.players
                },
                player: {
                    id: socket.id,
                    name: player.name
                }
            })
        }
        catch (error) {
            socket.emit("error", {error: error.message})
        }
    }
}

function leaveRoom(socket) {
    const player = socket.player

    const room = rooms.find(r => r.id == player.roomId)

    if (!room) return socket.emit("error", {error: "Room does not exists."})
    
    try {
        if (room.players.length <= Room.MIN_PLAYERS) throw new Error("You can not leave the room with only one player.")
        
        room.players.remove(player)

        socket.leave(room.id)

        io.to(room.id).emit("room-leaved", {id: player.id})

        createRoom(socket)
    } catch (error) {
        socket.emit("error", {error: error.message})
    }
}

io.on("connection", socket => {
    let name = socket.handshake.auth.username

    socket.player = new Player({id: socket.id, name})

    createRoom(socket)
    
    socket.on("room-join", ({id}) => {
        joinRoom(socket, id)
    })

    socket.on("room-leave", () => {
        leaveRoom(socket)
    })

    socket.on("match-start", async () => {
        const player = socket.player
        const room = rooms.find(room => room.id === player.roomId)
        const match = room.match

        try {
            if (room.players.length < Room.MAX_PLAYERS) throw new Error("There is not enough players to play.")
            
            match.start()

            for (let i = 0; i < 1; i++) {
                io.to(room.id).emit("round-started", {roundNumber: i + 1, roundTime: Round.ROUND_TIME})

                const roundWinnerId = await match.playRound()

                if (!roundWinnerId) io.to(room.id).emit("round-tied")
                
                else {
                    const roundLoserId = room.players.find(player => player.id !== roundWinnerId).id

                    io.to(roundWinnerId).emit("round-won")
                    
                    io.to(roundLoserId).emit("round-lost")
                }
            }

            const matchWinnerId = match.winner(room.players)
            
            match.finish()

            if (!matchWinnerId) return io.to(room.id).emit("match-tied")
            
            const matchLoserId = room.players.find(player => player.id !== matchWinnerId).id
        
            io.to(matchWinnerId).emit("match-won")

            io.to(matchLoserId).emit("match-lost")

        } catch (error) {
            socket.emit("error", {error: error.message})
        }
        
    })

    socket.on("round-movement", (choiceId) => {
        const room = rooms.find(room => room.id === socket.player.roomId)
        const match = room.match


        if (!match.started) return socket.emit("error", {
            error: "Match has not started yet."
        })

        const currentRound = match.rounds[match.currentRoundIndex]
        const player = socket.player

        try {
            currentRound.movements.push(new Movement(player.id, choiceId))
        } catch (error) {
            socket.emit("error", {error: error.message})
        }
        
    })

    socket.on("disconnect", () =>{
        const playerId = socket.player.id
        const roomId = socket.player.roomId

        const room = rooms.find(room => room.id === roomId)

        if (room.players.length <= Room.MIN_PLAYERS) return deleteRoom(roomId)

        io.to(roomId).emit("room-leaved", {playerId})
    })
}) 

app.use("/css", express.static(path.join(process.cwd(), "client", "src", "css")))
app.use("/js", express.static(path.join(process.cwd(), "client", "src", "js")))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "client", "public", "index.html"))
})

app.get("/play", (req, res) => {
    const { username } = req.cookies

    if (!username) return res.redirect("/")

    // TODO: Validate player name

    res.sendFile(path.join(process.cwd(), "client", "public", "play.html"))
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