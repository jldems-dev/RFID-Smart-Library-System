/* import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BRAND_COLOR = "#3b82f6";

const emailTemplates = {
  borrowConfirmation: (
    userName: string,
    bookTitle: string,
    dueDate: string,
  ) => ({
    subject: `Book Borrowed: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${BRAND_COLOR}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Book Borrowed Successfully</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>You have successfully borrowed:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${bookTitle}</p>
          </div>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p>Please ensure the book is returned on time to avoid account suspension.</p>
          <p>Thank you!</p>
        </div>
      </div>
    `,
  }),

  returnConfirmation: (userName: string, bookTitle: string) => ({
    subject: `Book Returned: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${BRAND_COLOR}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Book Returned Successfully</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>We've received your return for:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${bookTitle}</p>
          </div>
          <p>Thank you for using the library!</p>
        </div>
      </div>
    `,
  }),

  dueReminder: (
    userName: string,
    books: Array<{ title: string; dueDate: string }>,
  ) => ({
    subject: "Library Book Due Reminder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${BRAND_COLOR}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Your Books Are Due Soon</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>You have the following book(s) due soon:</p>
          <div style="margin: 15px 0;">
            ${books
              .map(
                (book) => `
              <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-weight: bold;">${book.title}</p>
                <p style="margin: 5px 0; color: #666;">Due: ${book.dueDate}</p>
              </div>
            `,
              )
              .join("")}
          </div>
          <p>Please return them on time to keep your account in good standing.</p>
        </div>
      </div>
    `,
  }),

  overdueNotice: (
    userName: string,
    books: Array<{ title: string; daysOverdue: number }>,
  ) => ({
    subject: "Library Books Overdue - Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Books Overdue - Immediate Action Required</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p style="color: #ef4444; font-weight: bold;">You have overdue book(s):</p>
          <div style="margin: 15px 0;">
            ${books
              .map(
                (book) => `
              <div style="background: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ef4444;">
                <p style="margin: 5px 0; font-weight: bold;">${book.title}</p>
                <p style="margin: 5px 0; color: #666;">Overdue by: ${book.daysOverdue} day(s)</p>
              </div>
            `,
              )
              .join("")}
          </div>
          <p style="color: #ef4444;"><strong>Please return these items immediately.</strong></p>
          <p style="font-size: 13px; color: #666; margin-top: 20px;">If not returned within 7 days of the due date, your account will be suspended.</p>
        </div>
      </div>
    `,
  }),

  reservationReady: (
    userName: string,
    bookTitle: string,
    pickupDeadline: string,
  ) => ({
    subject: `Reserved Book Available: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Your Reserved Book Is Ready</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>Great news! Your reserved book is now available:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${bookTitle}</p>
          </div>
          <p><strong>Please pick up by:</strong> ${pickupDeadline}</p>
          <p style="font-size: 13px; color: #666;">If you don't pick it up by this date, it will be released to the next person on the waitlist.</p>
        </div>
      </div>
    `,
  }),
};

export async function sendDueReminder(
  email: string,
  userName: string,
  books: Array<{ title: string; dueDate: string }>,
) {
  const template = emailTemplates.dueReminder(userName, books);
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    ...template,
  });
}

export async function sendOverdueNotice(
  email: string,
  userName: string,
  books: Array<{ title: string; daysOverdue: number }>,
) {
  const template = emailTemplates.overdueNotice(userName, books);
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    ...template,
  });
}

export async function sendBorrowConfirmation(
  email: string,
  userName: string,
  bookTitle: string,
  dueDate: string,
) {
  const template = emailTemplates.borrowConfirmation(
    userName,
    bookTitle,
    dueDate,
  );
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    ...template,
  });
}

export async function sendReturnConfirmation(
  email: string,
  userName: string,
  bookTitle: string,
) {
  const template = emailTemplates.returnConfirmation(userName, bookTitle);
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    ...template,
  });
}

export async function sendReservationReady(
  email: string,
  userName: string,
  bookTitle: string,
  pickupDeadline: string,
) {
  const template = emailTemplates.reservationReady(
    userName,
    bookTitle,
    pickupDeadline,
  );
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    ...template,
  });
}
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const BRAND_COLOR = "#3b82f6";

// Ensure from address is properly formatted
const FROM_EMAIL =
  process.env.FROM_EMAIL?.trim() || "Library <noreply@resend.dev>";

const emailTemplates = {
  borrowConfirmation: (
    userName: string,
    bookTitle: string,
    dueDate: string,
  ) => ({
    subject: `Book Borrowed: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${BRAND_COLOR}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Book Borrowed Successfully</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>You have successfully borrowed:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${bookTitle}</p>
          </div>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p>Please ensure the book is returned on time to avoid account suspension.</p>
          <p>Thank you!</p>
        </div>
      </div>
    `,
  }),

  returnConfirmation: (userName: string, bookTitle: string) => ({
    subject: `Book Returned: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${BRAND_COLOR}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Book Returned Successfully</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>We've received your return for:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${bookTitle}</p>
          </div>
          <p>Thank you for using the library!</p>
        </div>
      </div>
    `,
  }),

  dueReminder: (
    userName: string,
    books: Array<{ title: string; dueDate: string }>,
  ) => ({
    subject: "Library Book Due Reminder",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${BRAND_COLOR}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Your Books Are Due Soon</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>You have the following book(s) due soon:</p>
          <div style="margin: 15px 0;">
            ${books
              .map(
                (book) => `
              <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                <p style="margin: 5px 0; font-weight: bold;">${book.title}</p>
                <p style="margin: 5px 0; color: #666;">Due: ${book.dueDate}</p>
              </div>
            `,
              )
              .join("")}
          </div>
          <p>Please return them on time to keep your account in good standing.</p>
        </div>
      </div>
    `,
  }),

  overdueNotice: (
    userName: string,
    books: Array<{ title: string; daysOverdue: number }>,
  ) => ({
    subject: "Library Books Overdue - Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Books Overdue - Immediate Action Required</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p style="color: #ef4444; font-weight: bold;">You have overdue book(s):</p>
          <div style="margin: 15px 0;">
            ${books
              .map(
                (book) => `
              <div style="background: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #ef4444;">
                <p style="margin: 5px 0; font-weight: bold;">${book.title}</p>
                <p style="margin: 5px 0; color: #666;">Overdue by: ${book.daysOverdue} day(s)</p>
              </div>
            `,
              )
              .join("")}
          </div>
          <p style="color: #ef4444;"><strong>Please return these items immediately.</strong></p>
          <p style="font-size: 13px; color: #666; margin-top: 20px;">If not returned within 7 days of the due date, your account will be suspended.</p>
        </div>
      </div>
    `,
  }),

  reservationReady: (
    userName: string,
    bookTitle: string,
    pickupDeadline: string,
  ) => ({
    subject: `Reserved Book Available: ${bookTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">Your Reserved Book Is Ready</h2>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <p>Hi ${userName},</p>
          <p>Great news! Your reserved book is now available:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">${bookTitle}</p>
          </div>
          <p><strong>Please pick up by:</strong> ${pickupDeadline}</p>
          <p style="font-size: 13px; color: #666;">If you don't pick it up by this date, it will be released to the next person on the waitlist.</p>
        </div>
      </div>
    `,
  }),
};

// Helper function to validate email format
function validateFromEmail(email: string): string {
  const emailRegex = /^[^<]*<[^>]+>$/;
  const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(email) || simpleEmailRegex.test(email)) {
    return email;
  }
  // Fallback to resend.dev for testing if invalid
  return "onboarding@resend.dev";
}

export async function sendDueReminder(
  email: string,
  userName: string,
  books: Array<{ title: string; dueDate: string }>,
) {
  const template = emailTemplates.dueReminder(userName, books);
  return resend.emails.send({
    from: validateFromEmail(FROM_EMAIL),
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendOverdueNotice(
  email: string,
  userName: string,
  books: Array<{ title: string; daysOverdue: number }>,
) {
  const template = emailTemplates.overdueNotice(userName, books);
  return resend.emails.send({
    from: validateFromEmail(FROM_EMAIL),
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendBorrowConfirmation(
  email: string,
  userName: string,
  bookTitle: string,
  dueDate: string,
) {
  const template = emailTemplates.borrowConfirmation(
    userName,
    bookTitle,
    dueDate,
  );
  return resend.emails.send({
    from: validateFromEmail(FROM_EMAIL),
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendReturnConfirmation(
  email: string,
  userName: string,
  bookTitle: string,
) {
  const template = emailTemplates.returnConfirmation(userName, bookTitle);
  return resend.emails.send({
    from: validateFromEmail(FROM_EMAIL),
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendReservationReady(
  email: string,
  userName: string,
  bookTitle: string,
  pickupDeadline: string,
) {
  const template = emailTemplates.reservationReady(
    userName,
    bookTitle,
    pickupDeadline,
  );
  return resend.emails.send({
    from: validateFromEmail(FROM_EMAIL),
    to: email,
    subject: template.subject,
    html: template.html,
  });
}
