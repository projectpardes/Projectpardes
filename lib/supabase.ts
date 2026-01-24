
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shkpradqqvixpkbakijr.supabase.co';
const supabaseKey = 'sb_publishable_-BPSRHXo5YzrhHR4WZpwpQ_7tsIEA0u';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ==============================================================================
 * SCRIPT SQL PARA CORREÇÃO DEFINITIVA (Execute no SQL Editor do Supabase)
 * ==============================================================================
 * 
 * -- 1. Corrigir o erro PGRST204 (Coluna ausente ou Cache dessincronizado)
 * -- Adiciona a coluna se ela realmente não existir
 * ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supporter_tier text;
 * 
 * -- 2. FORÇAR RECARREGAMENTO DO CACHE DO ESQUEMA (Solução para PGRST204)
 * -- Execute este comando para que o Supabase reconheça a nova coluna imediatamente
 * NOTIFY pgrst, 'reload schema';
 * 
 * -- 3. Garantir consistência nas tabelas de questões (Erro 42703)
 * ALTER TABLE public.pshat_questions ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 1;
 * ALTER TABLE public.remez_questions ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 1;
 * ALTER TABLE public.drash_questions ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 1;
 * ALTER TABLE public.sod_questions ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 1;
 * ALTER TABLE public.nohide_questions ADD COLUMN IF NOT EXISTS difficulty_level integer DEFAULT 1;
 * 
 * -- 4. Garantir que as tabelas de méritos e figurinhas existam
 * ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS merits text[] DEFAULT '{}';
 * ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stickers text[] DEFAULT '{}';
 * ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS featured_merits text[] DEFAULT '{}';
 */
