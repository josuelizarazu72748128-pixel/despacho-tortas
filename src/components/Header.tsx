import Image from "next/image";

export default function Header() {
  return (
    <header className="gradient-header px-4 py-3.5 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center gap-3.5">
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-white shadow-card">
          <Image
            src="/logo.png"
            alt="Logo Gema Pastelería"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-heading text-[1.15rem] font-bold leading-tight text-brown-strong sm:text-[1.3rem]">
            Gema Pastelería · Despacho
          </h1>
          <p className="truncate text-[0.8rem] font-bold text-brown-strong/75 sm:text-[0.85rem]">
            Control de envíos a sucursales
          </p>
        </div>
      </div>
    </header>
  );
}
