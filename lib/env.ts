import { z } from "zod";

const envSchema = z.object({
  // Server-side variables — marked optional here so client-side code
  // (where process.env doesn't expose non-NEXT_PUBLIC_ vars) still parses
  // successfully and can access NEXT_PUBLIC_ values. Enforced at point of use.
  JWT_SECRET: z.string().optional().or(z.literal("")),
  ADMIN_USERNAME: z.string().optional().or(z.literal("")),
  ADMIN_PASSWORD: z.string().optional().or(z.literal("")),
  POSTEX_API_TOKEN: z.string().optional(),
  POSTEX_WEBHOOK_SECRET: z.string().optional(),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  TIKTOK_PIXEL_ID: z.string().optional(),

  // Database Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),

  // Node Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Since Next.js doesn't expose all process.env to the client natively without NEXT_PUBLIC_,
// we safely parse what we have. In a pure Server Component/Route, process.env has everything.
const parsedEnv = envSchema.safeParse({
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  POSTEX_API_TOKEN: process.env.POSTEX_API_TOKEN,
  POSTEX_WEBHOOK_SECRET: process.env.POSTEX_WEBHOOK_SECRET,
  TIKTOK_ACCESS_TOKEN: process.env.TIKTOK_ACCESS_TOKEN,
  TIKTOK_PIXEL_ID: process.env.TIKTOK_PIXEL_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  // Only throw in server environments to prevent build crashes in weird setups if not careful,
  // but for a robust app, we want it to throw.
  if (typeof window === "undefined") {
    throw new Error("Invalid environment variables");
  }
}

const env = parsedEnv.success ? parsedEnv.data : ({} as any);

if (env.NODE_ENV === 'production') {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ Missing Supabase Configuration. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required in production.");
    if (typeof window === "undefined") {
      throw new Error("Missing Supabase configuration in production");
    }
  }
}

export { env };
