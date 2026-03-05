export const ProfileIcon = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="url(#bgGradient)" />

      <circle cx="24" cy="19" r="8" fill="white" fillOpacity="0.95" />

      <path
        d="M8 42 C8 32 14 28 24 28 C34 28 40 32 40 42"
        fill="white"
        fillOpacity="0.95"
      />

      <defs>
        <linearGradient
          id="bgGradient"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
  );
};
