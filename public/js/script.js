
document.addEventListener("DOMContentLoaded", function () {
    const noButton = document.getElementById("no-button");
    const yesButton = document.getElementById("yes-button");
    const body = document.body;

    // No Button Moves Randomly
    noButton.addEventListener("mouseover", function () {
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 50);
        noButton.style.position = "absolute";
        noButton.style.left = `${x}px`;
        noButton.style.top = `${y}px`;
    });

    // Yes Button Click - Show Floating Hearts
    yesButton.addEventListener("click", function () {
        for (let i = 0; i < 10; i++) {
            let heart = document.createElement("div");
            heart.innerHTML = "❤️";
            heart.classList.add("heart");
            heart.style.left = Math.random() * 100 + "vw";
            heart.style.top = "50vh";
            body.appendChild(heart);

            // Remove heart after animation
            setTimeout(() => {
                heart.remove();
            }, 2000);
        }

        setTimeout(() => {
            alert("Yay! You said Yes! ❤️🎉");
        }, 1000);
    });
});
