import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Bike, Clock, Flame, Leaf, Minus, Plus, ShoppingBag, Star,
} from 'lucide-react';
import { useCart } from '../cart/useCart';
import { getMenusForRestaurant, getRestaurantById } from '../services/restaurantService';
import type { MenuItem } from '../data/types';

/**
 * A restaurant, and its menus.
 *
 * Menus — plural, and that is the whole point. The service hands back one
 * `CuisineMenu` per cuisine and the page renders exactly one at a time behind a
 * tab. There is deliberately no "All" tab: merging the cuisines into a single
 * list is the thing the brief rules out, and the surest way to keep it ruled
 * out is to give the UI no route to it.
 */
export function RestaurantMenu() {
  const { restaurantId = '' } = useParams();
  const navigate = useNavigate();
  const cart = useCart();

  const restaurant = useMemo(() => getRestaurantById(restaurantId), [restaurantId]);
  const menus = useMemo(() => getMenusForRestaurant(restaurantId), [restaurantId]);

  const [activeMenuId, setActiveMenuId] = useState(() => menus[0]?.menuId ?? '');
  const [vegOnly, setVegOnly] = useState(false);
  /* Set when an add is refused because the cart belongs to another kitchen. */
  const [conflict, setConflict] = useState<MenuItem | null>(null);

  if (!restaurant) {
    return (
      <div className="rm-missing">
        <p>That restaurant could not be found.</p>
        <Link to="/" className="rm-back-link">Back to SNS</Link>
      </div>
    );
  }

  const active = menus.find((m) => m.menuId === activeMenuId) ?? menus[0];

  const onAdd = (item: MenuItem) => {
    if (cart.add(item, restaurant.id) === 'needs-confirm') setConflict(item);
  };

  return (
    <div className="rm">
      <header className="rm-head">
        <button type="button" className="rm-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rm-title">
          <h1>{restaurant.name}</h1>
          <p className="rm-desc">{restaurant.description}</p>

          <ul className="rm-facts">
            <li className="rm-rating">
              <Star size={13} fill="currentColor" strokeWidth={0} />
              {restaurant.rating.toFixed(1)}
              <span>({restaurant.ratingCount.toLocaleString('en-IN')})</span>
            </li>
            <li><Clock size={13} />{restaurant.etaMinutes}–{restaurant.etaMaxMinutes} min</li>
            <li><Bike size={13} />₹{restaurant.deliveryFee} delivery</li>
            <li>{restaurant.priceRange} · ₹{restaurant.priceForTwo} for two</li>
            {restaurant.isPureVeg ? (
              <li className="rm-veg-flag"><Leaf size={13} />Pure veg kitchen</li>
            ) : null}
          </ul>

          {!restaurant.isOpen ? (
            <p className="rm-closed">Closed right now — you can look, but not order.</p>
          ) : null}
        </div>
      </header>

      {/* One tab per cuisine. Each opens that cuisine's own menu. */}
      <nav className="rm-tabs" aria-label="Cuisines at this restaurant">
        <p className="rm-tabs-note">
          {menus.length === 1
            ? 'One cuisine, one menu.'
            : `${menus.length} cuisines, ${menus.length} separate menus.`}
        </p>
        <div className="rm-tabs-row" role="tablist">
          {menus.map((menu) => (
            <button
              key={menu.menuId}
              type="button"
              role="tab"
              id={`tab-${menu.menuId}`}
              aria-selected={menu.menuId === active?.menuId}
              aria-controls={`panel-${menu.menuId}`}
              className="rm-tab"
              data-on={menu.menuId === active?.menuId || undefined}
              onClick={() => setActiveMenuId(menu.menuId)}
            >
              <span className="rm-tab-icon" aria-hidden="true">{menu.cuisine.icon}</span>
              <span className="rm-tab-text">
                <strong>{menu.cuisine.name}</strong>
                <small>{menu.itemCount} dishes · from ₹{menu.fromPrice}</small>
              </span>
            </button>
          ))}
        </div>
      </nav>

      {active ? (
        <section
          className="rm-menu"
          role="tabpanel"
          id={`panel-${active.menuId}`}
          aria-labelledby={`tab-${active.menuId}`}
        >
          <div className="rm-menu-head">
            <div>
              <h2>{active.cuisine.name}</h2>
              <p>{active.cuisine.description}</p>
            </div>
            {active.isAllVeg ? null : (
              <label className="rm-veg-toggle">
                <input
                  type="checkbox"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                />
                <span>Veg only</span>
              </label>
            )}
          </div>

          {active.sections.map((section) => {
            const items = vegOnly ? section.items.filter((i) => i.isVeg) : section.items;
            if (!items.length) return null;

            return (
              <div key={section.category} className="rm-section">
                <h3 className="rm-section-title">{section.category}</h3>
                <ul className="rm-items">
                  {items.map((item) => (
                    <MenuRow
                      key={item.id}
                      item={item}
                      quantity={cart.quantityOf(item.id)}
                      disabled={!restaurant.isOpen}
                      onAdd={() => onAdd(item)}
                      onSet={(q) => cart.setQuantity(item.id, q)}
                    />
                  ))}
                </ul>
              </div>
            );
          })}

          {vegOnly && active.sections.every((s) => !s.items.some((i) => i.isVeg)) ? (
            <p className="rm-empty">Nothing vegetarian on this menu.</p>
          ) : null}
        </section>
      ) : (
        <p className="rm-empty">This restaurant has no menu yet.</p>
      )}

      {/* The bar only exists when there is something in the cart. */}
      {!cart.isEmpty ? (
        <div className="rm-cartbar" role="status">
          <span>
            <strong>{cart.totals.itemCount}</strong>
            {cart.totals.itemCount === 1 ? ' item' : ' items'}
            <span className="rm-cartbar-sep">·</span>
            ₹{cart.totals.itemTotal.toLocaleString('en-IN')}
          </span>
          <Link to="../cart" className="rm-cartbar-go">
            <ShoppingBag size={15} />
            View cart
          </Link>
        </div>
      ) : null}

      {conflict ? (
        <ReplaceCartDialog
          itemName={conflict.name}
          currentRestaurant={cart.restaurant?.name ?? 'another restaurant'}
          onCancel={() => setConflict(null)}
          onConfirm={() => {
            cart.replaceWith(conflict, restaurant.id);
            setConflict(null);
          }}
        />
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------------- one row -- */

function MenuRow({
  item,
  quantity,
  disabled,
  onAdd,
  onSet,
}: {
  item: MenuItem;
  quantity: number;
  disabled: boolean;
  onAdd: () => void;
  onSet: (quantity: number) => void;
}) {
  return (
    <li className="rm-item">
      <div className="rm-item-body">
        <p className="rm-item-name">
          <span className={item.isVeg ? 'rm-mark is-veg' : 'rm-mark is-nonveg'} aria-hidden="true" />
          <span className="fc-sr-only">{item.isVeg ? 'Vegetarian. ' : 'Non-vegetarian. '}</span>
          {item.name}
          {item.isSpicy ? (
            <span className="rm-spicy" title="Spicy">
              <Flame size={12} />
              <span className="fc-sr-only">Spicy</span>
            </span>
          ) : null}
        </p>
        <p className="rm-item-price">₹{item.price}</p>
        <p className="rm-item-desc">{item.description}</p>
      </div>

      {quantity === 0 ? (
        <button
          type="button"
          className="rm-add"
          onClick={onAdd}
          disabled={disabled}
          title={disabled ? 'This restaurant is closed' : undefined}
        >
          Add
        </button>
      ) : (
        <div className="rm-stepper">
          <button type="button" onClick={() => onSet(quantity - 1)} aria-label={`Remove one ${item.name}`}>
            <Minus size={14} />
          </button>
          <span aria-live="polite">{quantity}</span>
          <button type="button" onClick={() => onSet(quantity + 1)} aria-label={`Add one more ${item.name}`}>
            <Plus size={14} />
          </button>
        </div>
      )}
    </li>
  );
}

/* ---------------------------------------------------------------- dialog -- */

/**
 * One delivery comes from one kitchen, so switching restaurants means starting
 * the cart again. Asked rather than done silently — quietly emptying someone's
 * cart is worse than refusing the tap.
 */
function ReplaceCartDialog({
  itemName,
  currentRestaurant,
  onCancel,
  onConfirm,
}: {
  itemName: string;
  currentRestaurant: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="rm-dialog-wrap" role="dialog" aria-modal="true" aria-labelledby="rm-dialog-title">
      <div className="rm-dialog-scrim" onClick={onCancel} aria-hidden="true" />
      <div className="rm-dialog">
        <h2 id="rm-dialog-title">Start a new cart?</h2>
        <p>
          Your cart has food from <strong>{currentRestaurant}</strong>. One delivery comes from
          one kitchen, so adding <strong>{itemName}</strong> will empty it and start again.
        </p>
        <div className="rm-dialog-actions">
          <button type="button" className="rm-dialog-cancel" onClick={onCancel}>
            Keep my cart
          </button>
          <button type="button" className="rm-dialog-confirm" onClick={onConfirm}>
            Start new cart
          </button>
        </div>
      </div>
    </div>
  );
}
