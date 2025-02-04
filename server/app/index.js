import express from "express"
import { createServer } from "node:http"
import path from "node:path"
import { Server } from "socket.io"
import cookieParser from "cookie-parser"

import { Player } from "./models/Player.js"
import { Room } from "./models/Room.js"
import { Movement } from "./models/Movement.js"
import { Match } from "./models/Match.js"
import { Round } from "./models/Round.js"

const app = express()
const server = createServer(app)

const PORT = process.env.PORT ?? 3000

const io = new Server(server)

let rooms = new Map()

function createRoom(socket) {
    const id = Room.generateId(rooms)
    
    const room = new Room(id, socket.player)

    socket.player.roomId = room.id

    socket.join(id)

    rooms.set(id, room)

    socket.emit("room-created", {id})
}

function joinRoom(socket, id) {
    const room = rooms.get(id)
    const player = socket.player

    try {
        if (player.roomId == id) throw new Error("You are already in this room.")

        if (!room) throw new Error("Room does not exists.")
        
        const previousRoom = rooms.get(player.roomId)

        if (!previousRoom.isFull()) {
            rooms.delete(previousRoom.id)
        }
        else {
            io.to(previousRoom.id).emit("room-leaved", {name: player.name})
        }

        room.players.push(player)
        
        socket.leave(previousRoom.id)

        socket.join(room.id)
        
        player.roomId = id
        
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

io.on("connection", socket => {
    let name = socket.handshake.auth.username

    socket.player = new Player({id: socket.id, name})

    createRoom(socket)
    
    socket.on("room-join", ({id}) => {
        joinRoom(socket, id)
    })

    socket.on("match-start", async () => {
        const player = socket.player
        const room = rooms.get(player.roomId)
        const match = room.match

        try {
            if (!room.isFull()) throw new Error("There is not enough players to play.")
            
            io.to(room.id).emit("match-started", {totalRounds: Match.MAX_ROUNDS})

            match.start()

            for (let i = 0; i < Match.MAX_ROUNDS; i++) {
                if (!match.started) return

                io.to(room.id).emit("round-started", {roundNumber: i + 1, roundTime: Round.ROUND_TIME})

                const roundWinnerId = await match.playRound().catch()

                if (!roundWinnerId) io.to(room.id).emit("round-tied", {roundNumber: match.currentRoundIndex + 1})
                
                else {
                    const roundLoserId = room.players.find(player => player.id !== roundWinnerId).id

                    io.to(roundWinnerId).emit("round-won", {roundNumber: match.currentRoundIndex + 1})
                    
                    io.to(roundLoserId).emit("round-lost", {roundNumber: match.currentRoundIndex + 1})
                }
            }

            const matchWinnerId = match.winner(room.players)
            
            match.finish()

            if (!matchWinnerId) return io.to(room.id).emit("match-tied")
            
            const matchLoser = room.players.find(player => player.id !== matchWinnerId)
        
            io.to(matchWinnerId).emit("match-won")

            io.to(matchLoser.id).emit("match-lost")

        } catch (error) {
            socket.emit("error", {error: error.message})
        }
        
    })

    socket.on("round-movement", (choiceId) => {
        try {
            const player = socket.player
            const room = rooms.get(player.roomId)
            const match = room.match
    
            if (!match.started) throw new Error("Match has not started yet.")
    
            const currentRound = match.rounds[match.currentRoundIndex]
            currentRound.movements.push(new Movement(player.id, choiceId))

        } catch (error) {
            socket.emit("error", {error: error.message})
        }
        
    })

    socket.on("disconnect", () =>{
        const player = socket.player

        const room = rooms.get(player.roomId) 

        if (!room.isFull()) return rooms.delete(player.roomId)
        
        room.players.remove(player)
        
        io.to(player.roomId).emit("room-leaved", {name: player.name})

        const match = room.match

        if (match.started) {
            io.to(player.roomId).emit("match-won")
            match.finish()
        }
    })
}) 

app.use("/svg", express.static(path.join(process.cwd(), "client", "public", "svg")))
app.use("/css", express.static(path.join(process.cwd(), "client", "src", "css")))
app.use("/js", express.static(path.join(process.cwd(), "client", "src", "js")))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.sendFile(path.join(process.cwd(), "client", "public", "index.html"))
})

app.get("/play", (req, res) => {
    const { username } = req.cookies

    try {
        Player.validate({name: username})

        res.sendFile(path.join(process.cwd(), "client", "public", "play.html"))
    }
    catch(error) {
        res.redirect("/")
    }

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