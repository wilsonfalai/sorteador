import Image from "next/image";
import { LandingForm } from "@/components/landing-form";

export default function Home() {
  return (
    <main className="landing-pattern flex h-dvh overflow-hidden bg-white p-4 text-black sm:p-6 lg:p-8">
      <section className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 overflow-hidden border border-black bg-white shadow-[12px_12px_0_#000] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-0 border-r border-black bg-zinc-100 md:block">
          <Image
            src="/raffle-visual.png"
            alt="Ilustracao monocromatica de sorteio"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-x-0 bottom-0 border-t border-black bg-white/90 p-5 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-zinc-500">
              Sorteio oficial
            </p>
            <h1 className="mt-2 max-w-sm text-4xl font-black leading-none tracking-tight">
              Cadastre-se para participar.
            </h1>
          </div>
        </div>

        <div className="flex min-h-0 flex-col p-5 sm:p-8 lg:p-12">
          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <div className="mb-5 md:hidden">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-zinc-500">
                Sorteio oficial
              </p>
              <h1 className="mt-2 text-3xl font-black leading-none tracking-tight">
                Cadastre-se para participar.
              </h1>
            </div>

            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Inscricao gratuita
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Preencha seus dados
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
                Informe nome, email e WhatsApp para entrar na base do sorteio.
              </p>
            </div>

            <LandingForm />
          </div>

          <footer className="mt-5 border-t border-black pt-4 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 sm:text-left">
            Sistema desenvolvido pela{" "}
            <a
              href="https://mosaicdigital.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-black text-black underline underline-offset-4 transition hover:text-zinc-600 sm:mt-0 sm:inline"
            >
              Mosaic Digital
            </a>
          </footer>
        </div>
      </section>
    </main>
  );
}
