// ======================================================
// NOIR CUTS
// GEMEINSAMES ONLINE-BUCHUNGSSYSTEM
// ======================================================


// Verbindung zu unserer Supabase-Buchungs-API

const BOOKING_API =
    "https://rpggtehaywhrrapdgpre.supabase.co/functions/v1/booking-api";



// ======================================================
// LEISTUNGEN
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
// DATUM RICHTIG FORMATIEREN
// ======================================================

function formatDateForInput(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}



// ======================================================
// BUCHBAREN ZEITRAUM FESTLEGEN
// ======================================================

// Heute

const today =
    new Date();


bookingDate.min =
    formatDateForInput(
        today
    );


// Maximal 30 Tage im Voraus

const maxDate =
    new Date();


maxDate.setDate(
    maxDate.getDate() + 30
);


bookingDate.max =
    formatDateForInput(
        maxDate
    );



// ======================================================
// FREIE TERMINE LADEN
// ======================================================

async function loadAvailableSlots() {


    selectedTime =
        null;


    updateSummary();


    const service =
        serviceSelect.value;


    const date =
        bookingDate.value;



    // Noch nicht alles ausgewählt

    if (
        !service ||
        !date
    ) {

        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">

                Wähle zuerst eine Leistung
                und ein Datum.

            </p>
            `;

        return;

    }



    // Ladeanzeige

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



        timeSlots.innerHTML =
            "";



        // Keine verfügbaren Termine

        if (
            !data.slots ||
            data.slots.length === 0
        ) {

            timeSlots.innerHTML =
                `
                <p class="booking-placeholder">

                    Für diesen Tag sind
                    keine Termine verfügbar.

                </p>
                `;

            return;

        }



        // Uhrzeiten anzeigen

        data.slots.forEach(
            slot => {


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "time-slot";



                // Termin frei

                if (slot.available) {

                    button.textContent =
                        slot.time;

                }



                // Termin belegt

                else {

                    button.textContent =
                        `${slot.time} · belegt`;


                    button.disabled =
                        true;


                    button.classList.add(
                        "unavailable"
                    );

                }



                // Freien Termin anklickbar machen

                if (slot.available) {


                    button.addEventListener(

                        "click",

                        () => {


                            // Alte Auswahl entfernen

                            document
                                .querySelectorAll(
                                    ".time-slot"
                                )
                                .forEach(
                                    slotButton => {


                                        slotButton
                                            .classList
                                            .remove(
                                                "selected"
                                            );


                                    }
                                );



                            // Neue Auswahl markieren

                            button
                                .classList
                                .add(
                                    "selected"
                                );



                            selectedTime =
                                slot.time;



                            updateSummary();

                        }

                    );

                }



                timeSlots.appendChild(
                    button
                );

            }

        );



    } catch (error) {


        console.error(
            "Fehler beim Laden der Termine:",
            error
        );


        timeSlots.innerHTML =
            `
            <p class="booking-placeholder">

                Die Termine konnten
                nicht geladen werden.

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
        services[
            serviceKey
        ];



    const formattedDate =
        new Date(
            `${dateValue}T12:00:00`
        )
        .toLocaleDateString(

            "de-DE",

            {

                weekday:
                    "long",

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"

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



        // ----------------------------------------------
        // Termin prüfen
        // ----------------------------------------------

        if (
            !service ||
            !date ||
            !selectedTime
        ) {

            alert(
                "Bitte wähle eine Leistung, ein Datum und eine Uhrzeit aus."
            );

            return;

        }



        // ----------------------------------------------
        // Name prüfen
        // ----------------------------------------------

        if (
            name.length < 2
        ) {

            alert(
                "Bitte gib einen gültigen Namen ein."
            );

            return;

        }



        // ----------------------------------------------
        // E-Mail prüfen
        // ----------------------------------------------

        if (!email) {

            alert(
                "Bitte gib deine E-Mail-Adresse ein."
            );

            return;

        }



        // ----------------------------------------------
        // Telefonnummer grob prüfen
        // ----------------------------------------------

        if (
            phone.length < 6
        ) {

            alert(
                "Bitte gib eine gültige Telefonnummer ein."
            );

            return;

        }



        // ----------------------------------------------
        // Button während Buchung sperren
        // ----------------------------------------------

        const submitButton =
            bookingForm.querySelector(
                'button[type="submit"]'
            );


        const oldButtonText =
            submitButton.textContent;



        submitButton.disabled =
            true;


        submitButton.textContent =
            "Termin wird gebucht...";



        try {


            // ------------------------------------------
            // Buchung an Supabase schicken
            // ------------------------------------------

            const response =
                await fetch(

                    BOOKING_API,

                    {

                        method:
                            "POST",


                        headers: {

                            "Content-Type":
                                "application/json"

                        },


                        body:
                            JSON.stringify(
                                {

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

                                }
                            )

                    }

                );



            const data =
                await response.json();



            // ------------------------------------------
            // Server meldet Fehler
            // ------------------------------------------

            if (!response.ok) {

                throw new Error(

                    data.error ||
                    "Der Termin konnte nicht gebucht werden."

                );

            }



            // ==================================================
            // BUCHUNG ERFOLGREICH
            // ==================================================

            const chosenService =
                services[
                    service
                ];



            const bookedTime =
                selectedTime;



            const formattedDate =
                new Date(
                    `${date}T12:00:00`
                )
                .toLocaleDateString(

                    "de-DE",

                    {

                        weekday:
                            "long",

                        day:
                            "2-digit",

                        month:
                            "2-digit",

                        year:
                            "numeric"

                    }

                );



            successText.innerHTML =
                `

                <strong>
                    ${chosenService.name}
                </strong>

                <br><br>

                ${formattedDate}

                <br>

                ${bookedTime} Uhr

                <br><br>

                Dauer:
                ${chosenService.duration} Minuten

                <br>

                Preis:
                ${chosenService.price} €

                <br><br>

                <strong>
                    Dein Termin wurde erfolgreich gebucht.
                </strong>

                `;



            // Erfolgsbox anzeigen

            bookingSuccess
                .classList
                .add(
                    "show"
                );



            // Formular leeren

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

                    Termin wurde erfolgreich gebucht.

                </p>

                `;



            // Zur Bestätigung scrollen

            bookingSuccess.scrollIntoView(
                {

                    behavior:
                        "smooth",

                    block:
                        "center"

                }
            );



        } catch (error) {


            console.error(
                "Buchungsfehler:",
                error
            );



            alert(
                error.message
            );



            // Zeiten neu laden,
            // falls jemand denselben Termin
            // kurz vorher gebucht hat.

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