import os
import logging

# In production, use SendGrid / Resend / AWS SES
# For now, we print to console (development mode) or log to file.

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
        """
        Sends an email via Resend.
        """
        try:
            from app.core.config import settings
            import resend
            
            if not settings.RESEND_API_KEY:
                 logger.warning("[MOCK EMAIL] RESEND_API_KEY not set. Printing to console.")
                 print(f"📧 [MOCK] To: {to_email} | Subject: {subject}")
                 return True

            resend.api_key = settings.RESEND_API_KEY
            
            params = {
                "from": settings.EMAIL_FROM,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            }
            if text_content:
                params["text"] = text_content
                
            email = resend.Emails.send(params)
            logger.info(f"📧 [RESEND] Sent to {to_email} | ID: {email.get('id')}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Email Failed: {e}")
            return False

email_service = EmailService()
