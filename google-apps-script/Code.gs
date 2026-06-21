/**
 * Wedding RSVP → Google Sheets
 *
 * Setup:
 * 1. Create a Google Sheet with tabs: RSVPs, Guests, Tables
 * 2. On RSVPs row 1, add headers:
 *    Timestamp | Full name | Attendance | Guest count | Guest name | Dietary | Song | Notes
 * 3. Extensions → Apps Script → paste this file → Save
 * 4. Deploy → New deployment → Web app
 *    Execute as: Me | Who has access: Anyone
 * 5. Copy the deployment URL into rsvp-config.js (RSVP_SCRIPT_URL)
 */

var SHEET_NAME = 'RSVPs';

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    appendRsvpRow_(payload);
    return jsonResponse_(200, { ok: true });
  } catch (err) {
    return jsonResponse_(500, { ok: false, error: String(err.message || err) });
  }
}

function doGet() {
  return jsonResponse_(200, { ok: true, message: 'Wedding RSVP endpoint is running.' });
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body');
  }

  var data = JSON.parse(e.postData.contents);
  return {
    fullName: trim_(data.fullName),
    attendance: trim_(data.attendance),
    guestCount: trim_(data.guestCount),
    guestName: trim_(data.guestName),
    dietary: trim_(data.dietary),
    song: trim_(data.song),
    notes: trim_(data.notes)
  };
}

function appendRsvpRow_(data) {
  if (!data.fullName) throw new Error('Full name is required');
  if (!data.attendance) throw new Error('Attendance is required');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" not found');
  }

  sheet.appendRow([
    new Date(),
    data.fullName,
    data.attendance,
    data.guestCount || '',
    data.guestName || '',
    data.dietary || '',
    data.song || '',
    data.notes || ''
  ]);
}

function trim_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function jsonResponse_(status, body) {
  var output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
