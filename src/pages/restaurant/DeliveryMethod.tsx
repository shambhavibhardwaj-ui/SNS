import { useState } from 'react';
import { Bike, Check, Truck } from 'lucide-react';
import { DELIVERY_MODEL_LABEL, type DeliveryModel } from '../../data/admin/types';
import { getApplication, setDeliveryModel } from '../../services/onboardingService';
import { PageHead, Panel } from './PageHead';

const OPTIONS: {
  id: DeliveryModel;
  Icon: typeof Truck;
  blurb: string;
  points: string[];
}[] = [
  {
    id: 'aggregator',
    Icon: Truck,
    blurb: 'SNS assigns one of its delivery partners to each order.',
    points: [
      'No riders to hire, equip or roster.',
      'Orders are matched to whoever is free and nearby.',
      'An aggregator delivery fee applies to each order (RULE-03).',
    ],
  },
  {
    id: 'own_staff',
    Icon: Bike,
    blurb: 'Your own riders carry your orders.',
    points: [
      'You keep control of timing, packaging and the hand-over.',
      'You add and manage your delivery partners from this dashboard once you are live.',
      'A different fee applies, for restaurants delivering themselves (RULE-04).',
    ],
  },
];

/**
 * Step two: who carries the food.
 *
 * One decision, given a page, because it is the one that changes most: it sets
 * which of RULE-03 and RULE-04 applies, and it decides whether the owner ever
 * sees a workforce screen at all. Buried in the details form as a dropdown it
 * would be answered without being read.
 *
 * Neither option quotes a fee. The client has not given us the aggregator rate
 * or the own-delivery rate, and this is precisely the screen where an invented
 * number would be acted on.
 */
export function DeliveryMethod() {
  const app = getApplication();
  const [chosen, setChosen] = useState<DeliveryModel | null>(app.deliveryModel);
  const [saved, setSaved] = useState(false);

  const choose = (id: DeliveryModel) => {
    setChosen(id);
    setDeliveryModel(id);
    setSaved(true);
  };

  return (
    <>
      <PageHead
        title="Delivery method"
        lede="You can change this later, but it affects the fee structure on every order, so it is worth reading both."
      />

      <Panel title="How will your orders be delivered?">
        <div className="ob-options" role="radiogroup" aria-label="Delivery method">
          {OPTIONS.map(({ id, Icon, blurb, points }) => {
            const on = chosen === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                className="ob-option"
                data-on={on || undefined}
                onClick={() => choose(id)}
              >
                <span className="ob-option-head">
                  <span className="ob-option-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <strong>{DELIVERY_MODEL_LABEL[id]}</strong>
                  {on ? (
                    <span className="ob-option-on" aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : null}
                </span>
                <span className="ob-option-blurb">{blurb}</span>
                <ul className="ob-option-points">
                  {points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </button>
            );
          })}
        </div>

        {saved && chosen ? (
          <p className="ob-saved-row">
            <Check size={14} strokeWidth={3} aria-hidden="true" />
            Saved — <strong>{DELIVERY_MODEL_LABEL[chosen]}</strong>.
            {chosen === 'own_staff'
              ? ' You will be able to add your riders once the application is approved.'
              : null}
          </p>
        ) : null}

        <p className="ob-note">
          The fee each model attracts reads “Not set” across the platform. The client has not given
          us those percentages, and this page will not be the one to invent them.
        </p>
      </Panel>
    </>
  );
}
