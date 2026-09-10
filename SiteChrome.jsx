import { useEffect, useState } from "react";
import "./SiteChrome.css";

import logo from "./assets/logo1.png";
import userLogo from "./assets/user.png";
import loveLogo from "./assets/love.png";

const roomNames = {
  standard: "Standard Room",
  twin: "Deluxe Twin Room",
  deluxe: "Deluxe Queen Room",
  triple: "Superior Triple Room",
  quadruple: "Superior Quadruple Room",
};

export default function SiteChrome({
  onHome,
  onAmenities,
  onAbout,
  onContact,
  onProfile,
  onLogout,
  onRooms,
  favoriteCount = 0,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("stayeaseUser") || "null");
    } catch {
      return null;
    }
  };

  const savedUser = getUser();
  const name = savedUser?.name || "Guest";
  const email = savedUser?.email || "No email connected";

  const readStorage = () => {
    try {
      const storedFavorites = JSON.parse(
        localStorage.getItem("stayeaseFavorites") || "[]"
      );
      setFavorites(Array.isArray(storedFavorites) ? storedFavorites : []);
    } catch {
      setFavorites([]);
    }

    try {
      const storedReservations = JSON.parse(
        localStorage.getItem("stayeaseReservations") || "[]"
      );
      setReservations(
        Array.isArray(storedReservations) ? storedReservations : []
      );
    } catch {
      setReservations([]);
    }

    try {
      const storedNotifications = JSON.parse(
        localStorage.getItem("stayeaseNotifications") || "[]"
      );
      setNotifications(
        Array.isArray(storedNotifications) ? storedNotifications : []
      );
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    readStorage();

    const update = () => readStorage();

    window.addEventListener("stayeaseFavoritesUpdated", update);
    window.addEventListener("stayeaseReservationsUpdated", update);
    window.addEventListener("stayeaseNotificationsUpdated", update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener("stayeaseFavoritesUpdated", update);
      window.removeEventListener("stayeaseReservationsUpdated", update);
      window.removeEventListener("stayeaseNotificationsUpdated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const handleProfile = () => {
    setProfileOpen((current) => !current);
    setFavoritesOpen(false);
  };

  const handleFavorites = () => {
    setFavoritesOpen((current) => !current);
    setProfileOpen(false);
  };

  const markNotificationsRead = () => {
    const updated = notifications.map((item) => ({
      ...item,
      read: true,
    }));

    localStorage.setItem(
      "stayeaseNotifications",
      JSON.stringify(updated)
    );

    setNotifications(updated);
    window.dispatchEvent(new Event("stayeaseNotificationsUpdated"));
  };

  const unreadCount = notifications.filter((item) => !item.read).length;
  const displayFavoriteCount = favorites.length;

  return (
    <header className="site-header">
      <button
        type="button"
        className="header-logo"
        onClick={onHome}
        aria-label="Go to home"
      >
        <img src={logo} alt="StayEase" />
      </button>

      <nav className="main-nav">
        <button type="button" onClick={onHome}>
          HOME
        </button>
        <button type="button" onClick={onAmenities}>
          AMENITIES
        </button>
        <button type="button" onClick={onAbout}>
          ABOUT
        </button>
        <button type="button" onClick={onContact}>
          CONTACT
        </button>
      </nav>

      <div className="header-actions">
        <div className="header-action-wrapper">
          <button
            type="button"
            className={`header-icon-button ${
              displayFavoriteCount > 0 ? "has-favorites" : ""
            }`}
            onClick={handleFavorites}
            aria-label={`Favorites${
              displayFavoriteCount > 0 ? `, ${displayFavoriteCount} saved` : ""
            }`}
            aria-expanded={favoritesOpen}
          >
            <img src={loveLogo} alt="" />
            {displayFavoriteCount > 0 && (
              <span className="notification-badge favorite-badge">
                {displayFavoriteCount > 99 ? "99+" : displayFavoriteCount}
              </span>
            )}
          </button>

          {favoritesOpen && (
            <div className="header-dropdown favorites-dropdown">
              <div className="dropdown-heading">
                <span>SAVED STAYS</span>
                <h3>Your favorites</h3>
              </div>

              {favorites.length === 0 ? (
                <div className="empty-dropdown">
                  <p>Your favorite rooms will appear here.</p>
                </div>
              ) : (
                <div className="favorite-list">
                  {favorites.map((id) => (
                    <div className="favorite-item" key={id}>
                      <div className="favorite-item-copy">
                        <strong>{roomNames[id] || id}</strong>
                        <span>Saved room</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="dropdown-main-link"
                onClick={() => {
                  setFavoritesOpen(false);
                  onRooms();
                }}
              >
                VIEW ROOMS →
              </button>
            </div>
          )}
        </div>

        <div className="profile-wrapper">
          <button
            type="button"
            className="profile-button"
            onClick={handleProfile}
            aria-label="Profile"
            aria-expanded={profileOpen}
          >
            <img className="profile-icon" src={userLogo} alt="" />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {profileOpen && (
            <div className="header-dropdown profile-dropdown">
              <div className="profile-intro">
                <div className="profile-avatar">
                  <img src={userLogo} alt="" />
                </div>

                <div>
                  <strong>{name}</strong>
                  <span>{email}</span>
                </div>
              </div>

              <div className="profile-summary">
                <span>RESERVATIONS</span>
                <strong>{reservations.length}</strong>
              </div>

              <div className="notification-section">
                <div className="notification-header">
                  <div>
                    <span>ACCOUNT NOTIFICATIONS</span>
                    <strong>
                      {unreadCount
                        ? `${unreadCount} unread`
                        : "All caught up"}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={markNotificationsRead}
                    disabled={!unreadCount}
                  >
                    {unreadCount ? "MARK AS READ" : "ALL CAUGHT UP"}
                  </button>
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((item, index) => (
                      <div
                        className={`notification-item ${
                          !item.read ? "unread" : ""
                        }`}
                        key={item.id || index}
                      >
                        {!item.read && <i />}

                        <div>
                          <strong>
                            {item.title || "StayEase update"}
                          </strong>
                          <p>
                            {item.message || "You have a new update."}
                          </p>
                          {item.date && <small>{item.date}</small>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onProfile?.();
                  }}
                >
                  MY PROFILE
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onRooms();
                  }}
                >
                  MY STAYEASE
                </button>

                <button
                  type="button"
                  className="logout-button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                >
                  LOG OUT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
