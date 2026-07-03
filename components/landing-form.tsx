"use client";

import { FormEvent, useState } from "react";

type Feedback = {
  type: "success" | "error";
  message: string;
};

function maskWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function LandingForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function resetForm() {
    setName("");
    setEmail("");
    setWhatsapp("");
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, whatsapp }),
      });
      const payload = (await response.json()) as { message: string };

      if (response.ok) {
        setFeedback({ type: "success", message: payload.message });
        setName("");
        setEmail("");
        setWhatsapp("");
      } else {
        setFeedback({ type: "error", message: payload.message });
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Nao foi possivel realizar o cadastro. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (feedback?.type === "success") {
    return (
      <div className="grid min-h-[342px] content-center gap-5 border border-green-700 bg-green-50 p-6 text-green-950">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-green-700">
            Cadastro confirmado
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">
            Cadastro realizado com sucesso.
          </h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-green-800">
            Seus dados foram recebidos e voce ja esta participando do sorteio.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="h-12 border border-green-900 bg-green-700 px-5 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-green-800"
        >
          Criar novo cadastro
        </button>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em]">
        Nome
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-12 border border-black bg-white px-4 text-base font-medium normal-case tracking-normal outline-none transition focus:shadow-[4px_4px_0_#000]"
          placeholder="Seu nome completo"
          autoComplete="name"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em]">
        Email
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 border border-black bg-white px-4 text-base font-medium normal-case tracking-normal outline-none transition focus:shadow-[4px_4px_0_#000]"
          placeholder="voce@email.com"
          type="email"
          autoComplete="email"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.16em]">
        WhatsApp
        <input
          value={whatsapp}
          onChange={(event) => setWhatsapp(maskWhatsapp(event.target.value))}
          className="h-12 border border-black bg-white px-4 text-base font-medium normal-case tracking-normal outline-none transition focus:shadow-[4px_4px_0_#000]"
          placeholder="(11) 99999-9999"
          inputMode="tel"
          autoComplete="tel"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 border border-black bg-black px-5 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
      >
        {isSubmitting ? "Enviando..." : "Cadastrar"}
      </button>

      {feedback ? (
        <p
          className="border border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900"
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}
    </form>
  );
}
