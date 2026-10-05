import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { SEARCH_EXAMPLES, search, type SearchResult } from '../../services/searchService';

/**
 * The top bar's search.
 *
 * A combobox over `services/searchService`. It navigates and nothing else — no
 * results page, because every result already has a destination and a list of
 * links to the same places would be a screen in between.
 *
 * Districts are local state in `FoodCityExperience` rather than routes, so this
 * cannot simply render `Link`s: it takes the same two callbacks the city and
 * the listing use, and a district result enters the district exactly as
 * clicking it on the map does.
 *
 * Keyboard: ↑/↓ move, Enter opens, Escape closes and keeps the text so a near
 * miss can be edited rather than retyped.
 */
export function SearchBox({
  onOpenRestaurant,
  onEnterDistrict,
}: {
  onOpenRestaurant: (restaurantId: string) => void;
  onEnterDistrict: (districtId: string) => void;
}) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = useMemo(() => search(text), [text]);

  /* Every write to the query goes through here, so the cursor cannot be left
     pointing at position 4 of a list that has just become two rows long. */
  const retype = (next: string) => {
    setText(next);
    setActive(0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (r: SearchResult) => {
    setOpen(false);
    setText('');
    inputRef.current?.blur();
    if (r.restaurantId) onOpenRestaurant(r.restaurantId);
    else if (r.districtId) onEnterDistrict(r.districtId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = results[active];
      if (picked) choose(picked);
    }
  };

  const showPanel = open && text.trim().length > 0;

  return (
    <div className="fc-search" ref={boxRef} data-open={showPanel || undefined}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10.5 10.5 L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={text}
        placeholder="Search restaurants, cuisines, dishes"
        aria-label="Search restaurants, cuisines and dishes"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        onChange={(e) => retype(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {showPanel ? (
        <div className="fc-search-pop">
          {results.length ? (
            <ul className="fc-search-list" id={listId} role="listbox" aria-label="Search results">
              {results.map((r, i) => (
                <li
                  key={r.key}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  data-active={i === active || undefined}
                  /* mousedown, not click: the input's blur would close the
                     panel before a click could land on the row. */
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(r);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  <span className="fc-search-kind" data-kind={r.kind}>
                    {r.kind === 'restaurant' ? 'Kitchen' : r.kind === 'dish' ? 'Dish' : 'District'}
                  </span>
                  <span className="fc-search-text">
                    <strong>{r.label}</strong>
                    <small>{r.sub}</small>
                  </span>
                  {r.meta ? <span className="fc-search-meta">{r.meta}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            /* Says which part failed, the same way Foodie AI does. */
            <p className="fc-search-none">
              Nothing on the city&rsquo;s menus matches &ldquo;{text.trim()}&rdquo;.
              <span>
                Try{' '}
                {SEARCH_EXAMPLES.map((ex, i) => (
                  <span key={ex}>
                    {i ? ', ' : ''}
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); retype(ex); }}>
                      {ex}
                    </button>
                  </span>
                ))}
                .
              </span>
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
