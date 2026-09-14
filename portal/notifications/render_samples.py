"""Render reviewed sample PDFs from the same notification content used in the UI.
Requires ReportLab; this is an authoring utility, not a running mail worker.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'pdf'
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold', 'C:/Windows/Fonts/arialbd.ttf'))
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyTR', fontName='Arial', fontSize=10, leading=15, textColor=colors.HexColor('#14212b')))
styles.add(ParagraphStyle(name='TitleTR', fontName='ArialBold', fontSize=23, leading=28, textColor=colors.HexColor('#302080'), spaceAfter=10))
styles.add(ParagraphStyle(name='LabelTR', fontName='ArialBold', fontSize=9, leading=13, textColor=colors.HexColor('#302080')))

def footer(c, doc):
    c.setStrokeColor(colors.HexColor('#d9d6e8'))
    c.line(42, 49, A4[0]-42, 49)
    c.setFont('Arial', 8)
    c.setFillColor(colors.HexColor('#667085'))
    c.drawString(42, 34, 'ASCEND Lojistik | info@ascendlojistik.com | www.ascendlojistik.com')
    c.drawRightString(A4[0]-42, 34, str(doc.page))

for event in ['departure', 'arrival']:
    data = json.loads((OUT / f'{event}.json').read_text(encoding='utf-8'))
    doc = SimpleDocTemplate(str(OUT / data['attachmentName']), pagesize=A4, rightMargin=42, leftMargin=42, topMargin=36, bottomMargin=65)
    logo = Image(str(ROOT / 'portal/prototype/ascend_logo_correct.png'))
    ratio = 100 / logo.imageWidth
    logo.drawWidth = 100
    logo.drawHeight = logo.imageHeight * ratio
    logo.hAlign = 'LEFT'
    story = [logo, Spacer(1, 16), Paragraph(escape(data['title']), styles['TitleTR']),
             Paragraph('ÖRNEK BELGE - Tüm bilgiler kurgusaldır. E-posta gönderilmemiştir.', styles['BodyTR']), Spacer(1, 18)]
    rows = [[Paragraph(escape(k), styles['LabelTR']), Paragraph(escape(v), styles['BodyTR'])] for k,v in data['fields']]
    table = Table(rows, colWidths=[145, A4[0]-84-145], hAlign='LEFT')
    table.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'TOP'), ('BACKGROUND',(0,0),(0,-1),colors.HexColor('#eeedf4')),
        ('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#d9d6e8')),
        ('LEFTPADDING',(0,0),(-1,-1),10), ('RIGHTPADDING',(0,0),(-1,-1),10),
        ('TOPPADDING',(0,0),(-1,-1),6), ('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))
    story.extend([table, Spacer(1, 18), Paragraph('Bu belge sevkiyatın operasyon bildirimidir. Konşimento veya teslim belgesi yerine geçmez.', styles['BodyTR'])])
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
