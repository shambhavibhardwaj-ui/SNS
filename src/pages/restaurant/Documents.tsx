import { useRef, useState } from 'react';
import { AlertTriangle, Check, FileText, Upload, X } from 'lucide-react';
import { PageHead, Panel } from './PageHead';
import {
  getDocuments, getDocumentSummary, removeDocument, uploadDocument,
  type DocumentRow,
} from '../../services/onboardingService';

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
    <>
      <PageHead
        title="Restaurant documents"
        lede="Every row says where it stands and when it changed. If one comes back, the reason is on the row — you should never have to ask what was wrong with it."
      />

      {/* The four states, counted. Small because it is orientation, not the
          work: the work is the list underneath. */}
      <ul className="ob-tally">
        <li data-tone="good">
          <Check size={15} strokeWidth={2.5} aria-hidden="true" />
          <strong>{summary.verified}</strong>
          <span>verified of {summary.required}</span>
        </li>
        <li data-tone="busy">
          <FileText size={15} strokeWidth={2.5} aria-hidden="true" />
          <strong>{summary.uploaded}</strong>
          <span>awaiting review</span>
        </li>
        <li data-tone="bad">
          <AlertTriangle size={15} strokeWidth={2.5} aria-hidden="true" />
          <strong>{summary.needsReplacement}</strong>
          <span>need replacing</span>
        </li>
        <li>
          <Upload size={15} strokeWidth={2.5} aria-hidden="true" />
          <strong>{summary.missingRequired}</strong>
          <span>not uploaded</span>
        </li>
      </ul>

      <Panel>
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

        <p className="ob-note">
          Files are recorded but not stored — there is no storage bucket yet, so a reload forgets
          them. Accepted formats are PDF, JPG and PNG. Only the platform team can mark a document
          verified; uploading always lands on “Awaiting review”.
        </p>
      </Panel>
    </>
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
