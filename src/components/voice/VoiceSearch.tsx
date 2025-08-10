'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { defaultAIConfig, createAIService } from '@/lib/ai-client'

interface VoiceSearchResult {
  product?: string
  quantity?: number
  action?: 'add' | 'remove' | 'search'
  confidence: number
  rawText: string
}

interface VoiceSearchProps {
  onResult: (result: VoiceSearchResult) => void
  onListeningChange?: (isListening: boolean) => void
}

export default function VoiceSearch({ onResult, onListeningChange }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [results, setResults] = useState<VoiceSearchResult[]>([])
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setTranscript(transcript)
          processVoiceCommand(transcript)
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          toast.error('Voice recognition error. Please try again.')
          stopListening()
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          onListeningChange?.(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onListeningChange])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      onListeningChange?.(true)
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true)
    try {
      // Get AI config from localStorage or use default
      let aiConfig = defaultAIConfig
      try {
        const savedConfig = localStorage.getItem('aiConfig')
        if (savedConfig) {
          aiConfig = JSON.parse(savedConfig)
        }
      } catch (error) {
        console.warn('Failed to load AI config from localStorage:', error)
      }

      // Use client-side AI service
      const aiService = createAIService(aiConfig)
      const result = await aiService.processVoiceCommand(text)
      
      const voiceResult: VoiceSearchResult = {
        ...result,
        rawText: text,
      }

      setResults(prev => [voiceResult, ...prev].slice(0, 5)) // Keep last 5 results
      onResult(voiceResult)
      
      toast.success('Voice command processed successfully')
    } catch (error) {
      console.error('Error processing voice command:', error)
      toast.error('Failed to process voice command')
      
      // Fallback processing
      const fallbackResult = fallbackVoiceProcessing(text)
      setResults(prev => [fallbackResult, ...prev].slice(0, 5))
      onResult(fallbackResult)
    } finally {
      setIsProcessing(false)
    }
  }

  const fallbackVoiceProcessing = (text: string): VoiceSearchResult => {
    const lowerText = text.toLowerCase()
    
    // Extract quantity
    const quantityMatch = lowerText.match(/(\d+)/)
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1
    
    // Extract action
    let action: 'add' | 'remove' | 'search' = 'add'
    if (lowerText.includes('remove') || lowerText.includes('delete')) {
      action = 'remove'
    } else if (lowerText.includes('search') || lowerText.includes('find')) {
      action = 'search'
    }
    
    // Extract product name (remove action words and numbers)
    let product = text
      .replace(/add|remove|delete|search|find/gi, '')
      .replace(/\d+/g, '')
      .replace(/^\s+|\s+$/g, '')
    
    return {
      product: product || 'unknown',
      quantity,
      action,
      confidence: 0.6, // Lower confidence for fallback
      rawText: text,
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Search
              </>
            )}
          </Button>
          
          {results.length > 0 && (
            <Button onClick={clearResults} variant="outline" size="sm">
              Clear
            </Button>
          )}
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </div>
        )}

        {transcript && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Transcript:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Results:</p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {results.map((result, index) => (
                <div key={index} className="p-2 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{result.action}</Badge>
                    <Badge variant="secondary">
                      {Math.round(result.confidence * 100)}%
                    </Badge>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{result.quantity}x</span> {result.product}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    "{result.rawText}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!recognitionRef.current && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">
              Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}