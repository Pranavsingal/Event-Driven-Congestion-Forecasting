import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_field_action_pdf(filters: dict, plan: dict, diversions: list, output_path: str):
    """
    Generates a printable PDF report for the active dispatch plan.
    Includes officer count, incident coordinates/position, equipment checklist,
    and recommended diversion routes.
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    story = []
    
    # Setup Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=15
    )
    
    section_heading = ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e40af'), # blue-800
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8
    )

    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    # 1. Document Title
    story.append(Paragraph("GRIDLOCK TACTICAL ACTION SHEET", title_style))
    story.append(Paragraph(f"Generated: {datetime_now_str()}", body_style))
    story.append(Spacer(1, 10))
    
    # 2. Section: Incident Details
    story.append(Paragraph("1. INCIDENT PROFILE", section_heading))
    profile_data = [
        [Paragraph("Active Bottleneck Cause:", bold_body_style), Paragraph(filters.get("cause", "Unknown").replace('_', ' ').title(), body_style)],
        [Paragraph("Affected Corridor:", bold_body_style), Paragraph(filters.get("corridor", "Unknown"), body_style)],
        [Paragraph("Target Junction / Node:", bold_body_style), Paragraph(filters.get("junction", "Unknown"), body_style)],
        [Paragraph("Monitoring Zone:", bold_body_style), Paragraph(filters.get("zone", "Unknown"), body_style)],
        [Paragraph("Vehicle Type Involved:", bold_body_style), Paragraph(filters.get("veh_type", "Unknown").replace('_', ' ').title(), body_style)]
    ]
    t1 = Table(profile_data, colWidths=[180, 320])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t1)
    story.append(Spacer(1, 10))
    
    # 3. Section: Deployment Plan
    story.append(Paragraph("2. MANPOWER & TACTICAL DEPLOYMENT", section_heading))
    deployment_data = [
        [Paragraph("Threat Severity Level:", bold_body_style), Paragraph(plan.get("urgency_level", "Standard").upper(), bold_body_style)],
        [Paragraph("Personnel Count Assigned:", bold_body_style), Paragraph(f"{plan.get('manpower', 2)} Officers", body_style)],
        [Paragraph("Barricade Placements:", bold_body_style), Paragraph(f"{plan.get('barricade_points', 0)} blockade points", body_style)],
        [Paragraph("Responder ETA:", bold_body_style), Paragraph(f"{plan.get('eta_responders_mins', 20)} minutes", body_style)]
    ]
    t2 = Table(deployment_data, colWidths=[180, 320])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))
    
    # 4. Section: Equipment Checklist
    story.append(Paragraph("3. EQUIPMENT CHECKLIST", section_heading))
    equip_items = plan.get("equipment", [])
    if not equip_items:
        equip_items = ["Standard Traffic Cones", "High-Visibility Safety Vests"]
    
    equip_paragraphs = [Paragraph(f"&bull; {item}", body_style) for item in equip_items]
    # Arrange in columns
    col1 = equip_paragraphs[:len(equip_paragraphs)//2 + len(equip_paragraphs)%2]
    col2 = equip_paragraphs[len(equip_paragraphs)//2 + len(equip_paragraphs)%2:]
    
    # Pad columns
    while len(col2) < len(col1):
        col2.append(Paragraph("", body_style))
        
    equip_table_data = [[c1, c2] for c1, c2 in zip(col1, col2)]
    t3 = Table(equip_table_data, colWidths=[250, 250])
    t3.setStyle(TableStyle([
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t3)
    story.append(Spacer(1, 10))
    
    # 5. Section: Alternate Diversion Routes
    story.append(Paragraph("4. RECOMMENDED BYPASS DIVERSIONS", section_heading))
    div_header = [Paragraph("Rank", bold_body_style), Paragraph("Bypass Route Corridor", bold_body_style), Paragraph("Distance", bold_body_style), Paragraph("ETA", bold_body_style)]
    div_rows = [div_header]
    
    for item in diversions:
        div_rows.append([
            Paragraph(str(item["rank"]), body_style),
            Paragraph(item["route_name"], body_style),
            Paragraph(f"{item['distance_km']} km", body_style),
            Paragraph(f"{item['eta_mins']} mins", body_style)
        ])
        
    t4 = Table(div_rows, colWidths=[40, 300, 80, 80])
    t4.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t4)
    story.append(Spacer(1, 15))
    
    # Signatures
    story.append(Paragraph("Action Sheet validated by Control Room Chief.", body_style))
    story.append(Spacer(1, 30))
    story.append(Paragraph("___________________________<br/>Operations Duty Commander Signature", body_style))
    
    doc.build(story)

def datetime_now_str():
    from datetime import datetime
    return datetime.now().strftime("%d %b %Y, %H:%M:%S")
