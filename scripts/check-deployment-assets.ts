import { auditBuildAssets } from "./deployment-assets.ts";
const result = await auditBuildAssets({ directory: "qbert-clone/dist", deploymentUrl: "https://samuelasherrivello-com-ai.github.io/babylon-lite-cubybert/", obsoleteBases: ["/babylon-lite-qbert-clone/"] });
if (result.failures.length) throw new Error(result.failures.join("\n"));
console.log("Production asset paths checked:", result.checked.length);
