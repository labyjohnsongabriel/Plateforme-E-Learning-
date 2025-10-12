interface AppConfig {
  isProduction: boolean;
  port: number | string;
}

const config: AppConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  port: process.env.PORT || 3001,
};

export default config;