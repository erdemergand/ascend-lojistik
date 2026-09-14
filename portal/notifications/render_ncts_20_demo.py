from pathlib import Path
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Table,TableStyle,LongTable
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
pdfmetrics.registerFont(TTFont('Arial','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold','C:/Windows/Fonts/arialbd.ttf'))
normal=ParagraphStyle('normal',fontName='Arial',fontSize=8,leading=10)
bold=ParagraphStyle('bold',parent=normal,fontName='ArialBold')
title=ParagraphStyle('title',parent=bold,fontSize=13,leading=18,spaceAfter=10)
def p(t,b=False):return Paragraph(str(t),bold if b else normal)
def money(n):return f'{n:,.2f}'.replace(',','X').replace('.',',').replace('X','.')
names=['Hidrolik pompa test parçası','Bağlantı adaptörü','Sızdırmazlık halkası','Metal montaj braketi','Plastik koruyucu kapak','Hortum bağlantı seti','Mil bağlantı elemanı','Filtre muhafazası','Sabitleme kelepçesi','Kontrol düğmesi','Sensör bağlantı aparatı','Conta seti','Kablo koruma kılıfı','Montaj plakası','Destek burcu','Koruyucu panel','Valf gövdesi test parçası','Bağlantı flanşı','Yedek parça kutusu','Montaj aksesuar seti']
items=[dict(no=i+1,name=n,packages=1,units=5+i,gross=30+i*2,net=25+i*2,value=300+i*50) for i,n in enumerate(names)]
gross=sum(x['gross'] for x in items);net=sum(x['net'] for x in items);value=sum(x['value'] for x in items)
story=[Paragraph('NCTS / TRANSİT TALEP FORMU',title),p('20 KALEM DEMOSU • ASC-2026-0002 tasarım örneği • 11.09.2026'),Spacer(1,10)]
def section(label,rows):
 data=[[p(label,True),p('')]]+[[p(a),p(b)] for a,b in rows]
 t=Table(data,colWidths=[145,390]);t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.4,colors.HexColor('#57616e')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf0f8')),('VALIGN',(0,0),(-1,-1),'TOP'),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]));story.extend([t,Spacer(1,9)])
section('GÖNDERİCİ',[('UNVANI','DEMO Avrupa Tedarik GmbH'),('ADRESİ / ÜLKESİ','Demo Strasse 10, 10115 Berlin / Almanya — kurgusal adres'),('VERGİ DAİRESİ / NO','Demo Vergi Dairesi / DEMO-DE-001')])
section('ALICI',[('UNVANI','DEMO Anadolu Dış Ticaret Ltd. Şti.'),('ADRESİ / ÜLKESİ','Demo Mahallesi, Örnek Caddesi No:10, Tuzla, İstanbul / Türkiye — kurgusal adres'),('VERGİ DAİRESİ / NO','Demo İstanbul Vergi Dairesi / 0000000000')])
section('YÜK / TRANSİT BİLGİLERİ',[('ÖZET BEYAN NO / TARİH','DEMO-OZET-0020 / 11.09.2026'),('ÇIKIŞ ÜLKESİ / PLAKA','Almanya / 34 DEMO 002'),('TOPLAM KAP / ADET',f'20 / {sum(x["units"] for x in items)}'),('TOPLAM BRÜT / NET',f'{money(gross)} kg / {money(net)} kg'),('HAREKET / VARIŞ GÜMRÜĞÜ','Kapıkule Gümrük Müdürlüğü / Erenköy Gümrük Müdürlüğü'),('GİDECEĞİ ANTREPO','DEMO İstanbul Antrepo'),('EŞYA KIYMETİ / VERGİ',f'{money(value)} USD / 125.000,00 TL'),('FATURA NO / TARİH','DEMO-FAT-0020 / 11.09.2026')])
story.append(p('KALEM BİLGİLERİ',True));story.append(Spacer(1,6))
headers=['KALEM','GTİP<br/>(12 HANE)','KAP','ADET','KİLO<br/>(BRÜT)','KİLO<br/>(NET)','EŞYA','KIYMET','MENŞE']
data=[[p(h,True) for h in headers]]
for x in items:data.append([p(x['no']),p('0000.00.00.00.00'),p(x['packages']),p(x['units']),p(money(x['gross'])),p(money(x['net'])),p('DEMO '+x['name']),p(money(x['value'])+' USD'),p('Almanya')])
data.append([p('TOPLAM',True),p('20 kalem'),p('20',True),p(sum(x['units'] for x in items),True),p(money(gross),True),p(money(net),True),p(''),p(money(value)+' USD',True),p('')])
t=LongTable(data,colWidths=[50,78,30,38,45,45,119,70,60],repeatRows=1,hAlign='LEFT')
t.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.4,colors.HexColor('#57616e')),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#edf0f8')),('BACKGROUND',(0,-1),(-1,-1),colors.HexColor('#edf0f8')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),6)]))
story.extend([t,Spacer(1,10),p('DEMO: Tüm kalemler kurgusaldır. GTİP değerleri test içindir; tarife sınıflandırması değildir.')])
def page(c,doc):
 c.setFont('Arial',8);c.setFillColor(colors.HexColor('#5b6370'));c.drawString(30,22,'ASCEND • 20 kalem NCTS demo • 11.09.2026');c.drawRightString(A4[0]-30,22,f'Sayfa {doc.page}')
 if doc.page>1:c.drawString(30,A4[1]-25,'NCTS / TRANSİT TALEP FORMU — KALEM LİSTESİ DEVAMI')
SimpleDocTemplate('output/pdf/NCTS_20_Kalem_DEMO.pdf',pagesize=A4,leftMargin=30,rightMargin=30,topMargin=40,bottomMargin=40).build(story,onFirstPage=page,onLaterPages=page)
print('Totals',gross,net,value)



