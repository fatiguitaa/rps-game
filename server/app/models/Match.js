import { Round } from "./Round.js"

export class Match {
    // static ROUND_TIME = 10000 // 10 seconds
    static MAX_ROUNDS = 6

    constructor() {
        this.started = false
        this.rounds = new Array(new Round(), new Round(), new Round(), new Round(), new Round(), new Round(), new Round())
        this.currentRoundIndex = 0
    }

    playRound() {
        if (this.roundsPlayed >= Match.MAX_ROUNDS) throw new Error("Max rounds reached.")

        this.currentRoundIndex++
    }

    start() {
        if (this.started) throw new Error("Match has already started.")
        
        this.started = true
    }
}