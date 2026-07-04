import "server-only";

import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";

type ParticipantRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  created_at: Date | string;
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

type DrawRow = RowDataPacket & {
  id: number;
  participant_id: number;
  winner_name: string;
  winner_email: string;
  winner_whatsapp: string;
  included_previous_winners: number;
  created_at: Date | string;
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

declare global {
  var raffleMysqlPool: mysql.Pool | undefined;
  var raffleMysqlReady: Promise<void> | undefined;
}

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }

  return value;
}

function getPool() {
  if (!globalThis.raffleMysqlPool) {
    globalThis.raffleMysqlPool = mysql.createPool({
      host: requiredEnv("MYSQL_HOST"),
      port: Number(process.env.MYSQL_PORT ?? "3306"),
      user: requiredEnv("MYSQL_USER"),
      password: process.env.MYSQL_PASSWORD ?? "",
      database: requiredEnv("MYSQL_DATABASE"),
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT ?? "10"),
      ssl:
        process.env.MYSQL_SSL === "true"
          ? { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== "false" }
          : undefined,
    });
  }

  return globalThis.raffleMysqlPool;
}

async function ensureDatabase() {
  if (!globalThis.raffleMysqlReady) {
    const database = getPool();

    globalThis.raffleMysqlReady = database.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        whatsapp VARCHAR(32) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY participants_email_unique (email),
        UNIQUE KEY participants_whatsapp_unique (whatsapp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)
      .then(() =>
        database.query(`
          CREATE TABLE IF NOT EXISTS draws (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            participant_id INT UNSIGNED NOT NULL,
            winner_name VARCHAR(255) NOT NULL,
            winner_email VARCHAR(255) NOT NULL,
            winner_whatsapp VARCHAR(32) NOT NULL,
            included_previous_winners TINYINT(1) NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY draws_participant_id_index (participant_id),
            CONSTRAINT draws_participant_id_foreign
              FOREIGN KEY (participant_id) REFERENCES participants(id)
              ON DELETE RESTRICT
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `),
      )
      .then(() => undefined);
  }

  await globalThis.raffleMysqlReady;
}

function serializeDate(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function participantFromRow(row: ParticipantRow): Participant {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp,
    createdAt: serializeDate(row.created_at),
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
    createdAt: serializeDate(row.created_at),
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

export async function registerParticipant(input: {
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

  await ensureDatabase();

  try {
    await getPool().execute(
      "INSERT INTO participants (name, email, whatsapp) VALUES (?, ?, ?)",
      [name, email, whatsapp],
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return {
        ok: false as const,
        message: "Este email ou WhatsApp ja esta cadastrado.",
      };
    }

    throw error;
  }

  return { ok: true as const, message: "Cadastro realizado com sucesso." };
}

export async function getParticipantsCount() {
  await ensureDatabase();

  const [rows] = await getPool().query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM participants",
  );

  return rows[0]?.count ?? 0;
}

export async function getWinnersCount() {
  await ensureDatabase();

  const [rows] = await getPool().query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(DISTINCT participant_id) AS count FROM draws",
  );

  return rows[0]?.count ?? 0;
}

export async function getEligibleParticipants(includePreviousWinners: boolean) {
  await ensureDatabase();

  const [rows] = await getPool().query<ParticipantRow[]>(
    includePreviousWinners
      ? "SELECT * FROM participants ORDER BY id ASC"
      : `SELECT * FROM participants
         WHERE id NOT IN (SELECT DISTINCT participant_id FROM draws)
         ORDER BY id ASC`,
  );

  return rows.map(participantFromRow);
}

export async function drawParticipant(
  includePreviousWinners: boolean,
): Promise<DrawResult> {
  const totalParticipants = await getParticipantsCount();

  if (totalParticipants === 0) {
    return {
      ok: false,
      reason: "empty",
      message: "Ainda nao ha participantes cadastrados.",
      eligibleCount: 0,
    };
  }

  const eligibleParticipants = await getEligibleParticipants(includePreviousWinners);

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
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO draws (
      participant_id,
      winner_name,
      winner_email,
      winner_whatsapp,
      included_previous_winners
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      winner.id,
      winner.name,
      winner.email,
      winner.whatsapp,
      includePreviousWinners ? 1 : 0,
    ],
  );
  const [rows] = await getPool().query<DrawRow[]>(
    "SELECT * FROM draws WHERE id = ?",
    [result.insertId],
  );

  return {
    ok: true,
    winner,
    draw: drawFromRow(rows[0]),
    eligibleCount: eligibleParticipants.length,
  };
}

export async function getDrawHistory() {
  await ensureDatabase();

  const [rows] = await getPool().query<DrawRow[]>(
    "SELECT * FROM draws ORDER BY created_at DESC, id DESC",
  );

  return rows.map(drawFromRow);
}

export async function getLeadsPage(page: number, pageSize = 20) {
  await ensureDatabase();

  const safePage = Math.max(1, Math.floor(page));
  const [totalRows] = await getPool().query<(RowDataPacket & { count: number })[]>(
    "SELECT COUNT(*) AS count FROM participants",
  );
  const total = totalRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * pageSize;
  const [rows] = await getPool().query<LeadRow[]>(
    `SELECT
      participants.*,
      CASE WHEN draws.participant_id IS NULL THEN 0 ELSE 1 END AS was_drawn
    FROM participants
    LEFT JOIN (
      SELECT DISTINCT participant_id
      FROM draws
    ) draws ON draws.participant_id = participants.id
    ORDER BY participants.created_at DESC, participants.id DESC
    LIMIT ? OFFSET ?`,
    [pageSize, offset],
  );

  return {
    leads: rows.map(leadFromRow),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  };
}

export async function getDashboardStats() {
  const participants = await getParticipantsCount();
  const winners = await getWinnersCount();

  return {
    participants,
    winners,
    eligible: Math.max(participants - winners, 0),
  };
}
