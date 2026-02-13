const nodemailer = require("nodemailer");

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.APP_PASSWORD,
    },
  });
};

/**
 * Send absence notification email to student
 * @param {Object} options - Email options
 * @param {string} options.studentEmail - Student's email address
 * @param {string} options.studentName - Student's name
 * @param {string} options.rollNumber - Student's roll number
 * @param {string} options.className - Class name
 * @param {string} options.date - Date of absence
 * @param {string} options.subject - Subject name (optional)
 * @returns {Promise} - Email sending promise
 */
const sendAbsenceNotification = async ({
  studentEmail,
  studentName,
  rollNumber,
  className,
  date,
  subject = "N/A",
}) => {
  try {
    const transporter = createTransporter();

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `"Attendance System" <${process.env.MAIL_USERNAME}>`,
      to: studentEmail,
      subject: `⚠️ Attendance Alert - You Were Marked Absent`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .info-table td:first-child { font-weight: bold; width: 40%; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .important { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📢 Attendance Alert</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Attendance Management System</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <strong>⚠️ Important:</strong> You were marked absent from class today.
              </div>
              
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>This is an automated notification to inform you that you were marked <strong>ABSENT</strong> from class today.</p>
              
              <table class="info-table">
                <tr>
                  <td>Student Name:</td>
                  <td>${studentName}</td>
                </tr>
                <tr>
                  <td>Roll Number:</td>
                  <td>${rollNumber}</td>
                </tr>
                <tr>
                  <td>Class:</td>
                  <td>${className}</td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td>${formattedDate}</td>
                </tr>
                <tr>
                  <td>Subject:</td>
                  <td>${subject}</td>
                </tr>
              </table>
              
              <div class="important">
                <strong>📌 What You Should Do:</strong>
                <ul style="margin: 10px 0;">
                  <li><strong>If you were present:</strong> This might be a technical error during face recognition. Please contact your class teacher or administration immediately.</li>
                  <li><strong>If you were absent:</strong> Make sure to inform your parents/guardians and catch up on missed lessons.</li>
                  <li><strong>Medical/Emergency reasons:</strong> Submit appropriate documentation to the administration office.</li>
                </ul>
              </div>
              
              <p><strong>Why am I receiving this?</strong></p>
              <p style="font-size: 14px; color: #666;">
                Our attendance system uses face recognition technology. Sometimes technical issues or lighting conditions may affect recognition accuracy. 
                If you believe this absence was marked in error, please reach out to the administration within 24 hours.
              </p>
              
              <p style="margin-top: 30px;">If you have any questions or concerns, please contact the school administration or your class teacher.</p>
              
              <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 5px; border: 1px solid #ddd;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <strong>Note:</strong> This is an automated message from the Attendance Management System. 
                  Your attendance record is important for your academic progress.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Attendance Management System</p>
              <p>This email was sent to you because you are enrolled in the system.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
ATTENDANCE ALERT - You Were Marked Absent

Dear ${studentName},

This is an automated notification to inform you that you were marked ABSENT from class today.

Student Details:
- Name: ${studentName}
- Roll Number: ${rollNumber}
- Class: ${className}
- Date: ${formattedDate}
- Subject: ${subject}

What You Should Do:
- If you were present: This might be a technical error. Contact your teacher or administration immediately.
- If you were absent: Inform your parents/guardians and catch up on missed lessons.
- Medical/Emergency reasons: Submit appropriate documentation to administration.

Why am I receiving this?
Our attendance system uses face recognition technology. If you believe this absence was marked in error, 
please reach out to the administration within 24 hours.

---
This is an automated message from the Attendance Management System.
© ${new Date().getFullYear()} Attendance Management System
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Student absence notification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending student absence notification:", error);
    throw error;
  }
};

/**
 * Send excused absence confirmation email to student
 * @param {Object} options - Email options
 * @param {string} options.studentEmail - Student's email address
 * @param {string} options.studentName - Student's name
 * @param {string} options.rollNumber - Student's roll number
 * @param {string} options.className - Class name
 * @param {string} options.date - Date of absence
 * @param {string} options.reason - Reason for excusing
 * @returns {Promise} - Email sending promise
 */
const sendExcusedConfirmation = async ({
  studentEmail,
  studentName,
  rollNumber,
  className,
  date,
  reason,
}) => {
  try {
    const transporter = createTransporter();

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const mailOptions = {
      from: `"Attendance System" <${process.env.MAIL_USERNAME}>`,
      to: studentEmail,
      subject: `✅ Absence Excused - ${studentName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #e6ffed; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
            .info-table td:first-child { font-weight: bold; width: 40%; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Absence Excused</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Attendance System</p>
            </div>
            <div class="content">
              <div class="success-box">
                <strong>✅ Good News:</strong> Your absence has been marked as excused.
              </div>
              
              <p>Dear <strong>${studentName}</strong>,</p>
              
              <p>This is to confirm that your absence on <strong>${formattedDate}</strong> has been marked as <strong>EXCUSED</strong> by the administration.</p>
              
              <table class="info-table">
                <tr>
                  <td>Student Name:</td>
                  <td>${studentName}</td>
                </tr>
                <tr>
                  <td>Roll Number:</td>
                  <td>${rollNumber}</td>
                </tr>
                <tr>
                  <td>Class:</td>
                  <td>${className}</td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td>${formattedDate}</td>
                </tr>
                ${reason ? `<tr><td>Reason:</td><td>${reason}</td></tr>` : ''}
              </table>
              
              <div style="background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin: 20px 0;">
                <p style="margin: 0;"><strong>📌 Important:</strong></p>
                <p style="margin: 10px 0 0 0;">
                  This absence will be recorded as <strong>excused</strong> in your attendance record and 
                  will not negatively impact your attendance percentage or academic standing.
                </p>
              </div>
              
              <p>If you have any questions about this, please contact the administration office.</p>
              
              <p style="margin-top: 30px;">Thank you for your attention to your attendance.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Attendance Management System</p>
              <p>Keep up with your classes and maintain good attendance!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Excused confirmation email sent to student:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending excused confirmation email:", error);
    throw error;
  }
};

module.exports = {
  sendAbsenceNotification,
  sendExcusedConfirmation,
};
