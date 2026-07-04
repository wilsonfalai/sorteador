"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";

type Draw = {
  id: number;
  winnerName: string;
  winnerEmail: string;
  winnerWhatsapp: string;
  includedPreviousWinners: boolean;
  createdAt: string;
};

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function HistoryTable() {
  const [history, setHistory] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const response = await fetch("/api/draws");

      if (response.ok) {
        const payload = (await response.json()) as { draws: Draw[] };
        setHistory(payload.draws);
      }

      setIsLoading(false);
    }

    void loadHistory();
  }, []);

  return (
    <section className="overflow-hidden border border-black bg-white shadow-[8px_8px_0_#000]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                #
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Ganhador
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Contato
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Regra
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Data
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-10 text-center font-semibold text-zinc-500" colSpan={5}>
                  Carregando historico...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center font-semibold text-zinc-500" colSpan={5}>
                  Nenhum sorteio registrado ainda.
                </td>
              </tr>
            ) : (
              history.map((draw) => (
                <tr className="border-b border-black last:border-b-0" key={draw.id}>
                  <td className="px-4 py-4 font-black">{draw.id}</td>
                  <td className="px-4 py-4">
                    <strong className="block">{draw.winnerName}</strong>
                    <span className="text-sm text-zinc-500">{draw.winnerEmail}</span>
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {formatPhone(draw.winnerWhatsapp)}
                  </td>
                  <td className="px-4 py-4">
                    {draw.includedPreviousWinners
                      ? "Incluiu ganhadores anteriores"
                      : "Excluiu ganhadores anteriores"}
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {formatDateTime(draw.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
