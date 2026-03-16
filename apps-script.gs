const SALON_EMAIL = 'happy.pups.petsalon@gmail.com';
const SHEET_NAME  = 'Sheet1';

function doPost(e) {
  try {
    var raw = e.postData.contents;
    var data;
    try {
      data = JSON.parse(raw);
    } catch(ex) {
      var jsonStr = e.parameter.data || raw;
      data = JSON.parse(jsonStr);
    }
    appendToSheet(data);
    sendEmailNotification(data);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', service: 'Happy Pups Lead Capture' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function appendToSheet(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Owner Name', 'Dog Name', 'Email',
      'Phone', 'Breed', 'Service', 'Preferred Date', 'Notes', 'Source'
    ]);
    var header = sheet.getRange(1, 1, 1, 10);
    header.setBackground('#1A3D2B').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    data.timestamp     || new Date().toLocaleString(),
    data.ownerName     || '',
    data.dogName       || '',
    data.email         || '',
    data.phone         || '',
    data.breed         || '',
    data.service       || '',
    data.preferredDate || '',
    data.notes         || '',
    data.source        || 'Landing Page'
  ]);
}

function sendEmailNotification(data) {
  var subject = 'New Appointment - ' + (data.dogName || 'New Pup') + ' (' + (data.ownerName || 'Unknown') + ')';

  var htmlBody = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f7f2;border-radius:8px;overflow:hidden;">'
    + '<div style="background:#1A3D2B;padding:28px 32px;text-align:center;">'
    + '<h1 style="color:#C4922A;margin:0;font-size:24px;">Happy Pups Pet Salon</h1>'
    + '<p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:14px;text-transform:uppercase;letter-spacing:1px;">New Appointment Request</p>'
    + '</div>'
    + '<div style="padding:32px;">'
    + '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;width:140px;">Owner Name</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;">' + (data.ownerName || '-') + '</td></tr>'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;">Dog Name</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;">' + (data.dogName || '-') + '</td></tr>'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;"><a href="mailto:' + data.email + '" style="color:#C4922A;">' + (data.email || '-') + '</a></td></tr>'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;"><a href="tel:' + data.phone + '" style="color:#C4922A;">' + (data.phone || '-') + '</a></td></tr>'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;">Breed</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;">' + (data.breed || '-') + '</td></tr>'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;">Service</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;"><span style="background:#1A3D2B;color:#C4922A;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:700;">' + (data.service || '-') + '</span></td></tr>'
    + '<tr><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;color:#888;font-weight:700;">Date</td><td style="padding:10px 0;border-bottom:1px solid #e8ddd0;font-weight:600;color:#1A3D2B;">' + (data.preferredDate || '-') + '</td></tr>'
    + (data.notes ? '<tr><td style="padding:10px 0;color:#888;font-weight:700;vertical-align:top;">Notes</td><td style="padding:10px 0;color:#4a4a4a;font-style:italic;">' + data.notes + '</td></tr>' : '')
    + '</table>'
    + '<div style="margin-top:28px;padding:20px;background:#fff;border-left:4px solid #C4922A;">'
    + '<p style="margin:0;font-size:13px;color:#4a4a4a;">Submitted: <strong>' + (data.timestamp || new Date().toLocaleString()) + '</strong></p>'
    + '</div>'
    + '<div style="margin-top:24px;text-align:center;">'
    + '<a href="mailto:' + data.email + '?subject=Your Appointment at Happy Pups Pet Salon" style="display:inline-block;background:#1A3D2B;color:#fff;padding:12px 28px;border-radius:4px;font-size:13px;font-weight:700;text-transform:uppercase;text-decoration:none;">Reply to Client</a>'
    + '</div>'
    + '</div>'
    + '<div style="background:#0D1F16;padding:20px 32px;text-align:center;">'
    + '<p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;">Happy Pups Pet Salon - Aventura, FL 33160</p>'
    + '</div>'
    + '</div>';

  GmailApp.sendEmail(SALON_EMAIL, subject, '', { htmlBody: htmlBody });
}
