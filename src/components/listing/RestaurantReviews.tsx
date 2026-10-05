import { BadgeCheck, Star } from 'lucide-react';
import type { RestaurantReview, ReviewSummary } from '../../services/restaurantService';

/**
 * What people said, on the restaurant's own page.
 *
 * Built from the card in the reference rather than the marquee around it. Two
 * reasons the scrolling was dropped: a review that moves cannot be read, and
 * this sits under a menu someone is in the middle of ordering from — an
 * animation running beside the Add buttons competes with the task. Four
 * reviews, still, is the whole feature.
 *
 * Each card says which menu the order came from. A restaurant here runs
 * several and they are never merged, so "the biryani was cold" is about the
 * biryani menu and not about the kitchen — and a person reading reviews before
 * picking a tab is exactly who needs to know that.
 *
 * The headline figure is the restaurant's stored rating over every order it
 * has taken, not an average of the four below. A sample of four presented as
 * the score would contradict the number in the page header.
 */
export function RestaurantReviews({
  reviews,
  summary,
}: {
  reviews: RestaurantReview[];
  summary: ReviewSummary | null;
}) {
  if (!reviews.length || !summary) return null;

  return (
    <section className="rv" aria-labelledby="rv-title">
      <div className="rv-head">
        <div>
          <h2 id="rv-title">What people said</h2>
          <p>
            {summary.rating.toFixed(1)} across {summary.ratingCount.toLocaleString('en-IN')}{' '}
            ratings. Showing the {reviews.length} most recent.
          </p>
        </div>
      </div>

      <ul className="rv-cards">
        {reviews.map((r) => (
          <li key={r.id} className="rv-card">
            <div className="rv-card-top">
              {/* Initials, not a stock photograph: inventing a face for a
                  review nobody wrote would be the one dishonest pixel here. */}
              <span className="rv-avatar" aria-hidden="true">
                {r.author.charAt(0)}
              </span>
              <span className="rv-who">
                <strong>
                  {r.author}
                  {r.verifiedOrder ? (
                    <BadgeCheck size={14} strokeWidth={2.4} className="rv-verified" aria-hidden="true" />
                  ) : null}
                </strong>
                <em>
                  {r.verifiedOrder ? 'Ordered this' : 'Review only'} · {r.at}
                </em>
              </span>
              <span className="rv-stars" aria-label={`${r.rating} out of 5`}>
                {/* Five marks, so a 3 reads as a 3 at a glance rather than as a
                    number to compare. The value is in the label for readers. */}
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={12}
                    strokeWidth={2}
                    className={n <= r.rating ? 'is-on' : undefined}
                    aria-hidden="true"
                  />
                ))}
              </span>
            </div>

            <p className="rv-text">{r.text}</p>
            <p className="rv-menu">on the {r.cuisineName} menu</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
