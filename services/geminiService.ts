// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import MarvelRivalsAPI, { Hero } from './marvelRivalsApi';
import FavoritesService from './favoritesService';

// 🔑 API KEY CONFIGURADA
// Obtén una gratis en: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyAGZaBt3q4UgnhosgSiI7skyrxWMhGZuc4';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIComparison {
  hero1Pros: string[];
  hero1Cons: string[];
  hero2Pros: string[];
  hero2Cons: string[];
  verdict: string;
  recommendation: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private heroes: Hero[] = [];
  private chatHistory: ChatMessage[] = [];
  private lastRequestTime: number = 0;
  private readonly MIN_REQUEST_INTERVAL = 8000; // 8 segundos entre requests (más conservador)
  private requestCount: number = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 10;