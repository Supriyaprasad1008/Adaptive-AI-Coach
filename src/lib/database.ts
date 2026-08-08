import { promises as fs } from 'fs';
import path from 'path';
import { MongoClient, type Collection, type Document, type WithId } from 'mongodb';

export type DatabaseTable = 'interview_sessions' | 'interview_exchanges';

interface QueryOptions {
  practitionerId?: string;
  filters?: Record<string, unknown>;
  orderBy?: { field: string; ascending: boolean };
  limit?: number;
}

type FallbackStore = { sessions: Record<string, unknown>[]; exchanges: Record<string, unknown>[] };

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'adaptive_ai_coach';

let mongoClientPromise: Promise<MongoClient> | null = null;
const fallbackStorePromises: Record<string, Promise<FallbackStore>> = {};

function getPractitionerKey(practitionerId?: string) {
  const normalized = (practitionerId || 'anonymous').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-');
  return normalized || 'anonymous';
}

function getFallbackPath(practitionerId?: string) {
  const key = getPractitionerKey(practitionerId);
  return path.join(process.cwd(), '.data', `${key}.json`);
}

async function ensureFallbackStore(practitionerId?: string) {
  const fallbackPath = getFallbackPath(practitionerId);
  const cacheKey = fallbackPath;
  const cached = fallbackStorePromises[cacheKey];
  if (cached) return cached;

  fallbackStorePromises[cacheKey] = (async () => {
    try {
      await fs.mkdir(path.dirname(fallbackPath), { recursive: true });
      const raw = await fs.readFile(fallbackPath, 'utf8');
      return JSON.parse(raw) as FallbackStore;
    } catch {
      const initial: FallbackStore = { sessions: [], exchanges: [] };
      await fs.writeFile(fallbackPath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
  })();

  return fallbackStorePromises[cacheKey];
}

async function saveFallbackStore(store: FallbackStore, practitionerId?: string) {
  const fallbackPath = getFallbackPath(practitionerId);
  await fs.mkdir(path.dirname(fallbackPath), { recursive: true });
  await fs.writeFile(fallbackPath, JSON.stringify(store, null, 2), 'utf8');
}

async function connectMongo() {
  if (mongoClientPromise) return mongoClientPromise;

  mongoClientPromise = (async () => {
    const client = new MongoClient(uri);
    await client.connect();
    return client;
  })();

  return mongoClientPromise;
}

async function getCollection<T extends Document>(name: DatabaseTable) {
  try {
    const client = await connectMongo();
    const db = client.db(dbName);
    return db.collection<T>(name);
  } catch {
    return null;
  }
}

function toRecord<T extends Record<string, unknown>>(doc: T | WithId<T> | null | undefined) {
  if (!doc) return null;
  const normalized = { ...(doc as Record<string, unknown>) };
  delete normalized._id;
  return normalized as T;
}

function applyFilters<T extends Record<string, unknown>>(items: T[], filters: Record<string, unknown> = {}) {
  return items.filter((item) => Object.entries(filters).every(([key, value]) => (item as Record<string, unknown>)[key] === value));
}

function applySorting<T extends Record<string, unknown>>(items: T[], orderBy?: { field: string; ascending: boolean }) {
  if (!orderBy) return items;
  return [...items].sort((a, b) => {
    const left = (a as Record<string, unknown>)[orderBy.field] as string | number | boolean | null | undefined;
    const right = (b as Record<string, unknown>)[orderBy.field] as string | number | boolean | null | undefined;
    if (left === right) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return orderBy.ascending ? (left > right ? 1 : -1) : (left < right ? 1 : -1);
  });
}

function createSessionId() {
  return `session-${Math.random().toString(36).slice(2, 10)}`;
}

function createExchangeId() {
  return `exchange-${Math.random().toString(36).slice(2, 10)}`;
}

export async function listSessions(options: QueryOptions = {}) {
  const practitionerId = options.practitionerId || 'anonymous';
  const filters = { ...(options.filters ?? {}), practitioner_id: practitionerId };

  const collection = await getCollection('interview_sessions');
  if (collection) {
    const cursor = collection.find(filters);
    const docs = await cursor.toArray();
    let results = docs.map((doc) => toRecord(doc) as Record<string, unknown>);
    results = applyFilters(results, filters);
    results = applySorting(results, options.orderBy);
    if (options.limit) results = results.slice(0, options.limit);
    return results;
  }

  const store = await ensureFallbackStore(practitionerId);
  let results = applyFilters(store.sessions, filters);
  results = applySorting(results, options.orderBy);
  if (options.limit) results = results.slice(0, options.limit);
  return results;
}

export async function getSession(sessionId: string, practitionerId?: string) {
  const resolvedPractitionerId = practitionerId || 'anonymous';
  const collection = await getCollection('interview_sessions');
  if (collection) {
    const doc = await collection.findOne({ id: sessionId, practitioner_id: resolvedPractitionerId });
    return toRecord(doc as Record<string, unknown>);
  }

  const store = await ensureFallbackStore(resolvedPractitionerId);
  return store.sessions.find((session) => session.id === sessionId) ?? null;
}

export async function createSession(values: Record<string, unknown>, practitionerId?: string) {
  const resolvedPractitionerId = practitionerId || (values.practitioner_id as string | undefined) || 'anonymous';
  const document = {
    id: (values.id as string) || createSessionId(),
    ...values,
    practitioner_id: resolvedPractitionerId,
    started_at: (values.started_at as string) || new Date().toISOString(),
    completed_at: (values.completed_at as string | null) ?? null,
    status: (values.status as string) || 'in_progress',
    overall_score: (values.overall_score as number | null) ?? null,
  };

  const collection = await getCollection('interview_sessions');
  if (collection) {
    await collection.insertOne(document);
    return document;
  }

  const store = await ensureFallbackStore(resolvedPractitionerId);
  store.sessions.push(document);
  await saveFallbackStore(store, resolvedPractitionerId);
  return document;
}

export async function updateSession(sessionId: string, values: Record<string, unknown>, practitionerId?: string) {
  const resolvedPractitionerId = practitionerId || 'anonymous';
  const collection = await getCollection('interview_sessions');
  if (collection) {
    const result = await collection.findOneAndUpdate(
      { id: sessionId, practitioner_id: resolvedPractitionerId },
      { $set: { ...values, practitioner_id: resolvedPractitionerId } },
      { returnDocument: 'after' },
    );
    return toRecord(result?.value as Record<string, unknown>);
  }

  const store = await ensureFallbackStore(resolvedPractitionerId);
  const index = store.sessions.findIndex((session) => session.id === sessionId);
  if (index === -1) return null;
  store.sessions[index] = { ...store.sessions[index], ...values, practitioner_id: resolvedPractitionerId };
  await saveFallbackStore(store, resolvedPractitionerId);
  return store.sessions[index];
}

export async function listExchanges(options: QueryOptions = {}) {
  const practitionerId = options.practitionerId || 'anonymous';
  const filters = { ...(options.filters ?? {}), practitioner_id: practitionerId };

  const collection = await getCollection('interview_exchanges');
  if (collection) {
    const docs = await collection.find(filters).toArray();
    let results = docs.map((doc) => toRecord(doc) as Record<string, unknown>);
    results = applyFilters(results, filters);
    results = applySorting(results, options.orderBy);
    if (options.limit) results = results.slice(0, options.limit);
    return results;
  }

  const store = await ensureFallbackStore(practitionerId);
  let results = applyFilters(store.exchanges, filters);
  results = applySorting(results, options.orderBy);
  if (options.limit) results = results.slice(0, options.limit);
  return results;
}

export async function createExchange(values: Record<string, unknown>, practitionerId?: string) {
  const resolvedPractitionerId = practitionerId || (values.practitioner_id as string | undefined) || 'anonymous';
  const document = {
    id: (values.id as string) || createExchangeId(),
    ...values,
    practitioner_id: resolvedPractitionerId,
    created_at: (values.created_at as string) || new Date().toISOString(),
  };

  const collection = await getCollection('interview_exchanges');
  if (collection) {
    await collection.insertOne(document);
    return document;
  }

  const store = await ensureFallbackStore(resolvedPractitionerId);
  store.exchanges.push(document);
  await saveFallbackStore(store, resolvedPractitionerId);
  return document;
}

export async function updateExchange(exchangeId: string, values: Record<string, unknown>, practitionerId?: string) {
  const resolvedPractitionerId = practitionerId || 'anonymous';
  const collection = await getCollection('interview_exchanges');
  if (collection) {
    const result = await collection.findOneAndUpdate(
      { id: exchangeId, practitioner_id: resolvedPractitionerId },
      { $set: { ...values, practitioner_id: resolvedPractitionerId } },
      { returnDocument: 'after' },
    );
    return toRecord(result?.value as Record<string, unknown>);
  }

  const store = await ensureFallbackStore(resolvedPractitionerId);
  const index = store.exchanges.findIndex((exchange) => exchange.id === exchangeId);
  if (index === -1) return null;
  store.exchanges[index] = { ...store.exchanges[index], ...values, practitioner_id: resolvedPractitionerId };
  await saveFallbackStore(store, resolvedPractitionerId);
  return store.exchanges[index];
}
