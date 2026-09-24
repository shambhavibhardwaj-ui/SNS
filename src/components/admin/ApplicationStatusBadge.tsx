import type { ApplicationStatus } from '../../data/admin/types';

/**
 * Status badge for an application.
 *
 * The tones are fixed per status and drawn from the brand palette, so the same
 * status never looks different on two screens.
 */
const TONE: Record<ApplicationStatus, string> = {
  Pending: 'warn',
  'Under Review': 'busy',
  Approved: 'good',
  Rejected: 'bad',
  'Needs Changes': 'accent',
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className="dt-pill" data-tone={TONE[status]}>
      {status}
    </span>
  );
}
