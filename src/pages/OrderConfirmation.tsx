import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bike, Check, Clock, MapPin, Receipt } from 'lucide-react';
import { getPlacedOrder } from '../services/orderService';

/**
 * Order confirmation.
 *
 * Orders live in memory for this build, so a reload loses them. The screen says
 * so plainly instead of inventing a lookup that would appear to work and then
 * fail for a real order.
 *
 * Items are listed under the cuisine they were ordered from — the separation
 * the menus enforce is carried all the way through to the receipt.
 */
export function OrderConfirmation() {
  const { orderId = '' } = useParams();
  const order = useMemo(() => getPlacedOrder(decodeURIComponent(orderId)), [orderId]);

  if (!order) {
    return (
      <div className="ck ck-empty-page">
        <h1>That order is not in this session</h1>
        <p>
          Orders are kept in memory until the backend is connected, so a reload clears them.
          The order itself was placed.
        </p>
        <Link to="/" className="ck-primary">Back to SNS</Link>
      </div>
    );
  }

  /* Grouped for display only; the order stores a flat item list, as the table will. */
  const byCuisine = new Map<string, typeof order.items>();
  for (const item of order.items) {
    const list = byCuisine.get(item.cuisineName) ?? [];
    list.push(item);
    byCuisine.set(item.cuisineName, list);
  }

  const placedAt = new Date(order.placedAt);
  const arrival = new Date(placedAt.getTime() + order.etaMinutes * 60_000);
  const time = (d: Date) =>
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="ck oc">
      <header className="oc-head">
        <span className="oc-tick" aria-hidden="true"><Check size={26} strokeWidth={3} /></span>
        <h1>Order placed</h1>
        <p>
          {order.restaurant.name} has your order. Number{' '}
          <strong className="oc-id">{order.id}</strong>.
        </p>
      </header>

      <div className="ck-layout">
        <div className="ck-form">
          <section className="ck-panel">
            <h2>What happens next</h2>
            <ol className="oc-steps">
              <li data-done="true"><span />Order placed · {time(placedAt)}</li>
              <li><span />Restaurant confirms</li>
              <li><span />Food preparing</li>
              <li>
                <span />
                {order.deliveryType === 'aggregator'
                  ? 'Aggregator partner picks up'
                  : `${order.restaurant.name}'s rider picks up`}
              </li>
              <li><span />Delivered · around {time(arrival)}</li>
            </ol>
            <p className="ck-note">
              These steps are the real order lifecycle, but nothing advances them yet — there is
              no kitchen at the other end of this build.
            </p>
          </section>

          <section className="ck-panel">
            <h2>Delivering to</h2>
            <p className="oc-address">
              <MapPin size={15} aria-hidden="true" />
              <span>
                <strong>{order.address.fullName}</strong>
                {order.address.line1}
                {order.address.landmark ? `, ${order.address.landmark}` : ''}
                <br />
                {order.address.city} {order.address.pincode}
                <br />
                {order.address.phone}
              </span>
            </p>
            <p className="oc-meta">
              <Bike size={14} aria-hidden="true" />
              {order.deliveryType === 'aggregator' ? 'Aggregator delivery' : 'Own delivery staff'}
              <Clock size={14} aria-hidden="true" />
              {order.etaMinutes} min
            </p>
          </section>
        </div>

        <aside className="ck-summary">
          <h2><Receipt size={15} aria-hidden="true" /> Receipt</h2>

          {[...byCuisine.entries()].map(([cuisineName, items]) => (
            <div key={cuisineName} className="ck-sum-group">
              <p className="ck-sum-cuisine">{cuisineName}</p>
              <ul>
                {items.map((item) => (
                  <li key={item.menuItemId}>
                    <span>{item.quantity} × {item.name}</span>
                    <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <dl>
            <div>
              <dt>Item total</dt>
              <dd>₹{order.itemTotal.toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt>Delivery fee</dt>
              <dd>₹{order.deliveryFee.toLocaleString('en-IN')}</dd>
            </div>
            <div className="ck-total">
              <dt>{order.paymentMethod === 'cash' ? 'Pay on delivery' : 'Paid'}</dt>
              <dd>₹{order.total.toLocaleString('en-IN')}</dd>
            </div>
          </dl>

          <Link to="/" className="ck-primary">Back to SNS</Link>
        </aside>
      </div>
    </div>
  );
}
