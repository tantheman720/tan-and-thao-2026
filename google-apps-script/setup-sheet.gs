/**
 * Run once from Apps Script editor: Run → initializeSpreadsheet
 * Creates RSVPs, Guests, and Tables tabs with column headers.
 */
function initializeSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  ensureSheet_(ss, 'RSVPs', [
    'Timestamp',
    'Full name',
    'Attendance',
    'Guest count',
    'Guest name',
    'Dietary',
    'Song',
    'Notes'
  ]);

  ensureSheet_(ss, 'Guests', [
    'Name',
    'Primary RSVP',
    'Table #',
    'Social group',
    'Dietary',
    'Vegetarian? (Y/N)'
  ]);

  ensureSheet_(ss, 'Tables', [
    'Table #',
    'Group name',
    'Guest names',
    'Dietary flags'
  ]);
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}
