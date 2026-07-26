import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  accessTokenTtlSeconds: process.env.ACCESS_TOKEN_TTL_SECONDS
    ? Number(process.env.ACCESS_TOKEN_TTL_SECONDS)
    : 900,
  refreshTokenSecret: required("REFRESH_TOKEN_SECRET"),
  refreshTokenTtlDays: process.env.REFRESH_TOKEN_TTL_DAYS
    ? Number(process.env.REFRESH_TOKEN_TTL_DAYS)
    : 30,

  otpStaticCode: process.env.OTP_STATIC_CODE ?? "000000",
  otpTtlMinutes: process.env.OTP_TTL_MINUTES ? Number(process.env.OTP_TTL_MINUTES) : 10,
};
