import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, Info, Lock } from 'lucide-react';
import { useCart } from '../cart/useCart';
import { useAuth } from '../auth/useAuth';
import {
  OrderError, PAYMENT_METHODS, placeOrder, type DeliveryAddress, type PaymentMethod,
} from '../services/orderService';

type Errors = Partial<Record<keyof DeliveryAddress, string>>;

/**
 * Checkout.
 *
 * Validation is here because these are presentation rules — what a person must
 * type before the button does anything. Whether the order can actually be
 * placed is the service's decision, and it re-checks the restaurant, its
 * opening state and every item, so a customer cannot get an order through by
 * editing the form.
 *
 * There is no payment integration and none is faked. The chosen method is
 * recorded; nothing is charged, and the screen says so rather than showing a
 * card form that goes nowhere.
 */
export function CheckoutPage() {
  const cart = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: profile?.name ?? '',
    phone: '',
    line1: '',
    landmark: '',
    city: '',
    pincode: '',
  });
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  if (cart.isEmpty || !cart.restaurant) {
    return (
      <div className="ck ck-empty-page">
        <h1>Nothing to check out</h1>
        <p>Your cart is empty.</p>
        <Link to="/" className="ck-primary">Explore SNS</Link>
      </div>
    );
  }

  const { restaurant, groups, totals } = cart;

  const set = (key: keyof DeliveryAddress, value: string) => {
    setAddress((a) => ({ ...a, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Errors = {};
    if (!address.fullName.trim()) next.fullName = 'Who should the rider ask for?';
    if (!/^[0-9]{10}$/.test(address.phone.replace(/\s+/g, ''))) {
      next.phone = 'Enter a ten-digit phone number.';
    }
    if (!address.line1.trim()) next.line1 = 'Add a street address.';
    if (!address.city.trim()) next.city = 'Add a city.';
    if (!/^[0-9]{6}$/.test(address.pincode.trim())) next.pincode = 'Enter a six-digit pincode.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFailure(null);
    if (!validate()) return;

    setPlacing(true);
    try {
      const order = placeOrder({
        restaurantId: restaurant.id,
        lines: cart.state.lines,
        address,
        paymentMethod: payment,
        customerId: profile?.userId,
      });
      /* Cleared only after the service accepted it. Clearing first would lose
         the cart if placing threw. */
      cart.clear();
      navigate(`../order/${encodeURIComponent(order.id)}`, { replace: true });
    } catch (err) {
      setFailure(err instanceof OrderError ? err.message : 'That order could not be placed.');
      setPlacing(false);
    }
  };

  return (
    <div className="ck">
      <header className="ck-head">
        <button type="button" className="rm-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h1>Checkout</h1>
        <p>
          {cart.totals.itemCount} {cart.totals.itemCount === 1 ? 'item' : 'items'} from{' '}
          {restaurant.name}
        </p>
      </header>

      <form className="ck-layout" onSubmit={onSubmit} noValidate>
        <div className="ck-form">
          <section className="ck-panel">
            <h2>Delivery address</h2>
            <div className="ck-fields">
              <Field label="Full name" value={address.fullName} error={errors.fullName}
                onChange={(v) => set('fullName', v)} autoComplete="name" />
              <Field label="Phone" value={address.phone} error={errors.phone}
                onChange={(v) => set('phone', v)} autoComplete="tel" inputMode="numeric" />
              <Field label="Flat, street" value={address.line1} error={errors.line1}
                onChange={(v) => set('line1', v)} autoComplete="street-address" wide />
              <Field label="Landmark (optional)" value={address.landmark ?? ''}
                onChange={(v) => set('landmark', v)} wide />
              <Field label="City" value={address.city} error={errors.city}
                onChange={(v) => set('city', v)} autoComplete="address-level2" />
              <Field label="Pincode" value={address.pincode} error={errors.pincode}
                onChange={(v) => set('pincode', v)} autoComplete="postal-code" inputMode="numeric" />
            </div>
          </section>

          <section className="ck-panel">
            <h2>How it gets to you</h2>
            <p className="ck-delivery">
              <Bike size={15} aria-hidden="true" />
              {restaurant.deliveryType === 'aggregator'
                ? 'Delivered by a platform partner (aggregator).'
                : `Delivered by ${restaurant.name}'s own staff.`}
              <span>Chosen by the restaurant at onboarding — RULE-03 / RULE-04.</span>
            </p>
          </section>

          <section className="ck-panel">
            <h2>Payment</h2>
            <ul className="ck-payments">
              {PAYMENT_METHODS.map((m) => {
                const unavailable = m.id !== 'cash';
                return (
                  <li key={m.id}>
                    <label className="ck-payment" data-off={unavailable || undefined}>
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={payment === m.id}
                        disabled={unavailable}
                        onChange={() => setPayment(m.id)}
                      />
                      <span>
                        <strong>{m.label}</strong>
                        <small>{m.note}</small>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="ck-note">
              <Lock size={12} aria-hidden="true" />
              No payment gateway is connected and nothing is charged. Cash on delivery is the
              only method that means anything in this build, so the others are disabled rather
              than shown as working.
            </p>
          </section>
        </div>

        <aside className="ck-summary">
          <h2>Order summary</h2>

          {groups.map((group) => (
            <div key={group.cuisine.id} className="ck-sum-group">
              <p className="ck-sum-cuisine">
                <span aria-hidden="true">{group.cuisine.icon}</span>
                {group.cuisine.name}
              </p>
              <ul>
                {group.lines.map((line) => (
                  <li key={line.item.id}>
                    <span>{line.quantity} × {line.item.name}</span>
                    <span>₹{line.lineTotal.toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <dl>
            <div>
              <dt>Item total</dt>
              <dd>₹{totals.itemTotal.toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt>Delivery fee</dt>
              <dd>₹{totals.deliveryFee.toLocaleString('en-IN')}</dd>
            </div>
            <div className="ck-total">
              <dt>Pay on delivery</dt>
              <dd>₹{totals.total.toLocaleString('en-IN')}</dd>
            </div>
          </dl>

          {failure ? <p className="ck-failure" role="alert">{failure}</p> : null}

          <button type="submit" className="ck-primary" disabled={placing}>
            {placing ? 'Placing your order…' : `Place order · ₹${totals.total.toLocaleString('en-IN')}`}
          </button>

          <p className="ck-note">
            <Info size={12} aria-hidden="true" />
            This order is recorded in the browser for the rest of this session. No kitchen is
            contacted and no rider is dispatched.
          </p>
        </aside>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- field -- */

function Field({
  label,
  value,
  onChange,
  error,
  autoComplete,
  inputMode,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'text';
  wide?: boolean;
}) {
  const id = `ck-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  return (
    <label className="ck-field" data-wide={wide || undefined} htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="text"
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <em id={`${id}-error`} className="ck-error">{error}</em> : null}
    </label>
  );
}
