interface JwtConfig {
    secret: string | undefined;
    sign: (payload: {
        [key: string]: any;
    }) => string;
    verify: (token: string) => any;
}
declare const config: JwtConfig;
export default config;
//# sourceMappingURL=auth.d.ts.map