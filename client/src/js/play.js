import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js"
import { $, $$ } from "./utils/domUtils.js"

const username = getCookie("username")

const socket = io({
    auth: {
        username
    }
})

function displayErrorMessage(innerHTML) {
    const domMessages = $(".messages")

    const errorMessage = document.createElement("li")

    errorMessage.classList.add("error")

    errorMessage.innerHTML = innerHTML

    domMessages.appendChild(errorMessage)

    setTimeout(() => {
        errorMessage.remove()
    }, 2000);
}

function displaySuccessMessage(innerHTML) {
    const domMessages = $(".messages")

    const succesMessage = document.createElement("li")

    succesMessage.classList.add("success")

    succesMessage.innerHTML = innerHTML

    domMessages.appendChild(succesMessage)

    setTimeout(() => {
        succesMessage.remove()
    }, 2000);
}

function displayEnemyInfo(enemy) {
    $("#enemy__name").textContent = enemy.name
}

function runTimer(seconds) {
    const timer = setInterval(() => {
        seconds--

        if (seconds < 0) {
            clearInterval(timer)
            $(".timer__time").textContent = 10
            return;
        }
        else if (seconds < 10) {
            seconds = "0" + seconds
        }
        
        $(".timer__time").textContent = seconds;
        
    }, 1000)
}

function disableChoices() {
    $$('.match__choice__options input[type="radio"]').forEach((choice) => {
        choice.disabled = true
    })
}

function enableChoices() {
    $$('.match__choice__options input[type="radio"]').forEach((choice) => {
        choice.disabled = false
    })
}

function matchWon(text) {
    const matchResultDiv = $(".match__result")

    const matchResultTitle = $(".match__result__title")

    matchResultTitle.textContent = text

    matchResultDiv.classList.add("won")

    setTimeout(() => {
        $(".match__result").classList.remove("won")
    }, 3000);
}

function matchTied(text) {
    const matchResultDiv = $(".match__result")

    const matchResultTitle = $(".match__result__title")

    matchResultTitle.textContent = text

    matchResultDiv.classList.add("tied")

    setTimeout(() => {
        $(".match__result").classList.remove("tied")
    }, 3000);
}

function matchLost(text) {
    const matchResultDiv = $(".match__result")

    const matchResultTitle = $(".match__result__title")

    matchResultTitle.textContent = text

    matchResultDiv.classList.add("lost")

    setTimeout(() => {
        $(".match__result").classList.remove("lost")
    }, 3000);
}

socket.on("room-created", ({id}) => {
    document.body.classList.remove("full")

    $("#room__info__id").textContent = id
})

socket.on("room-joined", (event) => {
    const enemy = event.room.players.find(player => player.id !== socket.id)

    if (event.player.id === socket.id) {
        $("#room__info__id").textContent = event.room.id
        displaySuccessMessage(`You just joined to room <span class="special">${event.room.id}</span>.`)
    }
    else {
        displaySuccessMessage(`Player <span class="special">${enemy.name}</span> just joined.`)
    }

    document.body.classList.add("full")

    displayEnemyInfo(enemy)
})

socket.on("room-leaved", ({name}) => {
    document.body.classList.remove("full")
    displayErrorMessage(`Player <span class="special">${name}</span> just leaved.`)
})

socket.on("match-started", ({totalRounds}) => {
    const lastMatchRounds = $$(".match__rounds__result .round")

    if (lastMatchRounds) {
        lastMatchRounds.forEach(round => {
            round.remove()
        })
    }

    for (let i = 0 ; i < totalRounds ; i++) {
        const roundElement = document.createElement("li")

        roundElement.classList.add("round")

        $(".match__rounds__result").appendChild(roundElement)
    }

})

socket.on("round-started", ({roundNumber, roundTime}) => {
    enableChoices()

    const inputChecked = $('input[type="radio"]:checked')

    if (inputChecked) inputChecked.checked = false

    $("#match__choice__send").classList.remove("sent")

    displaySuccessMessage(`Round <span class=special>${roundNumber}</span> started.`)

    document.body.classList.add("started")

    let seconds = roundTime / 1000

    runTimer(seconds)
})

socket.on("round-won", ({roundNumber}) => {
    $(`.match__rounds__result .round:nth-child(${roundNumber})`).classList.add("won")
})

socket.on("round-tied", ({roundNumber}) => {
    $(`.match__rounds__result .round:nth-child(${roundNumber})`).classList.add("tied")
})

socket.on("round-lost", ({roundNumber}) => {
    $(`.match__rounds__result .round:nth-child(${roundNumber})`).classList.add("lost")
})

socket.on("match-won", () => {
    document.body.classList.remove("started")
    
    matchWon("You won!")
    
})

socket.on("match-tied", () => {
    document.body.classList.remove("started")

    matchTied("Match tied!")
})

socket.on("match-lost", () => {
    document.body.classList.remove("started")

    matchLost("You lost!")
})
 
socket.on("error", ({error}) => {
    displayErrorMessage(error)
})

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

$("#room__info__copy").addEventListener("click", () => {
    const roomId = $("#room__info__id").textContent

    navigator.clipboard.writeText(roomId)
})

$("#enemy__play").addEventListener("click", () => {
    socket.emit("match-start")
})

$("#room__connection__join").addEventListener("click", (event) => {
    event.preventDefault()

    const roomId = $("#room__connection__search").value

    if (!roomId) return

    $("#room__connection__search").value = ""

    socket.emit("room-join", {id: roomId})
})

$("#match__choice__send").addEventListener("click", () => {
    const choiceId = $('input[name="choices"]:checked').value

    socket.emit("round-movement", choiceId)

    $("#match__choice__send").classList.add("sent")

    disableChoices()
})