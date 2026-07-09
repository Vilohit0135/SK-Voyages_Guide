function Glyph({ size = 22, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Steering wheel — the driver app. */
function DriverIcon() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="8.75" />
      <circle cx="12" cy="12" r="2.9" />
      <path d="M12 3.25V9.1M4.45 16.4l5.05-2.95M19.55 16.4 14.5 13.45" />
    </Glyph>
  );
}

/** Clipboard with a check — the supervisor app. */
function SupervisorIcon() {
  return (
    <Glyph>
      <path d="M9 5.25H7.25A1.75 1.75 0 0 0 5.5 7v12.25A1.75 1.75 0 0 0 7.25 21h9.5a1.75 1.75 0 0 0 1.75-1.75V7A1.75 1.75 0 0 0 16.75 5.25H15" />
      <rect x="9" y="3" width="6" height="4.5" rx="1.4" />
      <path d="m9.4 14.2 2 2 3.4-4" />
    </Glyph>
  );
}

/** Storefront — the vendor dashboard. */
function VendorIcon() {
  return (
    <Glyph>
      <path d="M4.5 10.4V20h15v-9.6" />
      <path d="M5.4 4h13.2l1.9 5.1a3.1 3.1 0 0 1-5.75 1.6 3.1 3.1 0 0 1-5.5 0A3.1 3.1 0 0 1 3.5 9.1L5.4 4Z" />
      <path d="M10 20v-4.6h4V20" />
    </Glyph>
  );
}

/** Shield with a keyhole — the super admin dashboard. */
function SuperadminIcon() {
  return (
    <Glyph>
      <path d="M12 2.9 5.1 5.6v5.3c0 4.3 2.94 8.3 6.9 9.4 3.96-1.1 6.9-5.1 6.9-9.4V5.6L12 2.9Z" />
      <circle cx="12" cy="10.8" r="1.75" />
      <path d="M12 12.55v2.4" />
    </Glyph>
  );
}

/** Generic document — anything we don't recognise. */
function DocumentIcon() {
  return (
    <Glyph>
      <path d="M13.6 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.4L13.6 3Z" />
      <path d="M13.4 3.2V8.6H18.8" />
      <path d="M8.6 13.2h6.8M8.6 16.6h4.4" />
    </Glyph>
  );
}

export const ROLE_ICONS = {
  driver: DriverIcon,
  supervisor: SupervisorIcon,
  vendor: VendorIcon,
  superadmin: SuperadminIcon,
  default: DocumentIcon
};

export function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <Glyph size={17}>
      <circle cx="10.6" cy="10.6" r="6.4" />
      <path d="m15.4 15.4 4.1 4.1" />
    </Glyph>
  );
}

export function ClearIcon() {
  return (
    <Glyph size={15}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Glyph>
  );
}
