const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

menuButton.addEventListener("click", () => {

    const isOpen =
        mobileMenu.classList.toggle("open");

    menuButton.setAttribute(
        "aria-expanded",
        isOpen
    );

});


const mobileLinks =
    mobileMenu.querySelectorAll("a");

mobileLinks.forEach((link) => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});


document.getElementById("year").textContent =
    new Date().getFullYear();