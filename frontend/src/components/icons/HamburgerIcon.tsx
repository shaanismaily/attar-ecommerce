type IconProps = React.SVGProps<SVGSVGElement> & {
  menuOpen: boolean;
};

export function HamburgerIcon({ menuOpen, ...props }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      {menuOpen ? (
        <path d="M18 6 6 18M6 6l12 12" />
      ) : (
        <>
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  );
}