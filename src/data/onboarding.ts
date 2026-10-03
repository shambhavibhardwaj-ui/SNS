/**
 * The restaurant owner's own onboarding record.
 *
 * This is the other side of `data/admin/applications.ts`. The admin file is a
 * queue of other people's applications; this is the one application belonging
 * to the signed-in owner, with the parts an admin never sees — which documents
 * are in, which came back, and what is still blank.
 *
 * Two rules, as everywhere else in the project.
 *
 * 1. Nothing here is a conclusion. There is no `progressPercent: 60` and no
 *    `canSubmit: true`. Fields and document states go in; completeness,
 *    readiness and the stage of the application are derived in
 *    `services/onboardingService.ts` from what is actually filled.
 * 2. It includes cases that fail. One document is rejected and one is missing,
 *    so the "needs replacement" path is shown to work rather than asserted.
 *
 * Shaped like the tables it becomes — `restaurant_applications`,
 * `application_documents`, `application_events` — so swapping in Supabase
 * changes the service bodies and nothing else. In particular, documents carry
 * a `storagePath` rather than a file: the real thing is an object in Supabase
 * Storage, and the row is the record of it.
 */
import { MOCK_TODAY } from './admin/platform';
import type { DeliveryModel } from './admin/types';

/* ------------------------------------------------------------ documents -- */

/**
 * Where a document stands.
 *
 * `Verified` is an admin's decision and `Needs Replacement` is an admin's
 * decision; the owner can only move a document to `Uploaded`. That asymmetry
 * is the point of the whole screen — the brief's complaint was owners having
 * to guess, so every state is named and dated rather than implied.
 */
export type DocumentState = 'Missing' | 'Uploaded' | 'Verified' | 'Needs Replacement';

export interface DocumentKind {
  id: string;
  label: string;
  /** What the admin is actually checking for, in the owner's words. */
  hint: string;
  /** A missing optional document never blocks submission. */
  required: boolean;
}

/** table: document_kinds — the checklist every applicant works through. */
export const DOCUMENT_KINDS: DocumentKind[] = [
  { id: 'registration', label: 'Business registration', hint: 'Certificate of incorporation, partnership deed, or shop-and-establishment registration.', required: true },
  { id: 'fssai', label: 'Food licence', hint: 'FSSAI licence or registration certificate, valid on the day you submit.', required: true },
  { id: 'identity', label: 'Owner identification', hint: 'Government photo ID for the person named as owner above.', required: true },
  { id: 'address', label: 'Address proof', hint: 'A utility bill or lease in the restaurant’s name, at the address above.', required: true },
  { id: 'bank', label: 'Bank details', hint: 'A cancelled cheque or bank letter. Payouts go here once you are live.', required: true },
  { id: 'insurance', label: 'Public liability insurance', hint: 'Optional, and it does not hold up your application.', required: false },
];

/** table: application_documents — one row per kind, per application. */
export interface ApplicationDocument {
  kindId: string;
  state: DocumentState;
  /** Null until something has been uploaded. */
  fileName: string | null;
  /** The object in Supabase Storage. Null while nothing is stored. */
  storagePath: string | null;
  uploadedAt: string | null;
  /** Set when an admin verifies or rejects it. */
  reviewedAt: string | null;
  /**
   * Why it came back. Required for `Needs Replacement` and meaningless
   * otherwise: "rejected" without a reason is the guessing the brief objects
   * to, moved one step along.
   */
  reviewNote: string | null;
}

/* ---------------------------------------------------------- the profile -- */

export type RestaurantType =
  | 'Fine dining'
  | 'Casual dining'
  | 'Quick service'
  | 'Café'
  | 'Bakery'
  | 'Cloud kitchen'
  | 'Food truck';

export const RESTAURANT_TYPES: RestaurantType[] = [
  'Fine dining',
  'Casual dining',
  'Quick service',
  'Café',
  'Bakery',
  'Cloud kitchen',
  'Food truck',
];

/**
 * table: restaurant_applications, as the owner sees it.
 *
 * Every field is nullable or empty-able on purpose. An application in progress
 * is mostly blanks, and a shape that cannot represent "not filled in yet"
 * forces the UI to invent placeholder values that then get submitted.
 */
export interface OwnerApplication {
  id: string;
  /** FK to the owner's profile. */
  ownerUserId: string;

  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  /** District the restaurant sits in, matching the city's districts. */
  locality: string;
  description: string;
  operatingHours: string;
  restaurantType: RestaurantType | null;

  /** RULE-03 / RULE-04 both hang off this one choice. */
  deliveryModel: DeliveryModel | null;

  /** A restaurant may register several, and each gets its own menu. */
  cuisines: string[];

