"use client";

import { useEffect, useMemo, useState } from "react";

type DrawPayload =
  | {
      ok: true;
      winner: {
        name: string;
        email: string;
        whatsapp: string;
      };
      eligibleCount: number;
    }
  | {
      ok: false;
      message: string;
      eligibleCount: number;
    };

type DrawPanelProps = {
  initialParticipants: number;
  initialWinners: number;
  initialEligible: number;
};

const suspenseLabels = [
  "Misturando cupons",
  "Conferindo participantes",
  "Girando o sorteador",
  "Quase la",
];

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function DrawPanel({
  initialParticipants,
  initialWinners,
  initialEligible,
}: DrawPanelProps) {
  const [includePreviousWinners, setIncludePreviousWinners] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [result, setResult] = useState<DrawPayload | null>(null);
  const [participants, setParticipants] = useState(initialParticipants);
  const [winners, setWinners] = useState(initialWinners);
  const [eligible, setEligible] = useState(initialEligible);

  useEffect(() => {
    async function loadStats() {
      const response = await fetch("/api/stats");

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        stats: { participants: number; winners: number; eligible: number };
      };

      setParticipants(payload.stats.participants);
      setWinners(payload.stats.winners);
      setEligible(payload.stats.eligible);
    }

    void loadStats();
  }, []);

  useEffect(() => {
    if (!isDrawing) {
      return;
    }

    const timer = window.setInterval(() => {
      setStatusIndex((current) => (current + 1) % suspenseLabels.length);
    }, 450);

    return () => window.clearInterval(timer);
  }, [isDrawing]);

  const buttonLabel = useMemo(() => {
    if (isDrawing) {
      return "Sorteando...";
    }

    return result?.ok ? "Gerar novo sorteio" : "Sortear";
  }, [isDrawing, result]);

  async function handleDraw() {
    setIsDrawing(true);
    setResult(null);
    setStatusIndex(0);

    const responsePromise = fetch("/api/draws", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includePreviousWinners }),
    });
    const delayPromise = new Promise((resolve) => window.setTimeout(resolve, 2200));
    const [response] = await Promise.all([responsePromise, delayPromise]);
    const payload = (await response.json()) as DrawPayload & {
      stats?: { participants: number; winners: number; eligible: number };
    };

    if (payload.stats) {
      setParticipants(payload.stats.participants);
      setWinners(payload.stats.winners);
      setEligible(payload.stats.eligible);
    }

    setResult(payload);
    setIsDrawing(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="border border-black bg-white p-6 shadow-[8px_8px_0_#000] sm:p-8">
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-8 text-center">
          <div className={`draw-orbit ${isDrawing ? "is-spinning" : ""}`}>
            <div className="draw-ball">{isDrawing ? "?" : result?.ok ? "1" : "S"}</div>
          </div>

          <div className="min-h-32 w-full max-w-xl">
            {isDrawing ? (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-zinc-500">
                  {suspenseLabels[statusIndex]}
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                  Sorteando
                </h1>
              </div>
            ) : result?.ok ? (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-zinc-500">
                  Ganhador
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                  {result.winner.name}
                </h1>
                <p className="mt-4 text-sm font-semibold text-zinc-600">
                  {result.winner.email} - {formatWhatsapp(result.winner.whatsapp)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-zinc-500">
                  Pronto para sortear
                </p>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                  Sorteador
                </h1>
                <p className="mt-4 text-sm font-semibold text-zinc-600">
                  Clique no botao para revelar um participante da base.
                </p>
              </div>
            )}

            {result && !result.ok ? (
              <p className="mx-auto mt-5 max-w-md border border-black bg-zinc-100 px-4 py-3 text-sm font-semibold">
                {result.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-black pt-6 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm font-bold">
            <input
              type="checkbox"
              checked={includePreviousWinners}
              onChange={(event) => setIncludePreviousWinners(event.target.checked)}
              className="size-5 accent-black"
            />
            Incluir quem ja foi sorteado
          </label>

          <button
            type="button"
            onClick={handleDraw}
            disabled={isDrawing}
            className="h-12 border border-black bg-black px-6 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      <aside className="grid gap-4">
        <div className="border border-black bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Participantes
          </p>
          <strong className="mt-3 block text-5xl font-black">{participants}</strong>
        </div>
        <div className="border border-black bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Ja sorteados
          </p>
          <strong className="mt-3 block text-5xl font-black">{winners}</strong>
        </div>
        <div className="border border-black bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
            Elegiveis agora
          </p>
          <strong className="mt-3 block text-5xl font-black">
            {includePreviousWinners ? participants : eligible}
          </strong>
        </div>
      </aside>
    </section>
  );
}
