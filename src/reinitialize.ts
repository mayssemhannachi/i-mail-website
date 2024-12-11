import { OramaClient } from "./lib/orama";

async function reinitializeIndex(accountId: string) {
    try {
        const orama = new OramaClient(accountId);

        // Reinitialize the index
        await orama.initialize(); // This will reset the index with a fresh schema
        console.log(`Orama index reinitialized for account: ${accountId}`);
    } catch (error) {
        console.error("Failed to reinitialize the index:", error);
    }
}

// Replace with your account ID
const accountId = "103100037521662419556";
reinitializeIndex(accountId).then(() => {
    console.log("Index reinitialization completed");
    process.exit(0);
});