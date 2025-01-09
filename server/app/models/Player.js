import zod from "zod"

export class Player {
    static #MAX_NAME_LENGTH = 15

    static #playerSchema = zod.object({
        name: zod.string().max(this.#MAX_NAME_LENGTH)
    })

    constructor({id, name}) {
        this.id = id
        this.name = name
        this.roomId = undefined
    }

    static validate(player) {
        const isValid = this.#playerSchema.safeParse(player)

        if (!isValid.success) throw new Error(isValid.error)
    }
}