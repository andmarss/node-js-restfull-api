/**
 * Создаем конфигурационные переменные
 * для команды NODE_ENV=staging|production
 * @type {{production: {checks: number, port: number, envName: string, https: number, twilio: {from: string, accountSid: string, token: string}, hash: string}, staging: {checks: number, port: number, envName: string, https: number, twilio: {from: string, accountSid: string, token: string}, hash: string}}}
 */
const env = {
    staging: {
        port: 3000,
        https: 3001,
        envName: 'staging',
        hash: 'secretHashStaging',
        checks: 5,
        twilio: {
            accountSid: '',
            token: '',
            from: ''
        },
        session: {
            tokenName: 'token',
            sessionName: 'user',
            sessionInstance: 'user-instance'
        },
        remember: {
            cookieName: 'user',
            cookieExpire: 3600000 // час
        }
    },

    production: {
        port: 5000,
        https: 5001,
        envName: 'production',
        hash: 'secretHashProduction',
        checks: 5,
        twilio: {
            accountSid: '',
            token: '',
            from: ''
        }
    }
};

const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

const envToExport = typeof env[currentEnv] === 'object' ? env[currentEnv] : env.staging;

module.exports = envToExport;