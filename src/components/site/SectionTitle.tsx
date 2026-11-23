import Reveal from './Reveal';

export default function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <Reveal className="mb-10">
      <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-3 ${light ? 'text-lime' : 'text-forest'}`}>{eyebrow}</p>
      <h2 className={`text-3xl md:text-4xl font-bold leading-tight ${light ? 'text-white' : 'text-forest-dark'}`}>{title}</h2>
      <Reveal from="line" delay={200}><div className={`mt-5 h-1.5 w-20 ${light ? 'bg-lime' : 'bg-forest'}`} /></Reveal>
    </Reveal>
  );
}
