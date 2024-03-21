import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  NEO4J_DB_USERNAME: string;

  @IsString()
  NEO4J_DB_PASSWORD: string;

  @IsNumber()
  NEO4J_DB_PORT: number;

  @IsString()
  NEO4J_DB_HOST: string;

  @IsString()
  NEO4J_DB_SCHEME: string;

  // @IsString()
  // PSQL_DB_USERNAME: string;

  // @IsString()
  // PSQL_DB_PASSWORD: string;

  // @IsNumber()
  // PSQL_DB_PORT: number;

  // @IsString()
  // PSQL_DB_HOST: string;

  // @IsString()
  // PSQL_DB_SCHEME: string;

  @IsString()
  PSQL_DB_URL: string;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  // @IsString()
  // JWT_REFRESH_TOKEN_SECRET: string;

  // @IsString()
  // JWT_REFRESH_TOKEN_EXPIRY: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRY: string;

  @IsString()
  GOOGLE_AUTH_CLIENT_ID: string;

  @IsString()
  GOOGLE_AUTH_CLIENT_SECRET: string;

  @IsNumber()
  FILE_UPLOAD_RATE_TTL: number;

  @IsNumber()
  FILE_UPLOAD_RATE_LIMIT: number;

  @IsString()
  AWS_S3_SECRET_ACCESS_KEY: string;

  @IsString()
  AWS_S3_ACCESS_KEY_ID: string;

  @IsString()
  AWS_S3_REGION: string;

  @IsString()
  AWS_SES_SECRET_KEY: string;

  @IsString()
  AWS_SES_ACCESS_KEY: string;

  @IsString()
  JWT_SSO_VERIFICATION_TOKEN_SECRET: string;

  @IsString()
  JWT_SSO_VERIFICATION_TOKEN_EXPIRY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
