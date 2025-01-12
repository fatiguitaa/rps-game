import { Room } from "./Room.js"

export class PlayerList extends Array {
    constructor(creator) {
        super()
        this.push(creator)
    }

    push(player) {
        if (this.length >= Room.MAX_PLAYERS) throw new Error("Room is full.")

        super.push(player)
    }

    remove(player) {
        const playerIndex = this.findIndex(p => p.id == player.id)
        
        if (playerIndex === -1) throw new Error("Player not found.")

        this.splice(playerIndex, 1)
    }
}