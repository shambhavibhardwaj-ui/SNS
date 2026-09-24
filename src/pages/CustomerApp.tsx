import { Link, Route, Routes } from 'react-router-dom';
import { ArrowLeft, Heart, ReceiptText, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { FoodCityExperience } from './FoodCityExperience';

/**
 * The customer area.
 *
 * `/customer` is the Food City experience itself — the spec's customer home is
 * the city, not a separate dashboard. The account pages hang off it.
 */
export function CustomerApp() {
  return (
    <Routes>
      <Route path="/" element={<FoodCityExperience />} />
      <Route
        path="profile"
        element={<AccountPage title="Profile" Icon={UserRound} blurb="Your name, email and profile picture, taken from your Google account." />}
      />
      <Route
        path="orders"
        element={<AccountPage title="Orders" Icon={ReceiptText} blurb="Every order you have placed, with its restaurant, total and delivery mode." />}
      />
      <Route
        path="favorites"
        element={<AccountPage title="Favorites" Icon={Heart} blurb="Restaurants and dishes you have saved." />}
      />
      <Route path="*" element={<FoodCityExperience />} />
    </Routes>
  );
}

/** Account pages exist as routes; their contents arrive with the ordering flow. */
function AccountPage({
  title,
  blurb,
  Icon,
}: {
  title: string;
  blurb: string;
  Icon: LucideIcon;
}) {
  const { profile } = useAuth();

  return (
    <div className="ac-page">
      <div className="ac-inner">
        <Link to="/customer" className="rl-back">
          <ArrowLeft size={16} strokeWidth={2.2} />
          Back to Food City
        </Link>

        <header className="ac-head">
          <span className="ac-icon" aria-hidden="true">
            <Icon size={20} strokeWidth={1.9} />
          </span>
          <div>
            <h1>{title}</h1>
            <p>{blurb}</p>
          </div>
        </header>

        {title === 'Profile' && profile ? (
          <dl className="ac-facts">
            <div>
              <dt>Name</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>Account type</dt>
              <dd className="ac-role">{profile.role}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        ) : (
          <p className="ac-empty">
            Nothing here yet — this fills in once the ordering flow is built.
          </p>
        )}
      </div>
    </div>
  );
}
