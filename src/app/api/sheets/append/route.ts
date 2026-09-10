import { NextRequest, NextResponse } from 'next/server'
import { getSheets, getSpreadsheetId } from '@/lib/sheetsServer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sheet, row } = body

    if (!sheet || !row) {
      return NextResponse.json({ error: 'Missing sheet or row parameter' }, { status: 400 })
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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheet}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error appending row:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to append row' },
      { status: 500 },
    )
  }
}
