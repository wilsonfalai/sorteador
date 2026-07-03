"use client";

import { useEffect, useMemo, useState } from "react";

type Lead = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  createdAt: string;
  wasDrawn: boolean;
};

type LeadsPayload = {
  leads: Lead[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(`${value}Z`));
}

function getPageFromLocation() {
  if (typeof window === "undefined") {
    return 1;
  }

  return Number(new URLSearchParams(window.location.search).get("page") ?? "1");
}

export function LeadsTable() {
  const [payload, setPayload] = useState<LeadsPayload>({
    leads: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      setIsLoading(true);
      const page = getPageFromLocation();
      const response = await fetch(`/api/leads?page=${page}`);

      if (response.ok) {
        setPayload((await response.json()) as LeadsPayload);
      }

      setIsLoading(false);
    }

    void loadLeads();
  }, []);

  const previousPage = Math.max(payload.page - 1, 1);
  const nextPage = Math.min(payload.page + 1, payload.totalPages);
  const pageLabel = useMemo(
    () => `Pagina ${payload.page} de ${payload.totalPages} - ${payload.pageSize} por pagina`,
    [payload.page, payload.pageSize, payload.totalPages],
  );

  return (
    <section className="overflow-hidden border border-black bg-white shadow-[8px_8px_0_#000]">
      <div className="flex flex-col gap-3 border-b border-black p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
          {payload.total} lead{payload.total === 1 ? "" : "s"} cadastrado
          {payload.total === 1 ? "" : "s"}
        </p>
        <p className="text-sm font-semibold text-zinc-600">{pageLabel}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="bg-black text-white">
            <tr>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                #
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Nome
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Email
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                WhatsApp
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Sorteado
              </th>
              <th className="px-4 py-4 text-xs font-black uppercase tracking-[0.18em]">
                Cadastro
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-10 text-center font-semibold text-zinc-500" colSpan={6}>
                  Carregando leads...
                </td>
              </tr>
            ) : payload.leads.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center font-semibold text-zinc-500" colSpan={6}>
                  Nenhum lead cadastrado ainda.
                </td>
              </tr>
            ) : (
              payload.leads.map((lead) => (
                <tr className="border-b border-black last:border-b-0" key={lead.id}>
                  <td className="px-4 py-4 font-black">{lead.id}</td>
                  <td className="px-4 py-4 font-semibold">{lead.name}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-zinc-600">
                    {lead.email}
                  </td>
                  <td className="px-4 py-4 font-semibold">{formatPhone(lead.whatsapp)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
                        lead.wasDrawn
                          ? "border-green-700 bg-green-50 text-green-800"
                          : "border-zinc-500 bg-white text-zinc-600"
                      }`}
                    >
                      {lead.wasDrawn ? "Sim" : "Nao"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold">{formatDate(lead.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-black p-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          className={`border border-black px-4 py-3 text-center text-sm font-black uppercase tracking-[0.16em] ${
            payload.page <= 1 ? "pointer-events-none bg-zinc-100 text-zinc-400" : "bg-white"
          }`}
          href={`/admin/leads?page=${previousPage}`}
          aria-disabled={payload.page <= 1}
        >
          Anterior
        </a>

        <span className="text-center text-sm font-semibold text-zinc-600">
          Mostrando ate 20 leads por pagina
        </span>

        <a
          className={`border border-black px-4 py-3 text-center text-sm font-black uppercase tracking-[0.16em] ${
            payload.page >= payload.totalPages
              ? "pointer-events-none bg-zinc-100 text-zinc-400"
              : "bg-white"
          }`}
          href={`/admin/leads?page=${nextPage}`}
          aria-disabled={payload.page >= payload.totalPages}
        >
          Proxima
        </a>
      </div>
    </section>
  );
}
