const icons = {
  coffee: (
    <>
      <path d="M18 30h48v20c0 15-10 26-24 26s-24-11-24-26V30z" />
      <path d="M66 36h6a10 10 0 010 20h-6" />
      <path d="M28 20c0-4 4-4 4-8" />
      <path d="M40 20c0-4 4-4 4-8" />
      <path d="M52 20c0-4 4-4 4-8" />
    </>
  ),
  juice: (
    <>
      <path d="M32 18h32l-4 60a6 6 0 01-6 6H42a6 6 0 01-6-6l-4-60z" />
      <path d="M32 18l6 12h20l6-12" />
      <path d="M48 40v30" />
    </>
  ),
  pastry: (
    <>
      <path d="M14 54c0-16 15-30 34-30s34 14 34 30" />
      <path d="M14 54h68" />
      <path d="M22 54c2 10 6 18 10 18M74 54c-2 10-6 18-10 18" />
    </>
  ),
  sandwich: (
    <>
      <path d="M14 44l34-22 34 22" />
      <path d="M18 44h60v8a10 10 0 01-10 10H28a10 10 0 01-10-10v-8z" />
      <path d="M24 62l6 12M72 62l-6 12" />
    </>
  ),
  sparkle: (
    <>
      <path d="M48 14l6 20 20 6-20 6-6 20-6-20-20-6 20-6z" />
    </>
  ),
  plate: (
    <>
      <circle cx="48" cy="48" r="32" />
      <circle cx="48" cy="48" r="20" />
    </>
  ),
};

export default function ProductIcon({ icon = 'plate', size = 96 }) {
  const path = icons[icon] || icons.plate;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {path}
    </svg>
  );
}
