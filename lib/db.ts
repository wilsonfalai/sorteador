import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

type ParticipantRow = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  created_at: string;
};

export type Participant = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  createdAt: string;
};

type LeadRow = ParticipantRow & {
  was_drawn: number;
};

export type Lead = Participant & {
  wasDrawn: boolean;
};

type DrawRow = {
  id: number;
  participant_id: number;
  winner_name: string;
  winner_email: string;
  winner_whatsapp: string;
  included_previous_winners: number;
  created_at: string;
};

export type Draw = {
  id: number;
  participantId: number;
  winnerName: string;
  winnerEmail: string;
  winnerWhatsapp: string;
  includedPreviousWinners: boolean;
  createdAt: string;
};

export type DrawResult =
  | {
      ok: true;
      winner: Participant;
      draw: Draw;
      eligibleCount: number;
    }
  | {
      ok: false;
      reason: "empty" | "exhausted";
      message: string;
      eligibleCount: number;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dbPath = path.join(process.cwd(), "data", "sorteador.sqlite");

declare global {
  var raffleDatabase: DatabaseSync | undefined;
}

function getDatabase() {
  if (!globalThis.raffleDatabase) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    const database = new DatabaseSync(dbPath);

    database.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        whatsapp TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS draws (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id INTEGER NOT NULL,
        winner_name TEXT NOT NULL,
        winner_email TEXT NOT NULL,
        winner_whatsapp TEXT NOT NULL,
        included_previous_winners INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (participant_id) REFERENCES participants(id)
      );
    `);

    globalThis.raffleDatabase = database;
  }

  return globalThis.raffleDatabase;
}

function participantFromRow(row: ParticipantRow): Participant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    createdAt: row.created_at,
  };
}

function leadFromRow(row: LeadRow): Lead {
  return {
    ...participantFromRow(row),
    wasDrawn: row.was_drawn === 1,
  };
}

function drawFromRow(row: DrawRow): Draw {
  return {
    id: row.id,
    participantId: row.participant_id,
    winnerName: row.winner_name,
    winnerEmail: row.winner_email,
    winnerWhatsapp: row.winner_whatsapp,
    includedPreviousWinners: row.included_previous_winners === 1,
    createdAt: row.created_at,
  };
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string) {
  const digits = normalizePhone(value);

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return value;
}

export function registerParticipant(input: {
  name: string;
  email: string;
  whatsapp: string;
}) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = input.email.trim().toLowerCase();
  const whatsapp = normalizePhone(input.whatsapp);

  if (!name) {
    return { ok: false as const, message: "Informe seu nome." };
  }

  if (!emailPattern.test(email)) {
    return { ok: false as const, message: "Informe um email valido." };
  }

  if (![10, 11].includes(whatsapp.length)) {
    return { ok: false as const, message: "Informe um WhatsApp com DDD." };
  }

  const database = getDatabase();
  const existing = database
    .prepare("SELECT id FROM participants WHERE email = ? OR whatsapp = ? LIMIT 1")
    .get(email, whatsapp);

  if (existing) {
    return {
      ok: false as const,
      message: "Este email ou WhatsApp ja esta cadastrado.",
    };
  }

  database
    .prepare("INSERT INTO participants (name, email, whatsapp) VALUES (?, ?, ?)")
    .run(name, email, whatsapp);

  return { ok: true as const, message: "Cadastro realizado com sucesso." };
}

export function getParticipantsCount() {
  const row = getDatabase()
    .prepare("SELECT COUNT(*) AS count FROM participants")
    .get() as { count: number };

  return row.count;
}

export function getWinnersCount() {
  const row = getDatabase()
    .prepare("SELECT COUNT(DISTINCT participant_id) AS count FROM draws")
    .get() as { count: number };

  return row.count;
}

export function getEligibleParticipants(includePreviousWinners: boolean) {
  const database = getDatabase();
  const rows = database
    .prepare(
      includePreviousWinners
        ? "SELECT * FROM participants ORDER BY id ASC"
        : `SELECT * FROM participants
           WHERE id NOT IN (SELECT DISTINCT participant_id FROM draws)
           ORDER BY id ASC`,
    )
    .all() as ParticipantRow[];

  return rows.map(participantFromRow);
}

export function drawParticipant(includePreviousWinners: boolean): DrawResult {
  const totalParticipants = getParticipantsCount();

  if (totalParticipants === 0) {
    return {
      ok: false,
      reason: "empty",
      message: "Ainda nao ha participantes cadastrados.",
      eligibleCount: 0,
    };
  }

  const eligibleParticipants = getEligibleParticipants(includePreviousWinners);

  if (eligibleParticipants.length === 0) {
    return {
      ok: false,
      reason: "exhausted",
      message:
        "Todos os participantes ja foram sorteados. Marque a opcao para incluir ganhadores anteriores.",
      eligibleCount: 0,
    };
  }

  const winner =
    eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
  const result = getDatabase()
    .prepare(
      `INSERT INTO draws (
        participant_id,
        winner_name,
        winner_email,
        winner_whatsapp,
        included_previous_winners
      ) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      winner.id,
      winner.name,
      winner.email,
      winner.whatsapp,
      includePreviousWinners ? 1 : 0,
    );

  const drawRow = getDatabase()
    .prepare("SELECT * FROM draws WHERE id = ?")
    .get(Number(result.lastInsertRowid)) as DrawRow;

  return {
    ok: true,
    winner,
    draw: drawFromRow(drawRow),
    eligibleCount: eligibleParticipants.length,
  };
}

export function getDrawHistory() {
  const rows = getDatabase()
    .prepare("SELECT * FROM draws ORDER BY datetime(created_at) DESC, id DESC")
    .all() as DrawRow[];

  return rows.map(drawFromRow);
}

export function getLeadsPage(page: number, pageSize = 20) {
  const safePage = Math.max(1, Math.floor(page));
  const database = getDatabase();
  const totalRow = database
    .prepare("SELECT COUNT(*) AS count FROM participants")
    .get() as { count: number };
  const totalPages = Math.max(1, Math.ceil(totalRow.count / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const rows = database
    .prepare(
      `SELECT
        participants.*,
        CASE WHEN draws.participant_id IS NULL THEN 0 ELSE 1 END AS was_drawn
      FROM participants
      LEFT JOIN (
        SELECT DISTINCT participant_id
        FROM draws
      ) draws ON draws.participant_id = participants.id
      ORDER BY datetime(participants.created_at) DESC, participants.id DESC
      LIMIT ? OFFSET ?`,
    )
    .all(pageSize, offset) as LeadRow[];

  return {
    leads: rows.map(leadFromRow),
    page: currentPage,
    pageSize,
    total: totalRow.count,
    totalPages,
  };
}

export function getDashboardStats() {
  const participants = getParticipantsCount();
  const winners = getWinnersCount();

  return {
    participants,
    winners,
    eligible: Math.max(participants - winners, 0),
  };
}
