import { Router, type IRouter } from "express";
import { db, iotSensorsTable } from "../db";
import { eq, desc } from "drizzle-orm";
import { treeHealthNotificationService } from "../lib/tree-health-notifications";

const router: IRouter = Router();

// Retrieve all IoT sensor data for a specific tree
router.get("/api/iot/:treeCode", async (req, res, next) => {
    try {
        const { treeCode } = req.params;
        const sensors = await db
            .select()
            .from(iotSensorsTable)
            .where(eq(iotSensorsTable.treeCode, treeCode))
            .orderBy(desc(iotSensorsTable.recordedAt))
            .limit(50);

        res.json(sensors);
    } catch (err) {
        next(err);
    }
});

// Post new IoT sensor data (e.g., from hardware)
router.post("/api/iot/:treeCode", async (req, res, next) => {
    try {
        const { treeCode } = req.params;
        const { soilMoisture, temperature, humidity } = req.body;

        let alertGenerated = null;
        if (soilMoisture < 20) alertGenerated = "NEEDS_WATER";
        else if (temperature > 40) alertGenerated = "HIGH_HEAT";

        const [newReading] = await db.insert(iotSensorsTable).values({
            treeCode,
            soilMoisture,
            temperature,
            humidity,
            alertGenerated
        }).returning();

        res.json(newReading);

        if (alertGenerated) {
            void treeHealthNotificationService.notifyCriticalReading(newReading).catch((error) => {
                console.error("Failed to send tree health alert notifications:", error);
            });
        }
    } catch (err) {
        next(err);
    }
});

export default router;
