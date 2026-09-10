import { useMemo, useState } from "react";
import "./ReservationPage.css";

import Standard from "./assets/Standard.png";
import Twin from "./assets/Twin.png";
import Deluxe from "./assets/Deluxe.png";
import Triple from "./assets/Triple.png";
import Quadruple from "./assets/Quadruple.png";

import SiteChrome from "./SiteChrome";

const rooms = [
  {
    id: "standard",
    name: "Standard Room",
    minPax: 1,
    maxPax: 2,
    pricingDay: 1999,
    pricingOvernight: 2499,
    image: Standard,
  },
  {
    id: "twin",
    name: "Deluxe Twin Room",
    minPax: 2,
    maxPax: 4,
    pricingDay: 2499,
    pricingOvernight: 3099,
    image: Twin,
  },
  {
    id: "deluxe",
    name: "Deluxe Queen Room",
    minPax: 1,
    maxPax: 2,
    pricingDay: 2999,
    pricingOvernight: 3499,
    image: Deluxe,
  },
  {
    id: "triple",
    name: "Superior Triple Room",
    minPax: 3,
    maxPax: 6,
    pricingDay: 3499,
    pricingOvernight: 4499,
    image: Triple,
  },
  {
    id: "quadruple",
    name: "Superior Quadruple Room",
    minPax: 4,
    maxPax: 8,
    pricingDay: 3999,
    pricingOvernight: 5499,
    image: Quadruple,
  },
];

const amenityOptions = [
  {
    name: "Fitness Center",
    price: 500,
    description: "Access to the hotel fitness facilities.",
  },
  {
    name: "Swimming Pool",
    price: 750,
    description: "Swimming pool access during your stay.",
  },
  {
    name: "Meeting Facilities",
    price: 1500,
    description: "Private meeting and event facilities.",
  },
  {
    name: "Private Balcony",
    price: 1000,
    description: "Private balcony upgrade for your room.",
  },
];

