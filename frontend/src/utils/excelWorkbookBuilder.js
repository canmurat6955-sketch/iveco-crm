/**
 * Pure-JS OpenXML (.xlsx) Multi-Sheet Workbook Builder
 * Generates a genuine, styled Microsoft Excel (.xlsx) file with:
 * - Multiple worksheets (tabs)
 * - Exact column widths (never squished / never ########)
 * - Explicit inline string cells (phone numbers NEVER become 5,52E+09)
 * - Styled title banners, colored headers, zebra/highlight rows, borders, and frozen headers
 */

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    // Remove invalid XML control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function colIndexToLetter(index0) {
  let temp = index0;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

// ── CRC32 & Uncompressed ZIP Archive Builder ───────────────────────────────
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const fileEntries = files.map(f => {
    const nameBytes = encoder.encode(f.path);
    const dataBytes = typeof f.content === 'string' ? encoder.encode(f.content) : f.content;
    const crc = crc32(dataBytes);
    return { nameBytes, dataBytes, crc, offset: 0 };
  });

  let offset = 0;
  const localParts = [];
  const centralParts = [];

  for (const entry of fileEntries) {
    entry.offset = offset;
    const localHeader = new Uint8Array(30 + entry.nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Local file header signature
    lv.setUint16(4, 20, true);         // Version needed to extract (2.0)
    lv.setUint16(6, 0x0800, true);     // General purpose bit flag (UTF-8)
    lv.setUint16(8, 0, true);          // Compression method: 0 (STORE)
    lv.setUint16(10, 0x4000, true);    // Last mod file time
    lv.setUint16(12, 0x56a0, true);    // Last mod file date
    lv.setUint32(14, entry.crc, true); // CRC-32
    lv.setUint32(18, entry.dataBytes.length, true); // Compressed size
    lv.setUint32(22, entry.dataBytes.length, true); // Uncompressed size
    lv.setUint16(26, entry.nameBytes.length, true); // File name length
    lv.setUint16(28, 0, true);         // Extra field length
    localHeader.set(entry.nameBytes, 30);

    localParts.push(localHeader, entry.dataBytes);
    offset += localHeader.length + entry.dataBytes.length;

    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Central directory signature
    cv.setUint16(4, 20, true);         // Version made by
    cv.setUint16(6, 20, true);         // Version needed
    cv.setUint16(8, 0x0800, true);     // UTF-8 flag
    cv.setUint16(10, 0, true);         // Compression method: STORE
    cv.setUint16(12, 0x4000, true);    // Mod time
    cv.setUint16(14, 0x56a0, true);    // Mod date
    cv.setUint32(16, entry.crc, true); // CRC-32
    cv.setUint32(20, entry.dataBytes.length, true);
    cv.setUint32(24, entry.dataBytes.length, true);
    cv.setUint16(28, entry.nameBytes.length, true);
    cv.setUint16(30, 0, true);         // Extra field length
    cv.setUint16(32, 0, true);         // File comment length
    cv.setUint16(34, 0, true);         // Disk number start
    cv.setUint16(36, 0, true);         // Internal file attributes
    cv.setUint32(38, 0, true);         // External file attributes
    cv.setUint32(42, entry.offset, true); // Relative offset of local header
    centralHeader.set(entry.nameBytes, 46);

    centralParts.push(centralHeader);
  }

  const centralSize = centralParts.reduce((acc, arr) => acc + arr.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // End of central directory signature
  ev.setUint16(4, 0, true);          // Number of this disk
  ev.setUint16(6, 0, true);          // Disk where central directory starts
  ev.setUint16(8, fileEntries.length, true);  // Number of central directory records on this disk
  ev.setUint16(10, fileEntries.length, true); // Total number of central directory records
  ev.setUint32(12, centralSize, true);        // Size of central directory
  ev.setUint32(16, offset, true);             // Offset of start of central directory
  ev.setUint16(20, 0, true);                  // Comment length

  return new Blob([...localParts, ...centralParts, eocd], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// ── Stylesheet XML (xl/styles.xml) ─────────────────────────────────────────
// Style IDs (s attribute on <c>):
//  0 = Default
//  1 = Title Banner (Dark Navy #0F172A, White 13pt Bold)
//  2 = Subtitle / Info Row (Slate #F1F5F9, Dark Gray 10pt Italic/Bold)
//  3 = Table Header (Corporate Blue #1E3A8A, White 11pt Bold, Wrapped)
//  4 = Standard Data Cell (White, Bordered, Wrapped, Vertical Center)
//  5 = Bold Customer Name Cell (White, Bold Dark #0F172A, Bordered)
//  6 = Phone Cell (Soft Green #DCFCE7, Bold Dark Green #166534, Centered, Text @)
//  7 = Vehicle Model Cell (White, Bold Blue #1D4ED8, Bordered, Wrapped)
//  8 = Financial / Credit Cell (Soft Amber #FEF3C7, Bold Amber #92400E, Bordered, Wrapped)
//  9 = Hot Priority Badge Cell (Soft Red/Orange #FFEDD5, Bold #C2410C, Centered)
// 10 = Normal Priority Badge Cell (Soft Green #F0FDF4, Bold #15803D, Centered)
// 11 = Centered Metric / Date Cell (White, Centered, Bordered)
// 12 = Section Header (Dark Teal #0F766E, White 11pt Bold)
// 13 = Zebra Data Cell (Light Gray #F8FAFC, Bordered, Wrapped)
function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="9">
    <font><sz val="10"/><color rgb="FF1E293B"/><name val="Calibri"/></font>
    <font><b/><sz val="13"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>
    <font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10.5"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="10.5"/><color rgb="FF166534"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF1D4ED8"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF92400E"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFC2410C"/><name val="Calibri"/></font>
  </fonts>
  <fills count="10">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFFFFF"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFDCFCE7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFEF3C7"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFEDD5"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="14">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="49" fontId="0" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="49" fontId="4" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="49" fontId="5" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="49" fontId="6" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="49" fontId="7" fillId="7" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
    <xf numFmtId="49" fontId="8" fillId="8" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="49" fontId="5" fillId="6" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="49" fontId="0" fillId="5" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="center" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="3" fillId="9" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="49" fontId="0" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center" wrapText="1"/>
    </xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

/**
 * Builds an individual worksheet XML string.
 * @param {Object} sheetDef
 * @param {number[]} sheetDef.colWidths - Array of column widths (in Excel character units)
 * @param {Array<{height?: number, cells: Array<{v: string|number, s?: number, t?: 'str'|'num'}>}>} sheetDef.rows
 * @param {string[]} [sheetDef.merges] - Array of merge refs like "A1:H1"
 * @param {number} [sheetDef.freezeRow] - 1-based row number to freeze above (e.g. 3 freezes rows 1..3)
 * @param {string} [sheetDef.autoFilterRef] - e.g. "A3:H40"
 */
function buildWorksheetXml(sheetDef) {
  const colsXml = (sheetDef.colWidths || [])
    .map((w, idx) => `<col min="${idx + 1}" max="${idx + 1}" width="${w}" customWidth="1"/>`)
    .join('');

  const sheetViewsXml = sheetDef.freezeRow
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${sheetDef.freezeRow}" topLeftCell="A${sheetDef.freezeRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : `<sheetViews><sheetView workbookViewId="0"/></sheetViews>`;

  const rowsXml = (sheetDef.rows || [])
    .map((rowObj, rIdx) => {
      const rNum = rIdx + 1;
      const htAttr = rowObj.height ? ` ht="${rowObj.height}" customHeight="1"` : '';
      const cellsXml = (rowObj.cells || [])
        .map((cell, cIdx) => {
          if (!cell || cell.v === undefined || cell.v === null) return '';
          const ref = `${colIndexToLetter(cIdx)}${rNum}`;
          const styleAttr = cell.s !== undefined ? ` s="${cell.s}"` : '';
          if (cell.t === 'num' && typeof cell.v === 'number' && !Number.isNaN(cell.v)) {
            return `<c r="${ref}"${styleAttr}><v>${cell.v}</v></c>`;
          }
          return `<c r="${ref}"${styleAttr} t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell.v)}</t></is></c>`;
        })
        .join('');
      return `<row r="${rNum}"${htAttr}>${cellsXml}</row>`;
    })
    .join('');

  const mergesXml =
    sheetDef.merges && sheetDef.merges.length > 0
      ? `<mergeCells count="${sheetDef.merges.length}">${sheetDef.merges
          .map(m => `<mergeCell ref="${m}"/>`)
          .join('')}</mergeCells>`
      : '';

  const autoFilterXml = sheetDef.autoFilterRef
    ? `<autoFilter ref="${sheetDef.autoFilterRef}"/>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  ${sheetViewsXml}
  <cols>${colsXml}</cols>
  <sheetData>${rowsXml}</sheetData>
  ${autoFilterXml}
  ${mergesXml}
</worksheet>`;
}

/**
 * Generates and downloads a multi-sheet .xlsx file.
 * @param {string} filename - e.g. "ERC_Niyet_Radari_Raporu.xlsx"
 * @param {Array<{name: string, colWidths: number[], rows: Array, merges?: string[], freezeRow?: number, autoFilterRef?: string}>} sheets
 */
export function downloadStyledWorkbook(filename, sheets) {
  const files = [];

  // 1. [Content_Types].xml
  const sheetOverrides = sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('');

  files.push({
    path: '[Content_Types].xml',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetOverrides}
</Types>`
  });

  // 2. _rels/.rels
  files.push({
    path: '_rels/.rels',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  });

  // 3. xl/workbook.xml
  const sheetsNodes = sheets
    .map((s, i) => {
      const safeName = String(s.name || `Sayfa ${i + 1}`)
        .replace(/[:\\/?*\[\]]/g, ' ')
        .trim()
        .slice(0, 31);
      return `<sheet name="${escapeXml(safeName)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`;
    })
    .join('');

  files.push({
    path: 'xl/workbook.xml',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetsNodes}</sheets>
</workbook>`
  });

  // 4. xl/_rels/workbook.xml.rels
  const sheetRels = sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
    )
    .join('');

  files.push({
    path: 'xl/_rels/workbook.xml.rels',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRels}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  });

  // 5. xl/styles.xml
  files.push({
    path: 'xl/styles.xml',
    content: buildStylesXml()
  });

  // 6. xl/worksheets/sheetN.xml
  sheets.forEach((s, i) => {
    files.push({
      path: `xl/worksheets/sheet${i + 1}.xml`,
      content: buildWorksheetXml(s)
    });
  });

  const blob = createZipBlob(files);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
