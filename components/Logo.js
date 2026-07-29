export default function Logo({ letter = 'C', image = null, size = 96 }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt="Logo"
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: '28%' }}
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M48 6C68 6 84 13 88 30C91 42 88 58 78 70C68 82 54 90 38 88C22 86 8 74 6 56C4 40 10 22 26 12C33 8 41 6 48 6Z"
        stroke="currentColor"
        strokeWidth="6"
      />
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        fontFamily="var(--font-heading, sans-serif)"
        fontWeight="700"
        fontSize="34"
        fill="currentColor"
      >
        {letter}
      </text>
    </svg>
  );
}
