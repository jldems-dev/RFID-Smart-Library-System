import { prisma } from "./prisma";
import { sendDueReminder, sendOverdueNotice } from "./email";
import { differenceInDays, addDays } from "date-fns";

export async function processDailyNotifications() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get all active transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        user: true,
        book: true,
      },
    });
    for (const transaction of transactions) {
      const daysUntilDue = differenceInDays(transaction.dueDate, today);
      const isOverdue = daysUntilDue < 0;

      // Send due reminder 3 days before
      if (daysUntilDue === 3 && transaction.user.emailNotifications) {
        try {
          await sendDueReminder(transaction.user.email, transaction.user.name, [
            {
              title: transaction.book.title,
              dueDate: transaction.dueDate.toLocaleDateString(),
            },
          ]);

          await prisma.notificationLog.create({
            data: {
              userId: transaction.user.id,
              type: "DUE_REMINDER",
              message: `Reminder: ${transaction.book.title} due in 3 days`,
              emailStatus: "SENT",
            },
          });
        } catch (error) {
          console.error(
            `Failed to send due reminder for user ${transaction.user.id}:`,
            error,
          );
          await prisma.notificationLog.create({
            data: {
              userId: transaction.user.id,
              type: "DUE_REMINDER",
              message: `Failed to send reminder: ${error instanceof Error ? error.message : "Unknown error"}`,
              emailStatus: "FAILED",
            },
          });
        }
      }

      // Handle overdue books
      if (isOverdue) {
        const daysOverdue = Math.abs(daysUntilDue);

        // Send overdue notice
        if (daysOverdue === 1 || daysOverdue === 7) {
          if (transaction.user.emailNotifications) {
            try {
              await sendOverdueNotice(
                transaction.user.email,
                transaction.user.name,
                [
                  {
                    title: transaction.book.title,
                    daysOverdue,
                  },
                ],
              );

              await prisma.notificationLog.create({
                data: {
                  userId: transaction.user.id,
                  type: "OVERDUE",
                  message: `Overdue notice: ${transaction.book.title} is ${daysOverdue} day(s) overdue`,
                  emailStatus: "SENT",
                },
              });
            } catch (error) {
              console.error(
                `Failed to send overdue notice for user ${transaction.user.id}:`,
                error,
              );
            }
          }

          // Update transaction status to OVERDUE
          if (transaction.status !== "OVERDUE") {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: "OVERDUE" },
            });
          }
        }

        // Suspend user after 7 days overdue
        if (daysOverdue >= 7 && transaction.user.status === "ACTIVE") {
          await prisma.user.update({
            where: { id: transaction.user.id },
            data: { status: "SUSPENDED" },
          });
        }
      }
    }

    /*  // Check and expire old reservations
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: "READY",
        expiresAt: {
          lt: today,
        },
      },
    });

    for (const reservation of expiredReservations) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { status: "EXPIRED" },
      });
    } */

    console.log("[Cron] Daily notifications processed successfully");
    return { success: true };
  } catch (error) {
    console.error("[Cron] Failed to process daily notifications:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function setupLocalCron() {
  // Only setup for local development
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    const nodeCron = await import("node-cron");
    // Run daily at 8 AM
    nodeCron.default.schedule("0 8 * * *", async () => {
      console.log("[Cron] Running daily notifications task");
      await processDailyNotifications();
    });
    console.log("[Cron] Local cron job scheduled");
  } catch (error) {
    console.warn("[Cron] node-cron not available, skipping local cron setup");
  }
}
