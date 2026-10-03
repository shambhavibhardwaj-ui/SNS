/**
 * onboardingService — the only way the owner's dashboard reads its application.
 *
 * The pages compute nothing. Completeness, readiness to submit, the stage the
 * application has reached and every count of documents arrives from here
 * finished. That matters more on this screen than most: the owner is being
 * told whether they can submit, and a page that worked that out for itself
 * could disagree with the button it was drawing.
 *
 * Nothing here is stored as a conclusion. There is no `canSubmit` column — it
 * is recomputed from the fields and documents every time it is asked for, so
 * it cannot go stale against the form it describes.
 *
 * Replacing the mock source with Supabase changes these bodies only. Documents
 * in particular already carry a storage path rather than a file, so uploading
 * becomes a Storage call plus a row update, with no change of shape.
 */
import {
  applicationEvents, DOCUMENT_KINDS, ownerApplication,
  type ApplicationDocument, type ApplicationEvent, type DocumentKind,
  type DocumentState, type OwnerApplication,
} from '../data/onboarding';
import { MOCK_TODAY } from '../data/admin/platform';
import { notifySubmitted } from './applicationQueue';
import { DELIVERY_MODEL_LABEL, type DeliveryModel } from '../data/admin/types';

export type { ApplicationDocument, DocumentState, OwnerApplication };

/* --------------------------------------------------------------- stages -- */

export type Stage =
  | 'Details'
  | 'Delivery'
  | 'Documents'
  | 'Ready to submit'
  | 'Under review'
  | 'Needs changes'
  | 'Approved'
  | 'Rejected';

export interface StageStep {
  id: string;
  label: string;
  /** Done, where you are, or still ahead. */
  state: 'done' | 'current' | 'todo';
  hint: string;
}

/* ----------------------------------------------------------- the record -- */

export function getApplication(): OwnerApplication {
  return ownerApplication;
}

export function getDocumentKinds(): DocumentKind[] {
  return DOCUMENT_KINDS;
}

/* ------------------------------------------------------------ the parts -- */

/**
 * Which fields are filled, and which are not.
 *
 * Returned as the list rather than a count, because the page has to be able to
 * name what is missing. "4 of 10 complete" without saying which four is the
 * guessing game this dashboard exists to end.
 */
export interface FieldCheck {
  id: keyof OwnerApplication | 'cuisines';
  label: string;
  filled: boolean;
  /** Blank optional fields should not read as errors. */
  required: boolean;
}

export function getDetailChecks(app = ownerApplication): FieldCheck[] {
  const text = (v: string) => v.trim().length > 0;
  return [
    { id: 'restaurantName', label: 'Restaurant name', filled: text(app.restaurantName), required: true },
    { id: 'ownerName', label: 'Owner or manager name', filled: text(app.ownerName), required: true },
    { id: 'phone', label: 'Phone number', filled: text(app.phone), required: true },
    { id: 'email', label: 'Email', filled: text(app.email), required: true },
    { id: 'address', label: 'Restaurant address', filled: text(app.address), required: true },
    { id: 'locality', label: 'Location', filled: text(app.locality), required: true },
    { id: 'restaurantType', label: 'Restaurant type', filled: app.restaurantType !== null, required: true },
    { id: 'operatingHours', label: 'Operating hours', filled: text(app.operatingHours), required: true },
    { id: 'cuisines', label: 'Cuisines', filled: app.cuisines.length > 0, required: true },
    { id: 'description', label: 'Description', filled: text(app.description), required: false },
  ];
}

export interface DocumentRow extends ApplicationDocument {
  kind: DocumentKind;
  /** True when the owner has to act: nothing uploaded, or it came back. */
  needsOwner: boolean;
}

