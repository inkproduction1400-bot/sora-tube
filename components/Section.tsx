type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
};

export default function Section({ title, subtitle, children, id }: Props) {
  return (
    <section id={id} className="mb-8">
      <header className="mb-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
