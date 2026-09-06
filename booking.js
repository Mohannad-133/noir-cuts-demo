const services = {

    classic: {
        name: "Classic Cut",
        price: 25,
        duration: 30
    },

    fade: {
        name: "Skin Fade",
        price: 30,
        duration: 45
    },

    hairbeard: {
        name: "Hair & Beard",
        price: 40,
        duration: 60
    },

    beard: {
        name: "Beard Styling",
        price: 18,
        duration: 30
    }

};


const openingHours = {

    1: { start: "10:00", end: "19:00" },
    2: { start: "10:00", end: "19:00" },
    3: { start: "10:00", end: "19:00" },
    4: { start: "10:00", end: "20:00" },
    5: { start: "10:00", end: "20:00" },
    6: { start: "10:00", end: "18:00" }

};


const serviceSelect =
    document.getElementById("service");

const bookingDate =
    document.getElementById("bookingDate");

const timeSlots =
    document.getElementById("timeSlots");

const bookingForm =
    document.getElementById("bookingForm");

const bookingSummary =
    document.getElementById("bookingSummary");

const bookingSuccess =
    document.getElementById("bookingSuccess");

const successText =
    document.getElementById("successText");


let selectedTime = null;



// HEUTIGES DATUM ALS MINIMUM

const today =
    new Date();

const todayString =
    today.toISOString().split("T")[0];

bookingDate.min =
    todayString;



// MAXIMAL 30 TAGE IM VORAUS

const maxDate =
    new Date();

maxDate.setDate(
    maxDate.getDate() + 30
);

bookingDate.max =
    maxDate
        .toISOString()
        .split("T")[0];



// GESPEICHERTE BUCHUNGEN

function getBookings() {

    return JSON.parse(
        localStorage.getItem("noirBookings")
    ) || [];

}


function saveBookings(bookings) {

    localStorage.setItem(
        "noirBookings",
        JSON.stringify(bookings)
    );

}



// ZEIT IN MINUTEN UMWANDELN

function timeToMinutes(time) {

    const [hours, minutes] =
        time
            .split(":")
            .map(Number);

    return hours * 60 + minutes;

}


function minutesToTime(minutes) {

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;

    return (
        String(hours).padStart(2, "0")
        +
        ":"
        +
        String(mins).padStart(2, "0")
    );

}



// ÜBERSCHNEIDUNG PRÜFEN

function overlaps(
    start,
    duration,
    booking
) {

    const startA =
        timeToMinutes(start);

    const endA =
        startA + duration;

    const startB =
        timeToMinutes(booking.time);

    const endB =
        startB + booking.duration;

    return (
        startA < endB &&
        endA > startB
    );

}



// ZEITEN ERSTELLEN

function renderTimeSlots() {

    selectedTime =
        null;

    updateSummary();


    const serviceKey =
        serviceSelect.value;

    const dateValue =
        bookingDate.value;


    if (
        !serviceKey ||
        !dateValue
    ) {

        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">
                Wähle zuerst eine Leistung und ein Datum.
            </p>
            `;

        return;

    }


    const service =
        services[serviceKey];


    const date =
        new Date(
            dateValue + "T12:00:00"
        );


    const weekday =
        date.getDay();


    if (weekday === 0) {

        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">
                Sonntags ist geschlossen.
            </p>
            `;

        return;

    }


    const hours =
        openingHours[weekday];


    if (!hours) {
        return;
    }


    const startMinutes =
        timeToMinutes(hours.start);

    const closingMinutes =
        timeToMinutes(hours.end);


    const bookings =
        getBookings()
            .filter(
                booking =>
                    booking.date === dateValue
            );


    timeSlots.innerHTML =
        "";


    for (
        let current = startMinutes;
        current + service.duration <= closingMinutes;
        current += 30
    ) {

        const time =
            minutesToTime(current);


        const unavailable =
            bookings.some(
                booking =>
                    overlaps(
                        time,
                        service.duration,
                        booking
                    )
            );


        const button =
            document.createElement("button");


        button.type =
            "button";


        button.className =
            "time-slot";


        button.textContent =
            unavailable
                ? `${time} · belegt`
                : time;


        if (unavailable) {

            button.disabled =
                true;

            button.classList.add(
                "unavailable"
            );

        }


        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".time-slot")
                    .forEach(
                        slot =>
                            slot.classList.remove("selected")
                    );


                button.classList.add(
                    "selected"
                );


                selectedTime =
                    time;


                updateSummary();

            }
        );


        timeSlots.appendChild(
            button
        );

    }

}



// ZUSAMMENFASSUNG

function updateSummary() {

    const serviceKey =
        serviceSelect.value;

    const dateValue =
        bookingDate.value;


    if (
        !serviceKey ||
        !dateValue ||
        !selectedTime
    ) {

        bookingSummary.textContent =
            "Noch kein vollständiger Termin ausgewählt.";

        return;

    }


    const service =
        services[serviceKey];


    const formattedDate =
        new Date(
            dateValue + "T12:00:00"
        )
        .toLocaleDateString(
            "de-DE",
            {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );


    bookingSummary.innerHTML =
        `
        <strong>
            ${service.name}
        </strong>

        <br>

        ${formattedDate}

        <br>

        ${selectedTime} Uhr

        <br>

        ${service.duration} Minuten

        <br>

        ${service.price} €
        `;

}



// BUCHUNG SPEICHERN

bookingForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const serviceKey =
            serviceSelect.value;

        const dateValue =
            bookingDate.value;


        if (
            !serviceKey ||
            !dateValue ||
            !selectedTime
        ) {

            alert(
                "Bitte wähle Leistung, Datum und Uhrzeit aus."
            );

            return;

        }


        const service =
            services[serviceKey];


        const bookings =
            getBookings();


        const stillAvailable =
            !bookings
                .filter(
                    booking =>
                        booking.date === dateValue
                )
                .some(
                    booking =>
                        overlaps(
                            selectedTime,
                            service.duration,
                            booking
                        )
                );


        if (!stillAvailable) {

            alert(
                "Dieser Termin wurde bereits vergeben."
            );

            renderTimeSlots();

            return;

        }


        const booking = {

            id:
                Date.now(),

            service:
                service.name,

            price:
                service.price,

            duration:
                service.duration,

            date:
                dateValue,

            time:
                selectedTime,

            name:
                document
                    .getElementById("customerName")
                    .value,

            email:
                document
                    .getElementById("customerEmail")
                    .value,

            phone:
                document
                    .getElementById("customerPhone")
                    .value

        };


        bookings.push(
            booking
        );


        saveBookings(
            bookings
        );


        successText.textContent =
            `${booking.service} am ${booking.date} um ${booking.time} Uhr wurde gespeichert.`;


        bookingSuccess.classList.add(
            "show"
        );


        bookingForm.reset();


        selectedTime =
            null;


        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">
                Termin erfolgreich gespeichert.
            </p>
            `;


        bookingSummary.textContent =
            "Noch kein Termin ausgewählt.";


        bookingSuccess.scrollIntoView({
            behavior: "smooth"
        });

    }
);



serviceSelect.addEventListener(
    "change",
    renderTimeSlots
);


bookingDate.addEventListener(
    "change",
    renderTimeSlots
);