/**
 * The one application queue, shared by both sides.
 *
 * Before this, the owner's application and the admin's queue were two separate
 * arrays that happened to describe the same kind of thing. An owner could
 * submit and nothing appeared for the admin; an admin could approve and the
 * owner never heard. This module is the join: the owner's record enters the
 * queue when it is submitted, and a decision made in the admin dashboard is
 * written back onto that same record.
 *
 * It is a module-level store with a subscription rather than React state,
 * because two dashboards on two routes have to see the same thing. Components
 * read it through `useSyncExternalStore`, so a decision made in one re-renders
 * the other without either knowing the other exists.
 *
 * In Supabase this whole file collapses into a table and a realtime channel:
 * `getQueue()` is a select, `decideApplication()` is an update, and `subscribe`
 * is `.on('postgres_changes')`. The shape the components see does not change.
 */
import { restaurantApplications } from '../data/admin/applications';
import { applicationEvents, ownerApplication } from '../data/onboarding';
import { MOCK_TODAY } from '../data/admin/platform';
import type { ApplicationStatus, RestaurantApplication } from '../data/admin/types';

/** The owner's application, so both sides can recognise it. */
export const OWNER_APPLICATION_ID = ownerApplication.id;

/* ---------------------------------------------------------- subscription -- */

const listeners = new Set<() => void>();
/**
 * Bumped on every write.
 *
 * `useSyncExternalStore` compares snapshots by identity, and the queue is
 * rebuilt each read, so returning the array itself would look changed every
 * time and loop forever. A number is a stable snapshot.
 */
let version = 0;

export function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getVersion(): number {
  return version;
}

function emit(): void {
  version += 1;
  for (const fn of listeners) fn();
}

/* ----------------------------------------------------------- the queue -- */

/** What an admin's decision means for the owner's own record. */
function ownerStatus(): ApplicationStatus {
  if (ownerApplication.decision) return ownerApplication.decision;
  /* Submitted and nobody has looked yet. */
  return 'Pending';
}

/**
 * The owner's record in the admin's shape.
 *
 * A projection, not a copy kept in step: the owner's record stays the single
 * source of truth for its own fields, and this is how the admin reads them.
 */
export function ownerApplicationAsRow(): RestaurantApplication | null {
  const a = ownerApplication;
  /* Not submitted is not in the queue. A draft is nobody else's business. */
  if (!a.submittedAt || !a.deliveryModel) return null;

  return {
    id: a.id,
    restaurantName: a.restaurantName,
    ownerName: a.ownerName,
    phone: a.phone,
    email: a.email,
    address: a.address,
    cuisines: a.cuisines,
    description: a.description,
    operatingHours: a.operatingHours,
    deliveryModel: a.deliveryModel,
    submittedAt: a.submittedAt,
    status: ownerStatus(),
    reviewNote: a.decisionNote ?? undefined,
  };
}

/**
 * Every application an admin should see, newest first.
 *
 * The owner's sits among the seed rows rather than above them — it is one more
 * application, and pinning it to the top would be a demo trick that an admin
 * with two real submissions would immediately notice.
 */
export function getQueue(): RestaurantApplication[] {
  const owner = ownerApplicationAsRow();
  const rows = owner ? [owner, ...restaurantApplications] : [...restaurantApplications];
  return rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}

/* -------------------------------------------------------------- writes -- */

/** Decisions on the seed rows, which stay fixtures rather than being mutated. */
const seedDecisions = new Map<string, { status: ApplicationStatus; reason?: string }>();

export interface DecisionEntry {
  id: string;
  restaurantName: string;
  status: ApplicationStatus;
  reason?: string;
  /** True when the decision reached a real record rather than this session. */
  writtenBack: boolean;
}

/** What the admin has decided since the page loaded, newest last. */
const decisionLog: DecisionEntry[] = [];

export function getDecisionLog(): DecisionEntry[] {
  return decisionLog;
}

/**
 * Record an admin's decision.
 *
 * For the owner's application this writes through to their record and logs an
 * event against it, which is what makes the decision visible on their
 * dashboard. For the seed rows it is held here, so the fixtures stay fixtures.
 */
export function decideApplication(
  id: string,
  status: ApplicationStatus,
  reason?: string,
): void {
  if (id === OWNER_APPLICATION_ID) {
    /* 'Pending' and 'Under Review' are queue states, not outcomes: the owner's
       record only carries a decision once there is one to carry. */
    const decided = status === 'Approved' || status === 'Rejected' || status === 'Needs Changes';
    const at = MOCK_TODAY.toISOString().slice(0, 10);

    ownerApplication.decision = decided ? status : null;
    ownerApplication.decidedAt = decided ? at : null;
    ownerApplication.decisionNote = reason ?? null;

    if (status === 'Needs Changes') {
      /* Returned means it is theirs again, so it leaves the queue until they
         resubmit. Leaving it in would have an admin reviewing an application
         they have just asked someone else to change. */
      ownerApplication.submittedAt = null;
    }

    applicationEvents.push({
      id: `ev-${applicationEvents.length + 1}`,
      at,
      actor: 'admin',
      label:
        status === 'Approved' ? 'Application approved'
          : status === 'Rejected' ? 'Application rejected'
            : status === 'Needs Changes' ? 'Changes requested'
              : 'Application moved to under review',
      detail: reason,
    });
  } else {
    seedDecisions.set(id, { status, reason });
  }

  const row = getQueue().find((a) => a.id === id);
  decisionLog.push({
    id,
    restaurantName: row?.restaurantName ?? id,
    status,
    reason,
    writtenBack: id === OWNER_APPLICATION_ID,
  });
  emit();
}

/** The queue with this session's decisions on the seed rows applied. */
export function getQueueWithDecisions(): RestaurantApplication[] {
  return getQueue().map((a) => {
    const d = seedDecisions.get(a.id);
    return d ? { ...a, status: d.status, reviewNote: d.reason ?? a.reviewNote } : a;
  });
}

/** Which rows an admin has acted on this session, for the UI's "decided" mark. */
export function getDecidedIds(): Set<string> {
  const ids = new Set(seedDecisions.keys());
  if (ownerApplication.decision) ids.add(OWNER_APPLICATION_ID);
  return ids;
}

/** Submitting is a write to the shared queue too, so the admin sees it at once. */
export function notifySubmitted(): void {
  emit();
}