/** Documents joined to their kind, in checklist order. */
export function getDocuments(app = ownerApplication): DocumentRow[] {
  return DOCUMENT_KINDS.map((kind) => {
    const row =
      app.documents.find((d) => d.kindId === kind.id)
      ?? { kindId: kind.id, state: 'Missing' as DocumentState, fileName: null, storagePath: null, uploadedAt: null, reviewedAt: null, reviewNote: null };
    return {
      ...row,
      kind,
      needsOwner:
        row.state === 'Needs Replacement' || (row.state === 'Missing' && kind.required),
    };
  });
}

export interface DocumentSummary {
  total: number;
  required: number;
  uploaded: number;
  verified: number;
  needsReplacement: number;
  missingRequired: number;
  /** Share of the *required* checklist that an admin has accepted. */
  verifiedPercent: number;
}

export function getDocumentSummary(app = ownerApplication): DocumentSummary {
  const rows = getDocuments(app);
  const required = rows.filter((r) => r.kind.required);
  const count = (s: DocumentState) => rows.filter((r) => r.state === s).length;
  const verifiedRequired = required.filter((r) => r.state === 'Verified').length;

  return {
    total: rows.length,
    required: required.length,
    uploaded: count('Uploaded'),
    verified: count('Verified'),
    needsReplacement: count('Needs Replacement'),
    missingRequired: required.filter((r) => r.state === 'Missing').length,
    verifiedPercent: required.length ? (verifiedRequired / required.length) * 100 : 0,
  };
}

/* -------------------------------------------------------- can we submit -- */

export interface Readiness {
  canSubmit: boolean;
  /** Every reason it is not ready, in the order a person should fix them. */
  blockers: { id: string; label: string; href: string }[];
  detailsComplete: boolean;
  deliveryChosen: boolean;
  documentsComplete: boolean;
  /** How far through, for the progress meter. Derived, never stored. */
  percent: number;
}

/**
 * Whether the application can go to an admin, and what is stopping it.
 *
 * A document that is merely `Uploaded` does not block submission — waiting for
 * an admin to verify it is an admin's job, not the owner's, and holding the
 * whole application for it would deadlock: an admin only looks once it is
 * submitted.
 */
export function getReadiness(app = ownerApplication): Readiness {
  const details = getDetailChecks(app);
  const missingDetails = details.filter((d) => d.required && !d.filled);
  const docs = getDocuments(app);
  const missingDocs = docs.filter((d) => d.kind.required && d.state === 'Missing');
  const returnedDocs = docs.filter((d) => d.state === 'Needs Replacement');

  /* Listed in the order the steps run — details, then documents, then
     delivery — so working down the list is the same journey as working
     through the dashboard. */
  const blockers: Readiness['blockers'] = [];
  for (const d of missingDetails) {
    blockers.push({ id: `detail-${String(d.id)}`, label: `${d.label} is empty`, href: '/restaurant/details' });
  }
  for (const d of missingDocs) {
    blockers.push({ id: `doc-${d.kindId}`, label: `${d.kind.label} has not been uploaded`, href: '/restaurant/documents' });
  }
  for (const d of returnedDocs) {
    blockers.push({ id: `redo-${d.kindId}`, label: `${d.kind.label} needs replacing`, href: '/restaurant/documents' });
  }
  if (!app.deliveryModel) {
    blockers.push({ id: 'delivery', label: 'No delivery method chosen', href: '/restaurant/delivery' });
  }

  const detailsComplete = missingDetails.length === 0;
  const deliveryChosen = app.deliveryModel !== null;
  const documentsComplete = missingDocs.length === 0 && returnedDocs.length === 0;

  /* Three equal parts. Weighting them would be inventing an importance the
     client has not expressed, and all three are compulsory anyway. */
  const requiredDetails = details.filter((d) => d.required);
  const requiredDocs = docs.filter((d) => d.kind.required);
  const detailShare = requiredDetails.filter((d) => d.filled).length / requiredDetails.length;
  const docShare =
    requiredDocs.filter((d) => d.state !== 'Missing' && d.state !== 'Needs Replacement').length
    / requiredDocs.length;

  return {
    canSubmit: detailsComplete && deliveryChosen && documentsComplete,
    blockers,
    detailsComplete,
    deliveryChosen,
    documentsComplete,
    percent: ((detailShare + (deliveryChosen ? 1 : 0) + docShare) / 3) * 100,
  };
}

