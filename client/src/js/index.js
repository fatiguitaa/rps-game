
import {$, $$} from "./utils/domUtils.js"

const showError = function(message) {
    $(".login__error").textContent = message
    $(".login__error").classList.remove("hidden")
}

$("#login__submit").addEventListener("click", async function(event) {
    event.preventDefault()

    const username = $("#login__username").value

    if (!username) return
    
    await fetch("http://localhost:3000/players", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({name: username})
    }).then(response => {
        if (response.ok) window.location.href = "http://localhost:3000/play"
    })

})