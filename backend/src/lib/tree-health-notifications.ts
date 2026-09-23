import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { db, forestOfficersTable, iotSensorsTable, treesTable } from "../db";
import { emailService } from "./email";

type ForestOfficer = typeof forestOfficersTable.$inferSelect;
type IotSensor = typeof iotSensorsTable.$inferSelect;
type Tree = typeof treesTable.$inferSelect;

type AlertLabel = "NEEDS_WATER" | "HIGH_HEAT";

interface StateHealthSummary {
  state: string;
  treeCount: number;
  readingCount: number;
  criticalReadingCount: number;
  lowMoistureCount: number;
  highHeatCount: number;
  affectedTreeCount: number;
  latestAlerts: Array<{
    treeCode: string;
    district: string;
    alertGenerated: AlertLabel;
    soilMoisture: number;
    temperature: number;
    humidity: number;
    recordedAt: Date;
  }>;
}

function formatDate(value: Date): string {
  return value.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getAlertLabel(alertGenerated: AlertLabel): string {
  return alertGenerated === "NEEDS_WATER" ? "Low soil moisture" : "High temperature";
}

function getAlertDescription(alertGenerated: AlertLabel): string {
  return alertGenerated === "NEEDS_WATER"
    ? "Soil moisture dropped below the safe threshold of 20%."
    : "Temperature rose above the safe threshold of 40°C.";
}

class TreeHealthNotificationService {
  private readonly summaryLookbackDays = 7;

  private async getVerifiedOfficers(): Promise<ForestOfficer[]> {
    return db
      .select()
      .from(forestOfficersTable)
      .where(eq(forestOfficersTable.verificationStatus, "verified"));
  }

  private async getTreesForState(state: string): Promise<Tree[]> {
    return db.select().from(treesTable).where(eq(treesTable.state, state));
  }

  private async getReadingsForTrees(treeCodes: string[], since: Date): Promise<IotSensor[]> {
    if (treeCodes.length === 0) {
      return [];
    }

    return db
      .select()
      .from(iotSensorsTable)
      .where(and(inArray(iotSensorsTable.treeCode, treeCodes), gte(iotSensorsTable.recordedAt, since)))
      .orderBy(desc(iotSensorsTable.recordedAt));
  }

  private async buildStateSummary(state: string): Promise<StateHealthSummary> {
    const trees = await this.getTreesForState(state);
    const treeCodes = trees.map((tree) => tree.treeCode);
    const since = new Date();
    since.setDate(since.getDate() - this.summaryLookbackDays);

    const readings = await this.getReadingsForTrees(treeCodes, since);
    const treeLookup = new Map(trees.map((tree) => [tree.treeCode, tree]));
    const affectedTreeCodes = new Set<string>();
    const latestAlerts: StateHealthSummary["latestAlerts"] = [];

    let criticalReadingCount = 0;
    let lowMoistureCount = 0;
    let highHeatCount = 0;

    for (const reading of readings) {
      if (!reading.alertGenerated) {
        continue;
      }

      const alertGenerated = reading.alertGenerated as AlertLabel;
      const tree = treeLookup.get(reading.treeCode);

      criticalReadingCount += 1;
      affectedTreeCodes.add(reading.treeCode);

      if (alertGenerated === "NEEDS_WATER") {
        lowMoistureCount += 1;
      } else if (alertGenerated === "HIGH_HEAT") {
        highHeatCount += 1;
      }

      if (latestAlerts.length < 5) {
        latestAlerts.push({
          treeCode: reading.treeCode,
          district: tree?.district ?? "Unknown district",
          alertGenerated,
          soilMoisture: reading.soilMoisture,
          temperature: reading.temperature,
          humidity: reading.humidity,
          recordedAt: reading.recordedAt,
        });
      }
    }

    return {
      state,
      treeCount: trees.length,
      readingCount: readings.length,
      criticalReadingCount,
      lowMoistureCount,
      highHeatCount,
      affectedTreeCount: affectedTreeCodes.size,
      latestAlerts,
    };
  }

  async notifyCriticalReading(reading: IotSensor): Promise<void> {
    if (!reading.alertGenerated) {
      return;
    }

    const [tree] = await db
      .select()
      .from(treesTable)
      .where(eq(treesTable.treeCode, reading.treeCode))
      .limit(1);

    if (!tree) {
      return;
    }

    const officers = await db
      .select()
      .from(forestOfficersTable)
      .where(and(eq(forestOfficersTable.state, tree.state), eq(forestOfficersTable.verificationStatus, "verified")));

    if (officers.length === 0) {
      return;
    }

    const alertGenerated = reading.alertGenerated as AlertLabel;
    const subject = `[Tree Alert] ${getAlertLabel(alertGenerated)} detected for ${reading.treeCode}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #166534, #15803d); color: white; padding: 20px 24px; border-radius: 14px;">
          <h2 style="margin: 0;">Tree Health Alert</h2>
          <p style="margin: 8px 0 0; opacity: 0.92;">An abnormal sensor reading was detected and needs attention.</p>
        </div>
        <div style="background: white; padding: 24px; border-radius: 14px; margin-top: 16px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">Tree code: <strong>${reading.treeCode}</strong></p>
          <p style="margin: 0 0 12px; color: #334155;">State: <strong>${tree.state}</strong> | District: <strong>${tree.district}</strong></p>
          <p style="margin: 0 0 12px; color: #334155;">Alert: <strong>${getAlertLabel(alertGenerated)}</strong></p>
          <p style="margin: 0 0 16px; color: #334155;">${getAlertDescription(alertGenerated)}</p>
          <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;">
            <div style="padding: 14px; background: #f1f5f9; border-radius: 12px;">
              <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">Soil Moisture</div>
              <div style="font-size: 22px; font-weight: 700; color: #0f172a;">${reading.soilMoisture}%</div>
            </div>
            <div style="padding: 14px; background: #f1f5f9; border-radius: 12px;">
              <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">Temperature</div>
              <div style="font-size: 22px; font-weight: 700; color: #0f172a;">${reading.temperature}°C</div>
            </div>
            <div style="padding: 14px; background: #f1f5f9; border-radius: 12px;">
              <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">Humidity</div>
              <div style="font-size: 22px; font-weight: 700; color: #0f172a;">${reading.humidity}%</div>
            </div>
          </div>
          <p style="margin: 16px 0 0; color: #64748b; font-size: 13px;">Recorded at ${formatDate(reading.recordedAt)}</p>
        </div>
      </div>
    `;

    const text = [
      "Tree Health Alert",
      `Tree code: ${reading.treeCode}`,
      `State: ${tree.state}`,
      `District: ${tree.district}`,
      `Alert: ${getAlertLabel(alertGenerated)}`,
      getAlertDescription(alertGenerated),
      `Soil moisture: ${reading.soilMoisture}%`,
      `Temperature: ${reading.temperature}°C`,
      `Humidity: ${reading.humidity}%`,
      `Recorded at: ${formatDate(reading.recordedAt)}`,
    ].join("\n");

    await Promise.all(
      officers.map((officer) =>
        emailService.sendEmail({
          to: officer.email,
          subject,
          html,
          text,
        }),
      ),
    );
  }

  private async sendWeeklySummaryToOfficer(officer: ForestOfficer, summary: StateHealthSummary): Promise<boolean> {
    const subject = `[Weekly Tree Health Summary] ${officer.state}`;
    const latestAlertsHtml = summary.latestAlerts.length
      ? summary.latestAlerts
          .map(
            (alert) => `
              <tr>
                <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">${alert.treeCode}</td>
                <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">${alert.district}</td>
                <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">${getAlertLabel(alert.alertGenerated)}</td>
                <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">${alert.soilMoisture}%</td>
                <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">${alert.temperature}°C</td>
                <td style="padding: 10px 12px; border-top: 1px solid #e2e8f0;">${formatDate(alert.recordedAt)}</td>
              </tr>
            `,
          )
          .join("")
      : `
        <tr>
          <td colspan="6" style="padding: 12px; border-top: 1px solid #e2e8f0; color: #64748b;">No critical sensor alerts were recorded in the last 7 days.</td>
        </tr>
      `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 760px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 16px;">
        <div style="background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; padding: 22px 24px; border-radius: 14px;">
          <h2 style="margin: 0;">Weekly Tree Health Summary</h2>
          <p style="margin: 8px 0 0; opacity: 0.92;">State coverage and critical sensor activity for the past 7 days.</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px;">
          <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">Trees Monitored</div>
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${summary.treeCount}</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">Sensor Readings</div>
            <div style="font-size: 28px; font-weight: 700; color: #0f172a;">${summary.readingCount}</div>
          </div>
          <div style="background: white; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em;">Critical Alerts</div>
            <div style="font-size: 28px; font-weight: 700; color: #b91c1c;">${summary.criticalReadingCount}</div>
          </div>
        </div>
        <div style="background: white; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; margin-top: 16px;">
          <h3 style="margin: 0 0 12px; color: #0f172a;">Summary for ${officer.state}</h3>
          <p style="margin: 0 0 8px; color: #334155;">Affected trees: <strong>${summary.affectedTreeCount}</strong></p>
          <p style="margin: 0 0 8px; color: #334155;">Low moisture alerts: <strong>${summary.lowMoistureCount}</strong></p>
          <p style="margin: 0; color: #334155;">High heat alerts: <strong>${summary.highHeatCount}</strong></p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; margin-top: 16px; overflow-x: auto;">
          <h3 style="margin: 0 0 12px; color: #0f172a;">Latest Critical Alerts</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #0f172a;">
            <thead>
              <tr style="text-align: left; background: #f1f5f9;">
                <th style="padding: 10px 12px;">Tree</th>
                <th style="padding: 10px 12px;">District</th>
                <th style="padding: 10px 12px;">Alert</th>
                <th style="padding: 10px 12px;">Moisture</th>
                <th style="padding: 10px 12px;">Temp</th>
                <th style="padding: 10px 12px;">Recorded At</th>
              </tr>
            </thead>
            <tbody>
              ${latestAlertsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const text = [
      `Weekly Tree Health Summary - ${officer.state}`,
      `Trees monitored: ${summary.treeCount}`,
      `Sensor readings: ${summary.readingCount}`,
      `Critical alerts: ${summary.criticalReadingCount}`,
      `Affected trees: ${summary.affectedTreeCount}`,
      `Low moisture alerts: ${summary.lowMoistureCount}`,
      `High heat alerts: ${summary.highHeatCount}`,
      "",
      "Latest Critical Alerts:",
      ...(summary.latestAlerts.length
        ? summary.latestAlerts.map(
            (alert) =>
              `${alert.treeCode} | ${alert.district} | ${getAlertLabel(alert.alertGenerated)} | ${alert.soilMoisture}% | ${alert.temperature}°C | ${formatDate(alert.recordedAt)}`,
          )
        : ["No critical sensor alerts were recorded in the last 7 days." ]),
    ].join("\n");

    return emailService.sendEmail({
      to: officer.email,
      subject,
      html,
      text,
    });
  }

  async sendWeeklyHealthSummaries(): Promise<void> {
    const officers = await this.getVerifiedOfficers();
    const officersByState = new Map<string, ForestOfficer[]>();

    for (const officer of officers) {
      const stateOfficers = officersByState.get(officer.state) ?? [];
      stateOfficers.push(officer);
      officersByState.set(officer.state, stateOfficers);
    }

    for (const [state, stateOfficers] of officersByState) {
      const summary = await this.buildStateSummary(state);
      await Promise.all(stateOfficers.map((officer) => this.sendWeeklySummaryToOfficer(officer, summary)));
    }
  }
}

const treeHealthNotificationService = new TreeHealthNotificationService();

let weeklySummaryTimer: NodeJS.Timeout | null = null;

function getMillisecondsUntilNextMondayNineAm(now = new Date()): number {
  const target = new Date(now);
  target.setMilliseconds(0);
  target.setSeconds(0);
  target.setMinutes(0);
  target.setHours(9, 0, 0, 0);

  const currentDay = now.getDay();
  const daysUntilMonday = (8 - currentDay) % 7;
  target.setDate(now.getDate() + daysUntilMonday);

  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }

  return target.getTime() - now.getTime();
}

function scheduleNextWeeklySummary(): void {
  const delay = getMillisecondsUntilNextMondayNineAm();
  weeklySummaryTimer = setTimeout(() => {
    void treeHealthNotificationService
      .sendWeeklyHealthSummaries()
      .catch((error) => console.error("Failed to send weekly tree health summaries:", error))
      .finally(() => {
        scheduleNextWeeklySummary();
      });
  }, delay);
}

export function startTreeHealthNotificationScheduler(): void {
  if (weeklySummaryTimer) {
    return;
  }

  scheduleNextWeeklySummary();
}

export { treeHealthNotificationService };