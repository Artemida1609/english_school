export const HeroSection = () => {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center bg-[var(--color-light-green)]">
      <div className="flex flex-row">
        <h1 className="text-5xl font-bold text-black">
          Welcome to the English School App
        </h1>
        <img
          src="/images/hero-dashboard.jpg"
          alt="Hero Dashboard"
          className="w-1/2 h-full object-cover"
        />
      </div>
    </section>
  );
};