export default function ReservationPage({
  initialData,
  onBack,
  onHome,
  onAmenities,
  onAbout,
  onContact,
  onProfile,
  onLogout,
  onBookingComplete,
  onRooms,
}) {
  const [step, setStep] = useState(1);
  const [matches, setMatches] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(
    initialData?.roomId || ""
  );

  const [form, setForm] = useState({
    stayType: "overnight",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    rooms: 1,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    amenities: [],
    confirmed: false,
  });

  const [bookingReference, setBookingReference] = useState("");

  const totalGuests = Number(form.adults) + Number(form.children);

  const chosenRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoom),
    [selectedRoom]
  );

  const selectedAmenities = useMemo(
    () =>
      amenityOptions.filter((amenity) =>
        form.amenities.includes(amenity.name)
      ),
    [form.amenities]
  );

  const roomPrice = chosenRoom
    ? form.stayType === "day"
      ? chosenRoom.pricingDay
      : chosenRoom.pricingOvernight
    : 0;

  const roomSubtotal = roomPrice * Number(form.rooms);

  const amenitySubtotal = selectedAmenities.reduce(
    (total, amenity) => total + amenity.price,
    0
  );

  const grandTotal = roomSubtotal + amenitySubtotal;

  const guestDetailsComplete =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phone.trim();

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const searchRooms = (e) => {
    e.preventDefault();

    if (!form.checkIn) {
      alert("Please select your check-in date.");
      return;
    }

    if (form.stayType === "overnight" && !form.checkOut) {
      alert("Please select your check-out date.");
      return;
    }

    if (
      form.stayType === "overnight" &&
      form.checkOut &&
      form.checkIn &&
      form.checkOut <= form.checkIn
    ) {
      alert("Your check-out date must be after your check-in date.");
      return;
    }

    if (totalGuests < 1) {
      alert("At least one guest is required.");
      return;
    }

    const perRoomGuests = Math.ceil(
      totalGuests / Number(form.rooms)
    );

    const available = rooms.filter(
      (room) =>
        room.maxPax >= perRoomGuests &&
        room.minPax <= perRoomGuests
    );

    setMatches(available);

    if (initialData?.roomId) {
      const initialMatch = available.find(
        (room) => room.id === initialData.roomId
      );

      if (initialMatch) {
        setSelectedRoom(initialMatch.id);
      }
    }

    setStep(2);
  };

  const toggleAmenity = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }));
  };

  const goToGuestDetails = () => {
    if (!selectedRoom) {
      alert("Please select a room.");
      return;
    }

    setStep(3);
  };

  const goToReview = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert(
        "Please complete all guest details before reviewing your reservation."
      );
      return;
    }

    setStep(4);
  };

  const confirmBooking = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim()
    ) {
      alert("Please complete your guest details.");
      setStep(3);
      return;
    }

    if (!form.confirmed) {
      alert("Please confirm the reservation details.");
      return;
    }

    if (!chosenRoom) {
      alert("Please select a room.");
      setStep(2);
      return;
    }

    const reference = `SE-${Date.now().toString().slice(-8)}`;

    const reservation = {
      id: reference,
      reference,
      roomId: chosenRoom.id,
      roomName: chosenRoom.name,
      stayType: form.stayType,
      checkIn: form.checkIn,
      checkOut:
        form.stayType === "day" ? form.checkIn : form.checkOut,
      adults: Number(form.adults),
      children: Number(form.children),
      rooms: Number(form.rooms),
      guestName: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      amenities: form.amenities,
      roomSubtotal,
      amenitySubtotal,
      total: grandTotal,
      createdAt: new Date().toLocaleString(),
    };

    const savedReservations = JSON.parse(
      localStorage.getItem("stayeaseReservations") || "[]"
    );

    localStorage.setItem(
      "stayeaseReservations",
      JSON.stringify([reservation, ...savedReservations])
    );

    const notifications = JSON.parse(
      localStorage.getItem("stayeaseNotifications") || "[]"
    );

    const notification = {
      id: Date.now(),
      title: "Reservation confirmed",
      message: `${chosenRoom.name} has been reserved successfully.`,
      date: new Date().toLocaleDateString(),
      read: false,
    };

    localStorage.setItem(
      "stayeaseNotifications",
      JSON.stringify([notification, ...notifications])
    );

    window.dispatchEvent(new Event("stayeaseReservationsUpdated"));
    window.dispatchEvent(new Event("stayeaseNotificationsUpdated"));

    setBookingReference(reference);
    setStep(5);
  };

  return (
    <main className="reservation-page">

      {step === 1 && (
        <section className="reservation-step">
          <div className="reservation-step-heading">
            <span>STEP 01</span>
            <h2>Find your room.</h2>
            <p>
              Tell us a little about your stay and we'll find rooms that fit
              your group.
            </p>
          </div>

          <form className="reservation-form-card" onSubmit={searchRooms}>
            <div className="stay-toggle">
              <button
                type="button"
                className={
                  form.stayType === "overnight" ? "active" : ""
                }
                onClick={() => update("stayType", "overnight")}
              >
                OVERNIGHT
              </button>

              <button
                type="button"
                className={form.stayType === "day" ? "active" : ""}
                onClick={() => {
                  update("stayType", "day");
                  update("checkOut", "");
                }}
              >
                DAY STAY
              </button>
            </div>

            <div className="reservation-fields">
              <label>
                CHECK-IN
                <input
                  type="date"
                  value={form.checkIn}
                  onChange={(e) =>
                    update("checkIn", e.target.value)
                  }
                />
              </label>

              <label>
                CHECK-OUT
                <input
                  type="date"
                  disabled={form.stayType === "day"}
                  value={
                    form.stayType === "day"
                      ? form.checkIn
                      : form.checkOut
                  }
                  onChange={(e) =>
                    update("checkOut", e.target.value)
                  }
                />
              </label>

              <label>
                ADULTS
                <input
                  type="number"
                  min="1"
                  value={form.adults}
                  onChange={(e) =>
                    update(
                      "adults",
                      Math.max(1, Number(e.target.value))
                    )
                  }
                />
              </label>

              <label>
                CHILDREN
                <input
                  type="number"
                  min="0"
                  value={form.children}
                  onChange={(e) =>
                    update(
                      "children",
                      Math.max(0, Number(e.target.value))
                    )
                  }
                />
              </label>

              <label>
                ROOMS
                <input
                  type="number"
                  min="1"
                  value={form.rooms}
                  onChange={(e) =>
                    update(
                      "rooms",
                      Math.max(1, Number(e.target.value))
                    )
                  }
                />
              </label>
            </div>

            <button className="primary-button reservation-next">
              FIND AVAILABLE ROOMS
            </button>
          </form>
        </section>
      )}

      {step === 2 && (
        <section className="reservation-step">
          <div className="reservation-step-heading">
            <span>STEP 02</span>
            <h2>Choose your room.</h2>
            <p>
              Based on {totalGuests} guest{totalGuests !== 1 ? "s" : ""} and{" "}
              {form.rooms} room{form.rooms !== 1 ? "s" : ""}, these options fit
              your stay.
            </p>
          </div>

          <div className="match-grid">
            {matches.map((room) => {
              const price =
                form.stayType === "day"
                  ? room.pricingDay
                  : room.pricingOvernight;

              return (
                <button
                  key={room.id}
                  type="button"
                  className={`match-card ${
                    selectedRoom === room.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRoom(room.id)}
                >
                  <img src={room.image} alt={room.name} />

                  <div>
                    <span>
                      {room.minPax}–{room.maxPax} GUESTS
                    </span>

                    <h3>{room.name}</h3>

                    <strong>
                      ₱{price.toLocaleString()}
                    </strong>

                    <small className="room-price-label">
                      {form.stayType === "day"
                        ? "PER DAY"
                        : "PER NIGHT"}
                    </small>
                  </div>

                  {selectedRoom === room.id && (
                    <i className="selected-check">✓</i>
                  )}
                </button>
              );
            })}
          </div>

          {matches.length === 0 && (
            <div className="no-match">
              No rooms match the selected guest capacity.
            </div>
          )}

          <div className="step-actions">
            <button
              className="secondary-button"
              onClick={() => setStep(1)}
            >
              ← CHANGE SEARCH
            </button>

            <button
              className="primary-button"
              disabled={!selectedRoom}
              onClick={goToGuestDetails}
            >
              CONTINUE
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="reservation-step">
          <div className="reservation-step-heading">
            <span>STEP 03</span>
            <h2>Tell us about you.</h2>
            <p>
              We'll use these details to prepare your reservation. All guest
              details are required before you can review your reservation.
            </p>
          </div>

          <div className="reservation-form-card">
            <div className="reservation-fields two">
              <label>
                FIRST NAME
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    update("firstName", e.target.value)
                  }
                  placeholder="First name"
                  required
                />
              </label>

              <label>
                LAST NAME
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    update("lastName", e.target.value)
                  }
                  placeholder="Last name"
                  required
                />
              </label>

              <label>
                EMAIL ADDRESS
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                PHONE NUMBER
                <input
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", e.target.value)
                  }
                  placeholder="+63"
                  required
                />
              </label>
            </div>

            <div className="amenity-selection">
              <span>OPTIONAL AMENITIES</span>

              <p className="amenity-helper">
                Select any amenities you'd like to add. Prices are shown below.
              </p>

              <div className="amenity-options">
                {amenityOptions.map((amenity) => {
                  const selected = form.amenities.includes(
                    amenity.name
                  );

                  return (
                    <button
                      key={amenity.name}
                      type="button"
                      className={`amenity-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() =>
                        toggleAmenity(amenity.name)
                      }
                    >
                      <span className="amenity-option-main">
                        <span className="amenity-option-name">
                          {selected ? "✓ " : ""}
                          {amenity.name}
                        </span>

                        <strong>
                          ₱{amenity.price.toLocaleString()}
                        </strong>
                      </span>

                      <small>{amenity.description}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="step-actions">
            <button
              className="secondary-button"
              onClick={() => setStep(2)}
            >
              ← BACK
            </button>

            <button
              className="primary-button"
              onClick={goToReview}
              disabled={!guestDetailsComplete}
            >
              REVIEW RESERVATION
            </button>
          </div>

          {!guestDetailsComplete && (
            <p className="required-note">
              Please complete your first name, last name, email address, and
              phone number to continue.
            </p>
          )}
        </section>
      )}

      {step === 4 && (
        <section className="reservation-step">
          <div className="reservation-step-heading">
            <span>STEP 04</span>
            <h2>Review & pay.</h2>
            <p>
              Review your reservation, amenities, and total before confirming
              your GCash payment.
            </p>
          </div>

          <div className="review-layout">
            <div className="review-card">
              <div className="review-room">
                <img
                  src={chosenRoom?.image}
                  alt={chosenRoom?.name}
                />

                <div>
                  <span>SELECTED ROOM</span>
                  <h3>{chosenRoom?.name}</h3>
                </div>
              </div>

              <div className="review-details">
                <div>
                  <span>STAY TYPE</span>
                  <strong>
                    {form.stayType === "day"
                      ? "DAY STAY"
                      : "OVERNIGHT"}
                  </strong>
                </div>

                <div>
                  <span>DATES</span>
                  <strong>
                    {form.checkIn}
                    {" → "}
                    {form.stayType === "day"
                      ? form.checkIn
                      : form.checkOut}
                  </strong>
                </div>

                <div>
                  <span>GUESTS</span>
                  <strong>
                    {totalGuests} GUEST
                    {totalGuests !== 1 ? "S" : ""}
                  </strong>
                </div>

                <div>
                  <span>ROOMS</span>
                  <strong>{form.rooms}</strong>
                </div>
              </div>

              <div className="review-guest">
                <span>GUEST</span>
                <strong>
                  {form.firstName} {form.lastName}
                </strong>
                <small>{form.email}</small>
                <small>{form.phone}</small>
              </div>

              <div className="review-amenities">
                <span>ADDED AMENITIES</span>

                {selectedAmenities.length > 0 ? (
                  selectedAmenities.map((amenity) => (
                    <div
                      className="review-amenity-row"
                      key={amenity.name}
                    >
                      <span>{amenity.name}</span>
                      <strong>
                        ₱{amenity.price.toLocaleString()}
                      </strong>
                    </div>
                  ))
                ) : (
                  <p>No additional amenities selected.</p>
                )}
              </div>
            </div>

            <aside className="payment-card">
              <span>RESERVATION BREAKDOWN</span>

              <h3>Your total.</h3>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>
                    {chosenRoom?.name} × {form.rooms}
                  </span>

                  <strong>
                    ₱{roomSubtotal.toLocaleString()}
                  </strong>
                </div>

                <div className="breakdown-subtext">
                  {form.stayType === "day"
                    ? "Day stay"
                    : "Overnight stay"}
                </div>

                <div className="breakdown-divider" />

                {selectedAmenities.length > 0 && (
                  <>
                    <div className="breakdown-section-title">
                      AMENITIES
                    </div>

                    {selectedAmenities.map((amenity) => (
                      <div
                        className="price-row"
                        key={amenity.name}
                      >
                        <span>{amenity.name}</span>
                        <strong>
                          ₱{amenity.price.toLocaleString()}
                        </strong>
                      </div>
                    ))}

                    <div className="breakdown-divider" />
                  </>
                )}

                <div className="price-row total">
                  <span>TOTAL TO PAY</span>
                  <strong>
                    ₱{grandTotal.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="payment-section">
                <span>GCASH PAYMENT</span>
                <h4>Scan to pay.</h4>

                <div className="qr-placeholder">
                  <strong>GCASH QR</strong>
                  <small>Payment QR placeholder</small>
                </div>

                <p>
                  Complete your GCash payment using the QR placeholder provided
                  for this prototype.
                </p>
              </div>

              <label className="confirmation-check">
                <input
                  type="checkbox"
                  checked={form.confirmed}
                  onChange={(e) =>
                    update("confirmed", e.target.checked)
                  }
                />

                <span>
                  I confirm that my reservation details, guest information,
                  selected amenities, and payment total are correct.
                </span>
              </label>

              <button
                className="primary-button"
                onClick={confirmBooking}
                disabled={!form.confirmed}
              >
                CONFIRM RESERVATION
              </button>
            </aside>
          </div>

          <div className="step-actions">
            <button
              className="secondary-button"
              onClick={() => setStep(3)}
            >
              ← BACK
            </button>
          </div>
        </section>
      )}

      {step === 5 && (
        <section className="reservation-success">
          <div className="success-card">
            <span>RESERVATION CONFIRMED</span>

            <div className="success-mark">✓</div>

            <h2>Your stay is waiting.</h2>

            <p>
              Your StayEase reservation has been successfully saved.
            </p>

            <div className="booking-reference">
              <small>BOOKING REFERENCE</small>
              <strong>{bookingReference}</strong>
            </div>

            <div className="reference-note">
              <strong>Keep this confirmation number safe.</strong>
              <p>
                Please save or screenshot your booking reference and keep it
                with you. You may be asked to show this reference when you
                arrive for your stay.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={onBookingComplete || onHome}
            >
              RETURN TO STAYEASE
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
