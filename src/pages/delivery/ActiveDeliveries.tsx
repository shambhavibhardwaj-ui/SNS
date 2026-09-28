import { useState } from 'react';
import { StatusPill } from '../../components/dashboard/DataTable';
import {
  DELIVERY_STAGES,
  deliveryJobs,
  type DeliveryJob,
  type DeliveryStage,
} from '../../data/staffMock';

/**
 * Active deliveries, with the status flow.
 *
 * Stage changes are local state — moving an order along does not write
 * anywhere yet. The flow is modelled as a fixed sequence so a delivery cannot
 * skip a step or go backwards, which is how it will need to behave once it is
 * writing to `orders`.
 */
export function ActiveDeliveries() {
  const [jobs, setJobs] = useState<DeliveryJob[]>(() =>
    deliveryJobs.filter((j) => j.stage !== 'Delivered'),
  );

  const advance = (id: string) =>
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== id) return j;
        const i = DELIVERY_STAGES.indexOf(j.stage);
        const next = DELIVERY_STAGES[Math.min(i + 1, DELIVERY_STAGES.length - 1)];
        return { ...j, stage: next as DeliveryStage };
      }),
    );

  return (
    <section className="dh">
      <header className="dh-head">
        <p>Move an order along as you pick it up and drop it off.</p>
      </header>

      <ul className="dv-cards is-wide">
        {jobs.map((job) => {
          const index = DELIVERY_STAGES.indexOf(job.stage);
          const done = job.stage === 'Delivered';
          return (
            <li key={job.id} className="dv-card">
              <div className="dv-card-top">
                <span className="dt-mono dv-id">Order {job.id}</span>
                <StatusPill value={job.stage} />
              </div>

              <dl className="dv-card-facts">
                <div>
                  <dt>Restaurant</dt>
                  <dd>{job.restaurant}</dd>
                </div>
                <div>
                  <dt>Customer</dt>
                  <dd>{job.customer}</dd>
                </div>
                <div>
                  <dt>Delivery address</dt>
                  <dd>{job.address}</dd>
                </div>
                <div>
                  <dt>Order value</dt>
                  <dd>₹{job.orderValue.toLocaleString('en-IN')}</dd>
                </div>
              </dl>

              <ol className="dv-flow" aria-label={`Status of order ${job.id}`}>
                {DELIVERY_STAGES.map((stage, i) => (
                  <li key={stage} data-state={i < index ? 'done' : i === index ? 'now' : 'todo'}>
                    <span aria-hidden="true" />
                    {stage}
                  </li>
                ))}
              </ol>

              <button
                type="button"
                className="dv-advance"
                onClick={() => advance(job.id)}
                disabled={done}
              >
                {done ? 'Delivered' : `Mark ${DELIVERY_STAGES[index + 1]}`}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="dh-mock-note">
        Stage changes are local for now — nothing is written back until orders are real.
      </p>
    </section>
  );
}
