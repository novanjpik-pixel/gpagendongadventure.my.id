export default function PageHero({
  eyebrow,
  title,
  lead,
  image = '/assets/gallery/hutan-berlumut.jpg',
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  image?: string;
}) {
  return (
    <section className="relative bg-forest-dark text-white overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 hero-zoom" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-dark via-forest-dark/60 to-forest-dark/30" />
      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 hero-in">
        <p className="text-lime text-xs font-bold uppercase tracking-[0.3em] mb-4">{eyebrow}</p>
        <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] max-w-4xl">{title}</h1>
        {lead && <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">{lead}</p>}
      </div>
    </section>
  );
}
