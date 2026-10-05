import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { RESTAURANT_TYPES, LOCALITIES, type RestaurantType } from '../../data/onboarding';
import {
  getApplication, getDetailChecks, saveDetails,
} from '../../services/onboardingService';
import { analyticsCuisines } from '../../data/admin/analytics';
import { PageHead, Panel } from './PageHead';

/**
 * Step one: who you are and where.
 *
 * Everything the brief lists, in one form rather than a wizard. A wizard would
 * hide how much is left and make correcting an early answer a journey; the
 * checklist beside the form does the same job honestly, and the owner can fill
 * it in whatever order the paperwork reaches them.
 */
export function RestaurantDetails() {
  const navigate = useNavigate();
  const app = getApplication();
  const [form, setForm] = useState({
    restaurantName: app.restaurantName,
    ownerName: app.ownerName,
    phone: app.phone,
    email: app.email,
    address: app.address,
    locality: app.locality,
    description: app.description,
    operatingHours: app.operatingHours,
    restaurantType: app.restaurantType,
    cuisines: app.cuisines,
  });
  const [saved, setSaved] = useState(false);

  /* Checks read the live form, not the saved record, so a field stops being a
     blocker the moment it is typed rather than when it is saved. */
  const checks = getDetailChecks({ ...app, ...form });

  const field = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const toggleCuisine = (name: string) => {
    setForm((f) => ({
      ...f,
      cuisines: f.cuisines.includes(name)
        ? f.cuisines.filter((c) => c !== name)
        : [...f.cuisines, name],
    }));
    setSaved(false);
  };

  /* The form's own `required` attributes stop an incomplete submit, so by the
     time this runs the step is done and the next one is where to be. */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDetails(form);
    setSaved(true);
    navigate('/partner/documents');
  };

  return (
    <>
      <PageHead
        title="Restaurant information"
        lede="This is what an admin reads first, and what customers see once you are live."
      />

      <div className="ob-split">
        <form className="ob-form" onSubmit={onSubmit}>
          <Panel title="Restaurant name" lede="Customers will see this name on SNS.">
            <label>
              <span className="fc-sr-only">Restaurant name</span>
              <input
                value={form.restaurantName}
                onChange={field('restaurantName')}
                placeholder="Restaurant name*"
                required
              />
            </label>
          </Panel>

          <Panel
            title="Owner details"
            lede="SNS uses these for every message about your application and, later, your orders."
          >
            <div className="ob-row">
              <label>
                <span>Owner or manager name</span>
                <input value={form.ownerName} onChange={field('ownerName')} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={form.email} onChange={field('email')} required />
              </label>
            </div>
            <label>
              <span>Phone number</span>
              <input type="tel" value={form.phone} onChange={field('phone')} required />
            </label>
          </Panel>

          <Panel title="Where you are" lede="Customers and delivery partners both work from this.">
            <label>
              <span>Restaurant address</span>
              <input value={form.address} onChange={field('address')} required />
            </label>

            <div className="ob-row">
              <label>
                <span>Location</span>
                {/* A list, not free text: it is the join key to the city's
                    districts, and a typed one would match nothing. */}
                <select value={form.locality} onChange={field('locality')} required>
                  <option value="">Choose a district</option>
                  {LOCALITIES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label>
                <span>Restaurant type</span>
                <select
                  value={form.restaurantType ?? ''}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, restaurantType: (e.target.value || null) as RestaurantType | null }));
                    setSaved(false);
                  }}
                  required
                >
                  <option value="">Choose a type</option>
                  {RESTAURANT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
            </div>

            <label>
              <span>Operating hours</span>
              <input
                value={form.operatingHours}
                onChange={field('operatingHours')}
                placeholder="11:00 – 23:30, daily"
                required
              />
            </label>
          </Panel>

          <Panel
            title="Menu and cuisines"
            lede="What you cook. This decides which districts of the city you appear in."
          >
            <fieldset className="ob-fieldset">
              <legend className="fc-sr-only">Cuisines</legend>
              <p className="ob-hint">
                Pick every cuisine you serve. <strong>Each one gets its own menu</strong> — they are
                never merged, so a customer browsing Biryani sees only your biryani.
              </p>
              <div className="ob-chips">
                {analyticsCuisines.map((c) => {
                  const on = form.cuisines.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className="ob-chip"
                      data-on={on || undefined}
                      aria-pressed={on}
                      onClick={() => toggleCuisine(c.name)}
                    >
                      {on ? <Check size={13} strokeWidth={3} /> : null}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label>
              <span>Description <em className="ob-optional">optional</em></span>
              <textarea
                rows={3}
                value={form.description}
                onChange={field('description')}
                placeholder="What your kitchen is known for."
              />
            </label>
          </Panel>

          <div className="ob-footer">
            <button type="submit" className="ob-save">Save and continue</button>
            {saved ? <span className="ob-saved"><Check size={14} strokeWidth={3} /> Saved</span> : null}
            <p className="ob-note">Takes you to Documents. Nothing is sent to the platform team yet.</p>
          </div>
        </form>

        {/* Live, so it answers "what have I missed" without a submit. */}
        <aside className="ob-checklist">
          <h4>Completeness</h4>
          <ul>
            {checks.map((c) => (
              <li key={String(c.id)} data-filled={c.filled || undefined}>
                <span className="ob-check-mark" aria-hidden="true">
                  {c.filled ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </span>
                <span>{c.label}</span>
                {c.required ? null : <em className="ob-optional">optional</em>}
              </li>
            ))}
          </ul>
          <p className="ob-note">
            Saving is not submitting. Nothing reaches the platform team until you send it from
            the Submit step.
          </p>
        </aside>
      </div>
    </>
  );
}
