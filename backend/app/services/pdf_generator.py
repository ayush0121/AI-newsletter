from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO
import datetime

class PDFGenerator:
    def generate_daily_digest(self, articles):
        """
        Generates a PDF for the daily digest.
        articles: List of Article objects/dicts.
        Returns: BytesIO object containing the PDF.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
        
        Story = []
        styles = getSampleStyleSheet()
        
        # Styles
        styles.add(ParagraphStyle(name='DigestTitle', fontSize=24, leading=28, spaceAfter=20, textColor=colors.HexColor('#111827')))
        styles.add(ParagraphStyle(name='DigestDate', fontSize=12, leading=14, spaceAfter=40, textColor=colors.gray))
        styles.add(ParagraphStyle(name='ArticleTitle', fontSize=14, leading=18, spaceAfter=6, fontName='Helvetica-Bold', textColor=colors.HexColor('#1f2937')))
        styles.add(ParagraphStyle(name='ArticleCategory', fontSize=10, leading=12, spaceAfter=4, textColor=colors.HexColor('#4f46e5')))
        styles.add(ParagraphStyle(name='ArticleSummary', fontSize=11, leading=14, spaceAfter=10, textColor=colors.HexColor('#374151')))
        styles.add(ParagraphStyle(name='ArticleLink', fontSize=10, leading=12, spaceAfter=20, textColor=colors.blue))

        # Title
        Story.append(Paragraph("SynapseDigest Daily", styles['DigestTitle']))
        
        # Date
        today = datetime.datetime.now().strftime("%B %d, %Y")
        Story.append(Paragraph(f"Your AI Brief for {today}", styles['DigestDate']))

        Story.append(Spacer(1, 12))

        # Articles
        if not articles:
            Story.append(Paragraph("No articles found for today.", styles["Normal"]))
        
        for i, art in enumerate(articles):
            # Safe Access
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

            # Render
            Story.append(Paragraph(str(category).upper(), styles['ArticleCategory']))
            Story.append(Paragraph(title, styles['ArticleTitle']))
            Story.append(Paragraph(summary, styles['ArticleSummary']))
            
            link_text = f'<link href="{url}" color="blue">Read Full Article</link>'
            Story.append(Paragraph(link_text, styles['ArticleLink']))
            
            Story.append(Spacer(1, 12))
            
            # Simple Separator Line
            # We skip line for the last item
            if i < len(articles) - 1:
                Story.append(Spacer(1, 12))

        doc.build(Story)
        buffer.seek(0)
        return buffer

pdf_generator = PDFGenerator()