  documents: ApplicationDocument[];

  /**
   * Null until the owner submits. Its presence is what makes the application
   * an admin's problem rather than a draft, so the stage is read from it
   * rather than from a separate status column the two sides could disagree on.
   */
  submittedAt: string | null;
  /** Set by an admin. Null while nobody has decided. */
  decision: 'Approved' | 'Rejected' | 'Needs Changes' | null;
  decidedAt: string | null;
  decisionNote: string | null;
}

const daysAgo = (n: number) =>
  new Date(MOCK_TODAY.getTime() - n * 86_400_000).toISOString().slice(0, 10);

/**
 * The demo owner's application, part-finished on purpose.
 *
 * It sits where a real one spends most of its life: details filled, delivery
 * chosen, documents half in — one verified, one rejected with a reason, one
 * never uploaded. That is the state the dashboard has to be good at, and an
 * all-green record would have proved nothing.
 */
export const ownerApplication: OwnerApplication = {
  id: 'APP-100',
  ownerUserId: 'demo-restaurant-owner',

  restaurantName: 'ABC Kitchen',
  ownerName: 'Rahul Desai',
  phone: '+91 98200 41123',
  email: 'onboard@mail.com',
  address: '14 Marigold Court, Tandoor Quarter',
  locality: 'Tandoor Quarter',
  description: 'Family kitchen running a clay tandoor and a biryani handi since 1998.',
  operatingHours: '11:00 – 23:30, daily',
  restaurantType: 'Casual dining',

  deliveryModel: 'aggregator',
  cuisines: ['North Indian', 'Biryani'],

  documents: [
    { kindId: 'registration', state: 'Verified', fileName: 'abc-kitchen-registration.pdf', storagePath: 'applications/APP-100/registration.pdf', uploadedAt: daysAgo(9), reviewedAt: daysAgo(6), reviewNote: null },
    { kindId: 'fssai', state: 'Verified', fileName: 'fssai-licence-2026.pdf', storagePath: 'applications/APP-100/fssai.pdf', uploadedAt: daysAgo(9), reviewedAt: daysAgo(6), reviewNote: null },
    { kindId: 'identity', state: 'Uploaded', fileName: 'rahul-desai-id.jpg', storagePath: 'applications/APP-100/identity.jpg', uploadedAt: daysAgo(2), reviewedAt: null, reviewNote: null },
    { kindId: 'address', state: 'Needs Replacement', fileName: 'electricity-bill.pdf', storagePath: 'applications/APP-100/address.pdf', uploadedAt: daysAgo(9), reviewedAt: daysAgo(5), reviewNote: 'The bill is dated March and we need one from the last 90 days. The name on it also reads “R. Desai” rather than the registered business name.' },
    { kindId: 'bank', state: 'Missing', fileName: null, storagePath: null, uploadedAt: null, reviewedAt: null, reviewNote: null },
    { kindId: 'insurance', state: 'Missing', fileName: null, storagePath: null, uploadedAt: null, reviewedAt: null, reviewNote: null },
  ],

  submittedAt: null,
  decision: null,
  decidedAt: null,
  decisionNote: null,
};

/* -------------------------------------------------------------- history -- */

/** table: application_events — an append-only log, newest last. */
export interface ApplicationEvent {
  id: string;
  at: string;
  /** Who caused it. The owner should be able to tell the two apart. */
  actor: 'owner' | 'admin' | 'system';
  label: string;
  detail?: string;
}

export const applicationEvents: ApplicationEvent[] = [
  { id: 'ev-1', at: daysAgo(10), actor: 'owner', label: 'Application started', detail: 'Account created and restaurant details begun.' },
  { id: 'ev-2', at: daysAgo(9), actor: 'owner', label: 'Documents uploaded', detail: 'Business registration, food licence and address proof.' },
  { id: 'ev-3', at: daysAgo(6), actor: 'admin', label: 'Two documents verified', detail: 'Business registration and food licence accepted.' },
  { id: 'ev-4', at: daysAgo(5), actor: 'admin', label: 'Address proof returned', detail: 'Out of date, and the name does not match the registration.' },
  { id: 'ev-5', at: daysAgo(2), actor: 'owner', label: 'Owner identification uploaded', detail: 'Awaiting review.' },
];

/** The city districts an applicant can pick, for the locality field. */
export const LOCALITIES = [
  'Tandoor Quarter',
  'Tiffin Lane',
  'Lantern Row',
  'Italian Street',
  'Dessert Lane',
  'Garden Terrace',
  'Mezcal Plaza',
  'Green Table',
  'Harbour Point',
  'Quiet Court',
];
