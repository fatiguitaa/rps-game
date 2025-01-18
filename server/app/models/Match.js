import { Round } from "./Round.js"

export class Match {
    static MAX_ROUNDS = 6

    constructor() {
        this.started = false
        this.rounds = new Array(new Round(), new Round(), new Round(), new Round(), new Round(), new Round(), new Round())
        this.currentRoundIndex = -1
        this.winnerId = undefined
    }

    start() {
        if (this.started) throw new Error("Match has already started.")
        
        this.started = true
    }

    playRound() {
        if (this.currentRoundIndex >= Match.MAX_ROUNDS) throw new Error("Max rounds reached.")

        this.currentRoundIndex++

        return new Promise((resolve) => {
            setTimeout(() => {
                const round = this.rounds[this.currentRoundIndex]
                
                const winnerId = round.winner()

                resolve(winnerId)
            }, Round.ROUND_TIME)
        })
    }

    winner(players) {
        const player1 = players[0]
        const player2 = players[1]

        const player1Wins = this.rounds.filter(round => round.winnerId == player1.id)
        const player2Wins = this.rounds.filter(round => round.winnerId == player2.id)

        if (player1Wins > player2Wins) this.winnerId = player1.id
        else if (player2Wins > player1Wins) this.winnerId = player2.id
        
        return this.winnerId
    }

    finish() {
        this.started = false
        this.rounds = new Array(new Round(), new Round(), new Round(), new Round(), new Round(), new Round(), new Round())
        this.currentRoundIndex = -1
        this.winnerId = undefined
    }
}