/**
 * Environment variable validation
 * Ensures all required environment variables are set at startup
 */

interface EnvConfig {
  databaseUrl: string;
  ghostfetchUrl: string;
  nodeEnv: string;
}

const getEnv = (): EnvConfig => {
  const databaseUrl = process.env.DATABASE_URL;
  const ghostfetchUrl = process.env.GHOSTFETCH_URL || 'http://localhost:8000';
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Please set it in your .env file or environment variables.'
    );
  }

  // Validate DATABASE_URL format based on provider
  if (databaseUrl.startsWith('file://') || databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
    // Valid format
  } else {
    throw new Error(
      `Invalid DATABASE_URL format. Expected "file://" or "postgres://" protocol, got: ${databaseUrl.split(':')[0]}://`
    );
  }

  return {
    databaseUrl,
    ghostfetchUrl,
    nodeEnv,
  };
};

export const env = getEnv();

// Freeze to prevent runtime modifications
Object.freeze(env);
