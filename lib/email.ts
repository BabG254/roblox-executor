// Email service using Resend
// Make sure to install: npm install resend
// And add RESEND_API_KEY to your environment variables

let Resend: any
let resendInstance: any

// Dynamically import Resend to handle if it's not installed yet
async function getResendClient() {
  if (resendInstance) return resendInstance

  try {
    const ResendModule = await import("resend")
    Resend = ResendModule.Resend
    resendInstance = new Resend(process.env.RESEND_API_KEY)
    return resendInstance
  } catch (error) {
    console.error("Resend module not found. Please install: npm install resend")
    return null
  }
}

export async function sendVerificationEmail(email: string, code: string, username: string) {
  try {
    const resend = await getResendClient()
    
    if (!resend) {
      console.error("⚠️ Resend not configured. Email not sent.")
      return { success: false, error: "Email service not configured" }
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("⚠️ RESEND_API_KEY not set in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    const result = await resend.emails.send({
      from: "Vision <noreply@getvision.cx>",
      to: email,
      subject: "Vision - Email Verification",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #0a0a12;
              }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { 
                background: linear-gradient(135deg, #a855f7 0%, #6d28d9 100%); 
                color: white; 
                padding: 30px 20px; 
                border-radius: 12px; 
                text-align: center; 
              }
              .header h1 { margin: 0; font-size: 28px; }
              .content { 
                padding: 30px; 
                background: #1a1a24; 
                border-radius: 12px; 
                margin-top: 20px;
                color: #e5e5e5;
              }
              .code { 
                font-size: 36px; 
                font-weight: bold; 
                letter-spacing: 8px; 
                text-align: center; 
                color: #a855f7; 
                margin: 30px 0;
                padding: 20px;
                background: rgba(168, 85, 247, 0.1);
                border-radius: 8px;
                border: 2px solid #a855f7;
              }
              .footer { 
                text-align: center; 
                margin-top: 20px; 
                color: #666; 
                font-size: 12px; 
              }
              .warning { 
                color: #ef4444; 
                margin-top: 20px; 
                padding: 15px;
                background: rgba(239, 68, 68, 0.1);
                border-radius: 8px;
                border-left: 4px solid #ef4444;
              }
              p { line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👁️ Vision</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
              </div>
              <div class="content">
                <p>Hi <strong>${username}</strong>,</p>
                <p>Thank you for signing up for Vision! To complete your registration and activate your account, please verify your email address using the verification code below:</p>
                <div class="code">${code}</div>
                <p style="text-align: center; color: #888;">Enter this code on the verification page</p>
                <div class="warning">
                  <strong>⚠️ Security Notice</strong><br>
                  • This code expires in 24 hours<br>
                  • Do not share this code with anyone<br>
                  • We will never ask for this code via email or phone
                </div>
              </div>
              <div class="footer">
                <p>If you didn't create this account, please ignore this email.</p>
                <p>&copy; 2024 Vision. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) {
      console.error("Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" }
  }
}

export async function sendDownloadNotificationEmail(email: string, username: string, downloadName: string, downloadUrl: string) {
  try {
    const resend = await getResendClient()
    
    if (!resend) {
      console.error("⚠️ Resend not configured. Email not sent.")
      return { success: false, error: "Email service not configured" }
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("⚠️ RESEND_API_KEY not set in environment variables")
      return { success: false, error: "Email service not configured" }
    }

    const result = await resend.emails.send({
      from: "Vision <noreply@getvision.cx>",
      to: email,
      subject: "Vision - Download Ready",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #0a0a12;
              }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { 
                background: linear-gradient(135deg, #a855f7 0%, #6d28d9 100%); 
                color: white; 
                padding: 30px 20px; 
                border-radius: 12px; 
                text-align: center; 
              }
              .content { 
                padding: 30px; 
                background: #1a1a24; 
                border-radius: 12px; 
                margin-top: 20px;
                color: #e5e5e5;
              }
              .download-button {
                display: inline-block;
                padding: 15px 30px;
                background: linear-gradient(135deg, #a855f7 0%, #6d28d9 100%);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
              }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👁️ Vision</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Download Ready</p>
              </div>
              <div class="content">
                <p>Hi <strong>${username}</strong>,</p>
                <p>Your download of <strong>${downloadName}</strong> is ready!</p>
                <p style="text-align: center;">
                  <a href="${downloadUrl}" class="download-button">Download Now</a>
                </p>
                <p style="color: #888; font-size: 14px;">If the button doesn't work, copy this link:<br>
                <a href="${downloadUrl}" style="color: #a855f7;">${downloadUrl}</a></p>
                <p style="margin-top: 20px; padding: 15px; background: rgba(168, 85, 247, 0.1); border-radius: 8px;">
                  💡 <strong>Tip:</strong> If you didn't initiate this download, please contact support immediately.
                </p>
              </div>
              <div class="footer">
                <p>&copy; 2024 Vision. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (result.error) {
      console.error("Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("Error sending download email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to send email" }
  }
}
