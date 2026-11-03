import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="inline-flex shrink-0 items-center gap-3 hover:text-navy" aria-label="Bina Adult Care — home">
      <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-brand-50">
        <img src="/logo.webp" alt="" width={34} height={35} className="h-[34px] w-[34px] object-contain" />
      </span>
      <span className="flex flex-col leading-[1.15]">
        <strong className="whitespace-nowrap text-[1.0625rem] font-semibold text-navy">Bina Adult Care</strong>
        <span className="font-script text-[0.9375rem] text-brand-600">Compassionate Senior Care</span>
      </span>
    </Link>
  );
}
