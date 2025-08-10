import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { lang: string } }
) {
  try {
    const { lang } = params
    
    // Validate language code
    const supportedLanguages = ['en', 'hi', 'mr', 'ta', 'te', 'gu', 'kn', 'ml', 'bn', 'pa']
    
    if (!supportedLanguages.includes(lang)) {
      return NextResponse.json(
        { error: 'Language not supported' },
        { status: 400 }
      )
    }

    // Read the translation file
    const filePath = join(process.cwd(), 'src', 'locales', `${lang}.json`)
    
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Translation file not found' },
        { status: 404 }
      )
    }

    const fileContent = readFileSync(filePath, 'utf8')
    const translations = JSON.parse(fileContent)

    return NextResponse.json(translations)
  } catch (error) {
    console.error('Error loading translations:', error)
    return NextResponse.json(
      { error: 'Failed to load translations' },
      { status: 500 }
    )
  }
}