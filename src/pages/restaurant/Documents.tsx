import { useRef, useState } from 'react';
import { AlertTriangle, Check, FileText, Upload, X } from 'lucide-react';
import { StatCards } from '../../components/dashboard/StatCard';
import {
  getDocuments, getDocumentSummary, getSteps, removeDocument, uploadDocument,
  type DocumentRow,
} from '../../services/onboardingService';
import { StageSteps } from './StageSteps';

/**
 * Step three: the paperwork.
 *
 * The brief's sharpest line is about this page — "don't make the owner guess
 * whether their documents uploaded correctly" — so every row states its state
 * in words, carries the date it changed, and, when it came back, says why in
 * the admin's own sentence. A coloured dot alone would be the guessing again
 * in a nicer font.
 *
 * Nothing is actually sent anywhere: there is no storage bucket yet. The file
 * picker records the name and moves the row to "Uploaded", which is exactly
 * what the Supabase version will do after the upload resolves.
 */
export function Documents() {
  const [, bump] = useState(0);
  const rows = getDocuments();
  const summary = getDocumentSummary();
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const onPick = (kindId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadDocument(kindId, file.name);
    /* Clear it, or picking the same file twice fires no change event. */
    e.target.value = '';
    bump((n) => n + 1);
  };

  return (
    <div className="dh ob">
      <StageSteps steps={getSteps()} />

      <StatCards
        stats={[
          { label: 'Verified', value: `${summary.verified} of ${summary.required}`, hint: 'accepted by the platform team', Icon: Check },
          { label: 'Awaiting review', value: String(summary.uploaded), hint: 'uploaded, not yet checked', Icon: FileText },
          { label: 'Needs replacement', value: String(summary.needsReplacement), hint: 'returned with a reason', Icon: AlertTriangle },
          { label: 'Not uploaded', value: String(summary.missingRequired), hint: 'required documents still missing', Icon: Upload },
        ]}
      />

      <section className="dh-block">
        <div className="dh-block-head">
          <div>
            <h3>Required documents</h3>
            <p className="dh-block-sub">
              Every row says where it stands and when it changed. If one comes back, the reason is
              on the row — you should never have to ask what was wrong with it.
            </p>
          </div>
        </div>

        <ul className="ob-docs">
          {rows.map((row) => (
            <li key={row.kindId} className="ob-doc" data-state={slug(row.state)} data-needs={row.needsOwner || undefined}>
              <div className="ob-doc-main">
                <p className="ob-doc-title">
                  <strong>{row.kind.label}</strong>
                  {row.kind.required ? null : <em className="ob-optional">optional</em>}
                  <DocState row={row} />
                </p>
                <p className="ob-doc-hint">{row.kind.hint}</p>

                {row.fileName ? (
                  <p className="ob-doc-file">
                    <FileText size={13} strokeWidth={2} aria-hidden="true" />
                    <span className="dt-mono">{row.fileName}</span>
                    <span className="ob-doc-when">
                      uploaded {row.uploadedAt}
                      {row.reviewedAt ? ` · reviewed ${row.reviewedAt}` : ''}
                    </span>
                  </p>
                ) : null}

                {/* The reason, in full. Truncating it would be the guessing
                    this page exists to end. */}
                {row.state === 'Needs Replacement' && row.reviewNote ? (
                  <p className="ob-doc-note">
                    <AlertTriangle size={14} strokeWidth={2} aria-hidden="true" />
                    <span><strong>Why it came back:</strong> {row.reviewNote}</span>
                  </p>
                ) : null}
              </div>

              <div className="ob-doc-actions">
                <input
                  ref={(el) => { inputs.current[row.kindId] = el; }}
                  type="file"
                  className="fc-sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={onPick(row.kindId)}
                  aria-label={`Upload ${row.kind.label}`}
                />
                <button
                  type="button"
                  className="ob-upload"
                  data-primary={row.needsOwner || undefined}
                  onClick={() => inputs.current[row.kindId]?.click()}
                >
                  <Upload size={14} strokeWidth={2} />
                  {row.state === 'Missing' ? 'Upload' : 'Replace'}
                </button>
                {row.fileName ? (
                  <button
                    type="button"
                    className="ob-remove"
                    onClick={() => { removeDocument(row.kindId); bump((n) => n + 1); }}
                  >
                    <X size={14} strokeWidth={2} />
                    Remove
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        <p className="an-note">
          Files are recorded but not stored — there is no storage bucket yet, so a reload forgets
          them. Accepted formats are PDF, JPG and PNG. Only the platform team can mark a document
          verified; uploading always lands on “Awaiting review”.
        </p>
      </section>
    </div>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

/** The state in words and colour, never colour alone. */
function DocState({ row }: { row: DocumentRow }) {
  const label =
    row.state === 'Uploaded' ? 'Awaiting review'
      : row.state === 'Missing' ? (row.kind.required ? 'Not uploaded' : 'Not provided')
        : row.state;
  return <span className="ob-doc-state" data-state={slug(row.state)}>{label}</span>;
}
