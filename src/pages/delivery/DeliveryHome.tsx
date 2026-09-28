import { Link } from 'react-router-dom';
import { Bike, IndianRupee, PackageCheck, Truck } from 'lucide-react';
import { StatCards } from '../../components/dashboard/StatCard';
import { StatusPill } from '../../components/dashboard/DataTable';
import { useAuth } from '../../auth/useAuth';
import { deliveryJobs, earnings } from '../../data/staffMock';

export function DeliveryHome() {
  const { profile } = useAuth();
  const firstName = profile?.name.split(' ')[0] ?? 'there';
  const active = deliveryJobs.filter((j) => j.stage !== 'Assigned' && j.stage !== 'Delivered');

  return (
    <div className="dh">
      <header className="dh-head">
        {/* The greeting is the point of this line, so it stays — it is not a
            repeat of the section name the shell header shows. */}
        <h2>Welcome, {firstName}</h2>
        <p>What is waiting, what is out, and what you have earned today.</p>
      </header>

      <StatCards
        stats={[
          { label: 'Assigned orders', value: String(deliveryJobs.filter((j) => j.stage === 'Assigned').length), hint: 'waiting to be accepted', Icon: PackageCheck },
          { label: 'Active deliveries', value: String(active.length), hint: 'on the road now', Icon: Truck },
          { label: 'Completed today', value: '8', hint: 'since 09:00', Icon: Bike },
          { label: "Today's earnings", value: `₹${earnings.today.toLocaleString('en-IN')}`, hint: 'paid out weekly', Icon: IndianRupee },
        ]}
      />

      <section className="dh-block">
        <div className="dh-block-head">
          <h3>Active deliveries</h3>
          <Link to="/delivery/active">Manage</Link>
        </div>

        {active.length ? (
          <ul className="dv-cards">
            {active.map((job) => (
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
                </dl>
                <Link to="/delivery/active" className="dv-card-go">
                  View delivery
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dt-empty">Nothing on the road right now.</p>
        )}
      </section>

      <p className="dh-mock-note">
        Mock data. Shaped like the `orders` and `delivery_services` tables it will read from.
      </p>
    </div>
  );
}
