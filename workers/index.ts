// workers/index.ts
import { worker as exitTicketWorker } from "./exitTicketWorker";
import { worker as rubricGradeWorker } from "./openAIWorker";
import { worker as rubricParseWorker } from "./rubricParseWorker";

const workers = [exitTicketWorker, rubricGradeWorker, rubricParseWorker];

async function shutdown(signal: string) {
    console.log(`${signal} received, finishing active jobs...`);
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));