export class  MovementList extends Array {
    push(movement) {
        if (super.some(m => m.playerId === movement.playerId)) throw new Error("You already made a movement.")

        super.push(movement)
    }
}