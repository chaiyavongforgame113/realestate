import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Storage operations.
 * Uses the service role key — bypasses RLS, must NEVER be exposed to clients.
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Buckets (created out-of-band in dashboard or via SQL):
 *   avatars     — public, 2MB, image/*
 *   listings    — public, 10MB, image/*
 *   agent-docs  — private, 5MB, image/* + application/pdf
 */
export type StorageBucket = "avatars" | "listings" | "agent-docs";

let cached: ReturnType<typeof createClient> | null = null;

export function isStorageConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  if (!isStorageConfigured()) {
    throw new Error("Supabase storage not configured");
  }
  if (!cached) {
    cached = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );
  }
  return cached;
}

export interface UploadInput {
  bucket: StorageBucket;
  path: string;
  file: File;
  upsert?: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Upload a file to a Supabase storage bucket.
 *
 * - Public buckets (avatars, listings) → returns the public CDN URL.
 * - Private bucket (agent-docs) → returns a signed URL valid for 1 hour
 *   (use signUrl() afterwards for fresh URLs when reading).
 */
export async function uploadFile({ bucket, path, file, upsert = false }: UploadInput): Promise<UploadResult> {
  const client = getClient();
  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert,
  });
  if (error) throw new Error(error.message);

  let url: string;
  if (bucket === "agent-docs") {
    const signed = await client.storage.from(bucket).createSignedUrl(path, 60 * 60);
    if (signed.error) throw new Error(signed.error.message);
    url = signed.data.signedUrl;
  } else {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    url = data.publicUrl;
  }

  return { url, path, size: file.size };
}

/** Generate a fresh signed URL (default 1 hour) for a private-bucket file. */
export async function signUrl(bucket: StorageBucket, path: string, expiresIn = 60 * 60): Promise<string> {
  const client = getClient();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

/** Remove a file. */
export async function removeFile(bucket: StorageBucket, path: string): Promise<void> {
  const client = getClient();
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}
