import { NextRequest, NextResponse } from 'next/server'
import { getSheets, getSpreadsheetId } from '@/lib/sheetsServer'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { sheet, rowIndex, row } = body

    if (!sheet || rowIndex === undefined || !row) {
      return NextResponse.json({ error: 'Missing sheet, rowIndex, or row parameter' }, { status: 400 })
    }

    const sheets = getSheets()
    const spreadsheetId = getSpreadsheetId()

    // Get headers to ensure correct order
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheet}!A:Z`,
    })

    const rows = dataResponse.data.values || []
    if (rows.length === 0) {
      return NextResponse.json({ error: `Sheet ${sheet} is empty` }, { status: 400 })
    }

    const headers = rows[0]
    const values = headers.map((header: string) => row[header] || '')

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheet}!A${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating row:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update row' },
      { status: 500 },
    )
  }
}