/* --------------------------------------------------------------- stage -- */

/**
 * Where the application has got to.
 *
 * Read from the record — a decision, then a submission date, then how much is
 * filled — rather than kept in a status column. A stored stage is a second
 * opinion about the same facts, and the two drift the first time a document is
 * returned without anyone remembering to move it back.
 */
export function getStage(app = ownerApplication): Stage {
  if (app.decision === 'Approved') return 'Approved';
  if (app.decision === 'Rejected') return 'Rejected';
  if (app.decision === 'Needs Changes') return 'Needs changes';
  if (app.submittedAt) return 'Under review';

  const r = getReadiness(app);
  if (r.canSubmit) return 'Ready to submit';
  if (!r.detailsComplete) return 'Details';
  if (!r.documentsComplete) return 'Documents';
  return 'Delivery';
}

/** The stepper across the top of the dashboard. */
export function getSteps(app = ownerApplication): StageStep[] {
  const r = getReadiness(app);
  const submitted = Boolean(app.submittedAt);
  /*
   * Only a final answer finishes the review step.
   *
   * "Needs changes" is a decision but not an ending — the application is back
   * with the owner and will be read again. Marking the step done there told
   * them the review was over while they still had work to do, and the step
   * after it was the one lit up.
   */
  const decided = app.decision === 'Approved' || app.decision === 'Rejected';

  const mark = (done: boolean, current: boolean): StageStep['state'] =>
    done ? 'done' : current ? 'current' : 'todo';

  return [
    {
      id: 'details',
      label: 'Restaurant details',
      state: mark(r.detailsComplete, !r.detailsComplete),
      hint: 'Name, owner, contact, address, hours and cuisines.',
    },
    {
      id: 'documents',
      label: 'Documents',
      state: mark(r.documentsComplete, r.detailsComplete && !r.documentsComplete),
      hint: 'Registration, licence, identification, address and bank details.',
    },
    {
      id: 'delivery',
      label: 'Delivery method',
      state: mark(r.deliveryChosen, r.detailsComplete && r.documentsComplete && !r.deliveryChosen),
      hint: 'Who carries the orders. It sets which fee structure applies.',
    },
    {
      id: 'submit',
      label: 'Submit',
      state: mark(submitted, !submitted && r.canSubmit),
      hint: 'Sends the application to the platform team.',
    },
    {
      id: 'review',
      label: 'Admin review',
      state: mark(decided, submitted && !decided),
      /* Once there is an answer the step says what it was, rather than still
         describing the three things that might happen. */
      hint:
        app.decision === 'Approved' ? 'Approved — your restaurant is on the platform.'
          : app.decision === 'Rejected' ? 'Rejected. The reason is on your overview.'
            : app.decision === 'Needs Changes' ? 'Returned for changes. Fix them and resubmit.'
              : submitted ? 'With the platform team now.'
                : 'A person reads it and approves, returns or rejects it.',
    },
  ];
}

/* ------------------------------------------------------------- summary -- */

export interface OwnerOverview {
  stage: Stage;
  percent: number;
  canSubmit: boolean;
  blockers: Readiness['blockers'];
  documents: DocumentSummary;
  deliveryLabel: string | null;
  cuisineCount: number;
  /** Days the application has been open, from the first event. */
  daysOpen: number;
  submittedAt: string | null;
  decision: OwnerApplication['decision'];
}

