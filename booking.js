// ======================================================
// NOIR CUTS – BOOKING SYSTEM
// Verbindung zur gemeinsamen Supabase-Datenbank
// ======================================================

const BOOKING_API =
    "https://rpggtehaywhrrapdgpre.supabase.co/functions/v1/booking-api";


// ======================================================
// SERVICES
// ======================================================

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


// ======================================================
// HTML-ELEMENTE
// ======================================================

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

const customerName =
    document.getElementById("customerName");

const customerEmail =
    document.getElementById("customerEmail");

const customerPhone =
    document.getElementById("customerPhone");


let selectedTime = null;


// ======================================================
// DATUM EINSTELLEN
// Heute bis maximal 30 Tage im Voraus
// ======================================================

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


const today =
    new Date();

bookingDate.min =
    formatDateForInput(today);


const maxDate =
    new Date();

maxDate.setDate(
    maxDate.getDate() + 30
);

bookingDate.max =
    formatDateForInput(maxDate);


// ======================================================
// VERFÜGBARE TERMINE LADEN
// ======================================================

async function loadAvailableSlots() {

    selectedTime = null;

    updateSummary();


    const service =
        serviceSelect.value;

    const date =
        bookingDate.value;


    // Noch nichts vollständig ausgewählt

    if (!service || !date) {

        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">
                Wähle zuerst eine Leistung und ein Datum.
            </p>
            `;

        return;
    }


    // Während des Ladens anzeigen

    timeSlots.innerHTML =
        `
        <p class="booking-placeholder">
            Freie Termine werden geladen...
        </p>
        `;


    try {

        const response =
            await fetch(
                `${BOOKING_API}?date=${encodeURIComponent(date)}&service=${encodeURIComponent(service)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Termine konnten nicht geladen werden."
            );

        }


        timeSlots.innerHTML = "";


        // Keine Termine an diesem Tag

        if (
            !data.slots ||
            data.slots.length === 0
        ) {

            timeSlots.innerHTML =
                `
                <p class="booking-placeholder">
                    Für diesen Tag sind keine Termine verfügbar.
                </p>
                `;

            return;
        }


        // Einzelne Uhrzeiten erzeugen

        data.slots.forEach(slot => {

            const button =
                document.createElement("button");


            button.type =
                "button";


            button.className =
                "time-slot";


            // Frei oder belegt anzeigen

            if (slot.available) {

                button.textContent =
                    slot.time;

            } else {

                button.textContent =
                    `${slot.time} · belegt`;

                button.disabled =
                    true;

                button.classList.add(
                    "unavailable"
                );

            }


            // Nur freie Termine anklickbar

            if (slot.available) {

                button.addEventListener(
                    "click",
                    () => {

                        // Vorherige Auswahl entfernen

                        document
                            .querySelectorAll(".time-slot")
                            .forEach(slotButton => {

                                slotButton
                                    .classList
                                    .remove("selected");

                            });


                        // Neue Auswahl markieren

                        button
                            .classList
                            .add("selected");


                        selectedTime =
                            slot.time;


                        updateSummary();

                    }
                );

            }


            timeSlots.appendChild(
                button
            );

        });


    } catch (error) {

        console.error(
            "Fehler beim Laden:",
            error
        );


        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">
                Die Termine konnten nicht geladen werden.
                Bitte versuche es erneut.
            </p>
            `;

    }

}


// ======================================================
// BUCHUNGS-ZUSAMMENFASSUNG
// ======================================================

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
            `${dateValue}T12:00:00`
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


// ======================================================
// BUCHUNG ABSCHICKEN
// ======================================================

bookingForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const service =
            serviceSelect.value;

        const date =
            bookingDate.value;

        const name =
            customerName.value.trim();

        const email =
            customerEmail.value.trim();

        const phone =
            customerPhone.value.trim();


        // Termin nicht vollständig

        if (
            !service ||
            !date ||
            !selectedTime
        ) {

            alert(
                "Bitte wähle zuerst eine Leistung, ein Datum und eine Uhrzeit aus."
            );

            return;
        }


        // Name prüfen

        if (name.length < 2) {

            alert(
                "Bitte gib einen gültigen Namen ein."
            );

            return;
        }


        // E-Mail wird aktuell noch nicht in Supabase gespeichert.
        // Wir prüfen sie trotzdem über das HTML-Formular.

        if (!email) {

            alert(
                "Bitte gib deine E-Mail-Adresse ein."
            );

            return;
        }


        // Telefonnummer grob prüfen

        if (phone.length < 6) {

            alert(
                "Bitte gib eine gültige Telefonnummer ein."
            );

            return;
        }


        const submitButton =
            bookingForm.querySelector(
                'button[type="submit"]'
            );


        const oldButtonText =
            submitButton.textContent;


        submitButton.disabled =
            true;

        submitButton.textContent =
            "Termin wird reserviert...";


        try {

            const response =
                await fetch(
                    BOOKING_API,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                service:
                                    service,

                                date:
                                    date,

                                time:
                                    selectedTime,

                                name:
                                    name,

                                phone:
                                    phone

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Der Termin konnte nicht reserviert werden."
                );

            }


            // ==================================================
            // ERFOLGREICH VORLÄUFIG RESERVIERT
            // ==================================================

            const chosenService =
                services[service];


            const formattedDate =
                new Date(
                    `${date}T12:00:00`
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


            successText.innerHTML =
                `
                <strong>
                    ${chosenService.name}
                </strong>

                wurde am

                <strong>
                    ${formattedDate}
                </strong>

                um

                <strong>
                    ${selectedTime} Uhr
                </strong>

                vorläufig reserviert.

                <br><br>

                Als Nächstes wird die Telefonnummer
                per SMS-Code bestätigt.
                `;


            bookingSuccess
                .classList
                .add("show");


            // Formular zurücksetzen

            bookingForm.reset();


            serviceSelect.value =
                "";

            bookingDate.value =
                "";

            selectedTime =
                null;


            bookingSummary.textContent =
                "Noch kein vollständiger Termin ausgewählt.";


            timeSlots.innerHTML =
                `
                <p class="booking-placeholder">
                    Termin wurde vorläufig reserviert.
                </p>
                `;


            // Zur Bestätigung scrollen

            bookingSuccess.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


        } catch (error) {

            console.error(
                "Buchungsfehler:",
                error
            );


            alert(
                error.message
            );


            // Falls jemand in der Zwischenzeit
            // denselben Termin gebucht hat:
            await loadAvailableSlots();


        } finally {

            submitButton.disabled =
                false;

            submitButton.textContent =
                oldButtonText;

        }

    }
);


// ======================================================
// ÄNDERUNGEN BEOBACHTEN
// ======================================================

serviceSelect.addEventListener(
    "change",
    loadAvailableSlots
);


bookingDate.addEventListener(
    "change",
    loadAvailableSlots
);