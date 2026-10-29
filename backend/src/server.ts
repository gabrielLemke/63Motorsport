import 'dotenv/config';
import { buildApp } from './app.js';
import { prisma } from './lib/prisma.js';

const app = buildApp();
const PORT = Number(process.env.PORT) || 3333;
const HOST = '0.0.0.0';

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🏁 63 Motorsport API operando em http://localhost:${PORT}`);
    app.log.info(`🔒 Proteção ativa: Helmet (Security Headers), CORS e Rate Limiting`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful Shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
for (const signal of signals) {
  process.on(signal, async () => {
    app.log.info(`\n🛑 Sinal ${signal} recebido. Encerrando servidor da 63 Motorsport...`);
    try {
      await app.close();
      await prisma.$disconnect();
      app.log.info('✅ Conexões de rede e banco de dados encerradas com segurança.');
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'Erro durante o encerramento gracioso');
      process.exit(1);
    }
  });
}

if (!process.env.VERCEL) {
  start();
}

export default app;