export function getOverview(app = ownerApplication): OwnerOverview {
  const r = getReadiness(app);
  const first = applicationEvents[0]?.at;
  const daysOpen = first
    ? Math.max(
        0,
        Math.round((MOCK_TODAY.getTime() - new Date(`${first}T00:00:00Z`).getTime()) / 86_400_000),
      )
    : 0;

  return {
    stage: getStage(app),
    percent: r.percent,
    canSubmit: r.canSubmit,
    blockers: r.blockers,
    documents: getDocumentSummary(app),
    deliveryLabel: app.deliveryModel ? DELIVERY_MODEL_LABEL[app.deliveryModel] : null,
    cuisineCount: app.cuisines.length,
    daysOpen,
    submittedAt: app.submittedAt,
    decision: app.decision,
  };
}

export function getTimeline(): ApplicationEvent[] {
  /* Newest first: the thing that just happened is the thing being looked for. */
  return [...applicationEvents].reverse();
}

/* --------------------------------------------------------------- writes -- */

/*
 * Everything below changes the record. They are deliberately plain functions
 * over the mock object rather than React state, so the Supabase versions drop
 * in behind the same signatures — `update ... where id = $1`, a Storage upload,
 * an insert into `application_events`.
 *
 * They are not persisted: a reload loses them, exactly as placed orders do
 * elsewhere in the project. That is a missing backend, not a missing design.
 */

export function saveDetails(patch: Partial<OwnerApplication>): OwnerApplication {
  Object.assign(ownerApplication, patch);
  return ownerApplication;
}

export function setDeliveryModel(model: DeliveryModel): OwnerApplication {
  ownerApplication.deliveryModel = model;
  return ownerApplication;
}

/**
 * Record an upload.
 *
 * Always lands on `Uploaded`, never `Verified` — an owner cannot verify their
 * own document, and a function that let them would make the whole checklist
 * decorative. Replacing a returned document clears the note with it, so stale
 * rejection text cannot sit under a fresh file.
 */
export function uploadDocument(kindId: string, fileName: string): OwnerApplication {
  const at = MOCK_TODAY.toISOString().slice(0, 10);
  const existing = ownerApplication.documents.find((d) => d.kindId === kindId);
  const next: ApplicationDocument = {
    kindId,
    state: 'Uploaded',
    fileName,
    storagePath: `applications/${ownerApplication.id}/${kindId}`,
    uploadedAt: at,
    reviewedAt: null,
    reviewNote: null,
  };
  if (existing) Object.assign(existing, next);
  else ownerApplication.documents.push(next);

  applicationEvents.push({
    id: `ev-${applicationEvents.length + 1}`,
    at,
    actor: 'owner',
    label: `${DOCUMENT_KINDS.find((k) => k.id === kindId)?.label ?? kindId} uploaded`,
    detail: 'Awaiting review.',
  });
  return ownerApplication;
}

export function removeDocument(kindId: string): OwnerApplication {
  const existing = ownerApplication.documents.find((d) => d.kindId === kindId);
  if (existing) {
    Object.assign(existing, {
      state: 'Missing' as DocumentState,
      fileName: null,
      storagePath: null,
      uploadedAt: null,
      reviewedAt: null,
      reviewNote: null,
    });
  }
  return ownerApplication;
}

/** Submit, if it is actually ready. The guard is here, not on the button. */
export function submitApplication(): { ok: boolean; reason?: string } {
  const r = getReadiness();
  if (!r.canSubmit) {
    return { ok: false, reason: 'The application is not complete yet.' };
  }
  const at = MOCK_TODAY.toISOString().slice(0, 10);
  ownerApplication.submittedAt = at;
  /* A resubmission after changes were requested clears the old decision, or
     the owner would read "Rejected" above an application that is back in the
     queue. */
  ownerApplication.decision = null;
  ownerApplication.decidedAt = null;
  applicationEvents.push({
    id: `ev-${applicationEvents.length + 1}`,
    at,
    actor: 'owner',
    label: 'Application submitted',
    detail: 'Sent to the platform team for review.',
  });
  /* Tells the admin dashboard a row has arrived. */
  notifySubmitted();
  return { ok: true };
}
