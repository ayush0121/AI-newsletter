import logging
import requests
from app.core.config import settings
from app.services.pdf_generator import pdf_generator
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.sender = settings.EMAIL_FROM
        self.api_url = "https://api.resend.com/emails"

    def send_welcome_email(self, to_email: str):
        subject = "Welcome to SynapseDigest! 🚀"
        html_content = """
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h1>Welcome to the Future.</h1>
            <p>Thanks for joining <strong>SynapseDigest</strong>.</p>
            <p>You're now on the list to receive our daily breakdown of the most critical AI and Engineering news.</p>
            <p>Expect your first digest tomorrow morning!</p>
            <br/>
            <p>Cheers,<br/>The SynapseDigest Team</p>
        </div>
        """

        if not self.api_key:
            logger.warning(f"MOCK EMAIL: Would send welcome email to {to_email}")
            logger.warning("To enable real emails, set RESEND_API_KEY in .env")
            return True

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": f"SynapseDigest <{self.sender}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            logger.info(f"Welcome email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    def send_account_welcome_email(self, to_email: str):
        """
        Sends an email to new account users asking them to subscribe to the newsletter.
        """
        subject = "Welcome to SynapseDigest! One last step... 📧"
        subscribe_url = f"{settings.FRONTEND_URL}/subscribe"
        
        html_content = f"""
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
            <h1>Account Created Successfully! 🎉</h1>
            <p>Welcome to <strong>SynapseDigest</strong>.</p>
            <p>You have successfully created your account.</p>
            <br/>
            <p><strong>Do you want to receive our Daily AI Newsletter?</strong></p>
            <p>Stay ahead of the curve with our curated tech news digests.</p>
            <br/>
            <a href="{subscribe_url}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Yes, Subscribe Me!</a>
            <br/><br/>
            <p>If you don't want to subscribe, you can ignore this email.</p>
            <br/>
            <p>Cheers,<br/>The SynapseDigest Team</p>
        </div>
        """

        if not self.api_key:
            logger.warning(f"MOCK ACCOUNT EMAIL: Would send to {to_email}")
            return True

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": f"SynapseDigestAccount <{self.sender}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            logger.info(f"Account welcome email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send account email: {e}")
            return False

    
    def send_digest_email(self, to_email: str, articles: list):
        """
        Sends a daily digest of top articles.
        articles: List of Article objects (or dicts with title, summary, url, category, thumbnail/image if any).
        """
        if not articles:
            logger.warning("No articles provided for digest.")
            return False

        # --- Email Template Construction ---
        
        # 1. Header
        html_body = """
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
            <div style="background-color: #000000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">SynapseDigest</h1>
                <p style="color: #9ca3af; margin: 5px 0 0; font-size: 12px; text-transform: uppercase;">Your Daily AI Download</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #111827; margin-top: 0; font-size: 20px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; display: inline-block;">Today's Top Stories</h2>
        """
        
        # 2. Articles Loop
        for art in articles:
            # Handle object or dict access safely
            if isinstance(art, dict):
                title = art.get('title', 'Untitled')
                summary = art.get('summary', 'No summary available.')
                url = art.get('url', '#')
                category = art.get('category', 'News')
            else:
                title = getattr(art, 'title', 'Untitled')
                summary = getattr(art, 'summary', 'No summary available.')
                url = getattr(art, 'url', '#')
                category = getattr(art, 'category', 'News')
            
            category = str(category).upper()
            
            html_body += f"""
            <div style="margin-top: 25px; margin-bottom: 25px;">
                <span style="background-color: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">{category}</span>
                <h3 style="margin: 8px 0 8px; font-size: 18px; line-height: 1.3;">
                    <a href="{url}" style="color: #111827; text-decoration: none; font-weight: 700;">{title}</a>
                </h3>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">{summary}</p>
                <div style="margin-top: 8px;">
                    <a href="{url}" style="color: #6366f1; font-size: 13px; font-weight: 600; text-decoration: none;">Read source →</a>
                </div>
            </div>
            <hr style="border: 0; border-top: 1px solid #f3f4f6;" />
            """

        # 3. Footer
        year = "2025" # Dynamic in prod, hardcoded for template speed
        html_body += f"""
            </div>
            
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                <p>&copy; {year} SynapseDigest. All rights reserved.</p>
                <p><a href="#" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a></p>
            </div>
        </div>
        """

        subject = f"Synapse Digest: {articles[0].title[:30]}... and more"
        
        # Generate PDF for attachment
        try:
            pdf_buffer = pdf_generator.generate_daily_digest(articles)
            pdf_content = list(pdf_buffer.getvalue()) # Resend accepts list of integers (bytes) in JSON
            
            filename_date = datetime.now().strftime('%Y-%m-%d')
            attachments = [
                {
                    "filename": f"SynapseDigest_{filename_date}.pdf",
                    "content": pdf_content
                }
            ]
        except Exception as e:
            logger.error(f"Failed to generate PDF for attachment: {e}")
            attachments = []

        if not self.api_key:
            logger.warning(f"MOCK DIGEST: Would send to {to_email}")
            return True

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": f"SynapseDigest <{self.sender}>",
                "to": [to_email],
                "subject": subject,
                "html": html_body,
                "attachments": attachments
            }
            
            response = requests.post(self.api_url, headers=headers, json=payload)
            if response.status_code not in [200, 201]:
                logger.error(f"Resend Error: {response.text}")
                return False
                
            logger.info(f"Digest sent to {to_email} with attachments")
            return True
        except Exception as e:
            logger.error(f"Failed to send digest: {e}")
            return False

email_service = EmailService()
