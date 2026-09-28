import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../cart/useCart';

/**
 * The cart.
 *
 * Lines stay grouped by the cuisine they came from, so a Mumbai Spice order of
 * a butter chicken and a plate of pani puri reads as two menus rather than one
 * undifferentiated list. The grouping is display only — the cart itself keeps
 * a flat list of items, because storing its own buckets would be a second copy
 * of the item-to-menu relationship.
 */
export function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  if (cart.isEmpty || !cart.restaurant) {
    return (
      <div className="ck ck-empty-page">
        <ShoppingBag size={28} aria-hidden="true" />
        <h1>Your cart is empty</h1>
        <p>Wander the city, find a kitchen, and add something you like.</p>
        <Link to="/" className="ck-primary">Explore SNS</Link>
      </div>
    );
  }

  const { restaurant, groups, totals } = cart;

  return (
    <div className="ck">
      <header className="ck-head">
        <button type="button" className="rm-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>
        <h1>Your cart</h1>
        <p>
          From <Link to={`../restaurant/${restaurant.id}`}>{restaurant.name}</Link>
          {' · '}
          {restaurant.etaMinutes}–{restaurant.etaMaxMinutes} min
        </p>
      </header>

      <div className="ck-layout">
        <div className="ck-lines">
          {groups.map((group) => (
            <section key={group.cuisine.id} className="ck-group">
              <header className="ck-group-head">
                <h2>
                  <span aria-hidden="true">{group.cuisine.icon}</span>
                  {group.cuisine.name}
                </h2>
                <span className="ck-group-sub">
                  from the {group.cuisine.name.toLowerCase()} menu
                </span>
              </header>

              <ul className="ck-items">
                {group.lines.map((line) => (
                  <li key={line.item.id} className="ck-item">
                    <span
                      className={line.item.isVeg ? 'rm-mark is-veg' : 'rm-mark is-nonveg'}
                      aria-hidden="true"
                    />
                    <div className="ck-item-body">
                      <p className="ck-item-name">{line.item.name}</p>
                      <p className="ck-item-unit">₹{line.item.price} each</p>
                    </div>

                    <div className="rm-stepper">
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(line.item.id, line.quantity - 1)}
                        aria-label={`Remove one ${line.item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => cart.setQuantity(line.item.id, line.quantity + 1)}
                        aria-label={`Add one more ${line.item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="ck-item-total">₹{line.lineTotal.toLocaleString('en-IN')}</p>

                    <button
                      type="button"
                      className="ck-remove"
                      onClick={() => cart.remove(line.item.id)}
                      aria-label={`Remove ${line.item.name} from the cart`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>

              <p className="ck-group-total">
                {group.cuisine.name} subtotal
                <strong>₹{group.subtotal.toLocaleString('en-IN')}</strong>
              </p>
            </section>
          ))}

          <button type="button" className="ck-clear" onClick={cart.clear}>
            Empty the cart
          </button>
        </div>

        <aside className="ck-summary">
          <h2>Bill</h2>
          <dl>
            <div>
              <dt>Item total</dt>
              <dd>₹{totals.itemTotal.toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt>
                Delivery fee
                <span className="ck-fee-note">
                  <Bike size={11} aria-hidden="true" />
                  {restaurant.deliveryType === 'aggregator' ? 'Aggregator' : 'Own fleet'}
                </span>
              </dt>
              <dd>₹{totals.deliveryFee.toLocaleString('en-IN')}</dd>
            </div>
            <div className="ck-total">
              <dt>Total</dt>
              <dd>₹{totals.total.toLocaleString('en-IN')}</dd>
            </div>
          </dl>

          <Link to="../checkout" className="ck-primary">Proceed to checkout</Link>

          <p className="ck-note">
            The delivery fee is this restaurant's own. No platform charge is added — the
            client has not set one, and inventing a percentage here would put a figure in
            front of a customer that nobody agreed.
          </p>
        </aside>
      </div>
    </div>
  );
}
