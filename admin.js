// ======================================================
// NOIR CUTS
// ADMIN TERMINVERWALTUNG
// ======================================================


const ADMIN_API =
    "https://rpggtehaywhrrapdgpre.supabase.co/functions/v1/admin-api";



// ======================================================
// LEISTUNGSNAMEN
// ======================================================

const serviceNames = {

    classic:
        "Classic Cut",

    fade:
        "Skin Fade",

    hairbeard:
        "Hair & Beard",

    beard:
        "Beard Styling"

};



// ======================================================
// HTML-ELEMENTE
// ======================================================

const adminLogin =
    document.getElementById(
        "adminLogin"
    );


const adminDashboard =
    document.getElementById(
        "adminDashboard"
    );


const adminPassword =
    document.getElementById(
        "adminPassword"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const loginError =
    document.getElementById(
        "loginError"
    );


const appointmentsList =
    document.getElementById(
        "appointmentsList"
    );


const adminLoading =
    document.getElementById(
        "adminLoading"
    );


const refreshButton =
    document.getElementById(
        "refreshButton"
    );


const adminDateFilter =
    document.getElementById(
        "adminDateFilter"
    );


const todayCount =
    document.getElementById(
        "todayCount"
    );


const upcomingCount =
    document.getElementById(
        "upcomingCount"
    );


const completedCount =
    document.getElementById(
        "completedCount"
    );


const cancelledCount =
    document.getElementById(
        "cancelledCount"
    );



// ======================================================
// PASSWORT
// ======================================================

let currentPassword =
    sessionStorage.getItem(
        "noirAdminPassword"
    ) || "";



// ======================================================
// DATUM FORMATIEREN
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



// Heutiges Datum einsetzen

const today =
    new Date();


const todayString =
    formatDateForInput(
        today
    );


adminDateFilter.value =
    todayString;



// ======================================================
// HTML SICHER AUSGEBEN
// ======================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}



// ======================================================
// DATUM SCHÖN ANZEIGEN
// ======================================================

function formatGermanDate(dateString) {

    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    return date.toLocaleDateString(
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

}



// ======================================================
// ENDZEIT BERECHNEN
// ======================================================

function calculateEndTime(
    startTime,
    duration
) {

    const parts =
        startTime
            .slice(0, 5)
            .split(":")
            .map(Number);


    let minutes =
        parts[0] * 60 +
        parts[1] +
        duration;


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    return (
        String(hours)
            .padStart(2, "0")
        +
        ":"
        +
        String(mins)
            .padStart(2, "0")
    );

}



// ======================================================
// STATUS ANZEIGEN
// ======================================================

function getStatusLabel(status) {

    if (
        status === "confirmed"
    ) {

        return "Bestätigt";

    }


    if (
        status === "completed"
    ) {

        return "Erledigt";

    }


    if (
        status === "cancelled"
    ) {

        return "Storniert";

    }


    return status;

}



// ======================================================
// LOGIN
// ======================================================

async function login() {


    const password =
        adminPassword.value.trim();


    if (!password) {

        loginError.textContent =
            "Bitte Passwort eingeben.";

        return;

    }


    currentPassword =
        password;


    loginButton.disabled =
        true;


    loginButton.textContent =
        "Wird geprüft...";


    loginError.textContent =
        "";


    try {

        await loadAppointments();


        sessionStorage.setItem(
            "noirAdminPassword",
            currentPassword
        );


        adminLogin.classList.add(
            "hidden"
        );


        adminDashboard.classList.remove(
            "hidden"
        );


    } catch (error) {


        currentPassword =
            "";


        sessionStorage.removeItem(
            "noirAdminPassword"
        );


        loginError.textContent =
            error.message;


    } finally {


        loginButton.disabled =
            false;


        loginButton.textContent =
            "Anmelden";

    }

}



// ======================================================
// TERMINE LADEN
// ======================================================

async function loadAppointments() {


    const fromDate =
        adminDateFilter.value ||
        todayString;


    adminLoading.style.display =
        "block";


    appointmentsList.innerHTML =
        "";


    const response =
        await fetch(

            `${ADMIN_API}?from=${encodeURIComponent(fromDate)}`,

            {

                headers: {

                    "x-admin-password":
                        currentPassword

                }

            }

        );


    const data =
        await response.json();



    if (!response.ok) {

        throw new Error(

            data.error ||
            "Termine konnten nicht geladen werden."

        );

    }


    adminLoading.style.display =
        "none";


    const appointments =
        data.appointments || [];


    renderStatistics(
        appointments
    );


    renderAppointments(
        appointments
    );

}



// ======================================================
// STATISTIK
// ======================================================

function renderStatistics(
    appointments
) {


    const confirmedToday =
        appointments.filter(
            appointment =>

                appointment.appointment_date
                    === todayString

                &&

                appointment.status
                    === "confirmed"
        ).length;



    const upcoming =
        appointments.filter(
            appointment =>

                appointment.status
                    === "confirmed"
        ).length;



    const completed =
        appointments.filter(
            appointment =>

                appointment.status
                    === "completed"
        ).length;



    const cancelled =
        appointments.filter(
            appointment =>

                appointment.status
                    === "cancelled"
        ).length;



    todayCount.textContent =
        confirmedToday;


    upcomingCount.textContent =
        upcoming;


    completedCount.textContent =
        completed;


    cancelledCount.textContent =
        cancelled;

}



// ======================================================
// TERMINE ANZEIGEN
// ======================================================

function renderAppointments(
    appointments
) {


    appointmentsList.innerHTML =
        "";


    if (
        appointments.length === 0
    ) {

        appointmentsList.innerHTML =
            `

            <div class="admin-empty">

                Keine Termine gefunden.

            </div>

            `;

        return;

    }



    // Termine nach Datum gruppieren

    const groups =
        {};


    appointments.forEach(
        appointment => {


            const date =
                appointment
                    .appointment_date;


            if (!groups[date]) {

                groups[date] =
                    [];

            }


            groups[date].push(
                appointment
            );

        }
    );



    // Tage anzeigen

    Object
        .entries(groups)
        .forEach(
            ([date, dayAppointments]) => {


                const daySection =
                    document.createElement(
                        "section"
                    );


                daySection.className =
                    "admin-day";



                const dayTitle =
                    document.createElement(
                        "h2"
                    );


                dayTitle.textContent =
                    formatGermanDate(
                        date
                    );


                daySection.appendChild(
                    dayTitle
                );



                dayAppointments.forEach(
                    appointment => {


                        const card =
                            createAppointmentCard(
                                appointment
                            );


                        daySection.appendChild(
                            card
                        );

                    }
                );



                appointmentsList.appendChild(
                    daySection
                );

            }
        );

}



// ======================================================
// EINEN TERMIN ERSTELLEN
// ======================================================

function createAppointmentCard(
    appointment
) {


    const card =
        document.createElement(
            "article"
        );


    card.className =
        `admin-appointment status-${appointment.status}`;



    const startTime =
        appointment
            .start_time
            .slice(
                0,
                5
            );


    const endTime =
        calculateEndTime(

            startTime,

            appointment
                .duration_minutes

        );



    const serviceName =
        serviceNames[
            appointment.service
        ]
        ||
        appointment.service;



    card.innerHTML =
        `

        <div class="appointment-time">

            <strong>
                ${escapeHtml(startTime)}
            </strong>

            <span>
                bis ${escapeHtml(endTime)}
            </span>

        </div>



        <div class="appointment-info">

            <div class="appointment-top">

                <h3>
                    ${escapeHtml(serviceName)}
                </h3>

                <span
                    class="appointment-status"
                >
                    ${escapeHtml(
                        getStatusLabel(
                            appointment.status
                        )
                    )}
                </span>

            </div>


            <p>
                <strong>Kunde:</strong>
                ${escapeHtml(
                    appointment.customer_name
                )}
            </p>


            <p>
                <strong>Telefon:</strong>

                <a
                    href="tel:${escapeHtml(
                        appointment.phone
                    )}"
                >
                    ${escapeHtml(
                        appointment.phone
                    )}
                </a>
            </p>


            <p>
                <strong>Dauer:</strong>
                ${escapeHtml(
                    appointment.duration_minutes
                )}
                Minuten
            </p>

        </div>



        <div class="appointment-actions"></div>

        `;



    const actions =
        card.querySelector(
            ".appointment-actions"
        );



    // Nur bestätigte Termine
    // können geändert werden.

    if (
        appointment.status
        === "confirmed"
    ) {


        const completedButton =
            document.createElement(
                "button"
            );


        completedButton.className =
            "admin-action complete";


        completedButton.textContent =
            "Erledigt";


        completedButton.addEventListener(
            "click",
            () => {

                updateStatus(
                    appointment.id,
                    "completed"
                );

            }
        );



        const cancelButton =
            document.createElement(
                "button"
            );


        cancelButton.className =
            "admin-action cancel";


        cancelButton.textContent =
            "Stornieren";


        cancelButton.addEventListener(
            "click",
            () => {


                const confirmed =
                    confirm(
                        "Soll dieser Termin wirklich storniert werden?"
                    );


                if (confirmed) {

                    updateStatus(
                        appointment.id,
                        "cancelled"
                    );

                }

            }
        );



        actions.appendChild(
            completedButton
        );


        actions.appendChild(
            cancelButton
        );

    }


    return card;

}



// ======================================================
// STATUS ÄNDERN
// ======================================================

async function updateStatus(
    id,
    status
) {


    try {


        const response =
            await fetch(

                ADMIN_API,

                {

                    method:
                        "POST",


                    headers: {

                        "Content-Type":
                            "application/json",

                        "x-admin-password":
                            currentPassword

                    },


                    body:
                        JSON.stringify(
                            {

                                id:
                                    id,

                                status:
                                    status

                            }
                        )

                }

            );



        const data =
            await response.json();



        if (!response.ok) {

            throw new Error(

                data.error ||
                "Termin konnte nicht geändert werden."

            );

        }



        await loadAppointments();



    } catch (error) {


        alert(
            error.message
        );

    }

}



// ======================================================
// ABMELDEN
// ======================================================

function logout() {


    currentPassword =
        "";


    sessionStorage.removeItem(
        "noirAdminPassword"
    );


    adminPassword.value =
        "";


    adminDashboard
        .classList
        .add(
            "hidden"
        );


    adminLogin
        .classList
        .remove(
            "hidden"
        );

}



// ======================================================
// EVENTS
// ======================================================

loginButton.addEventListener(
    "click",
    login
);



adminPassword.addEventListener(
    "keydown",
    event => {


        if (
            event.key === "Enter"
        ) {

            login();

        }

    }
);



logoutButton.addEventListener(
    "click",
    logout
);



refreshButton.addEventListener(
    "click",
    loadAppointments
);



adminDateFilter.addEventListener(
    "change",
    loadAppointments
);



// ======================================================
// AUTOMATISCH EINLOGGEN,
// WENN PASSWORT IN DER SESSION GESPEICHERT
// ======================================================

if (currentPassword) {


    adminLogin.classList.add(
        "hidden"
    );


    adminDashboard.classList.remove(
        "hidden"
    );


    loadAppointments()
        .catch(
            () => {

                logout();

            }
        );

}