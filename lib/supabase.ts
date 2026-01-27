
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shkpradqqvixpkbakijr.supabase.co';
const supabaseKey = 'sb_publishable_-BPSRHXo5YzrhHR4WZpwpQ_7tsIEA0u';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ==============================================================================
 * SCRIPT SQL PARA CORREÇÃO DO ERRO PGRST204 (Execute no SQL Editor do Supabase)
 * ==============================================================================
 * 
 * -- 1. Adicionar colunas faltantes na tabela parashiot
 * ALTER TABLE public.parashiot ADD COLUMN IF NOT EXISTS key_verse text;
 * ALTER TABLE public.parashiot ADD COLUMN IF NOT EXISTS spiritual_phrase text;
 * ALTER TABLE public.parashiot ADD COLUMN IF NOT EXISTS summary text;
 * ALTER TABLE public.parashiot ADD COLUMN IF NOT EXISTS banner_url text;
 * ALTER TABLE public.parashiot ADD COLUMN IF NOT EXISTS name_he text;
 * 
 * -- 2. Forçar atualização do cache do esquema
 * NOTIFY pgrst, 'reload schema';
 * 
 * -- 3. Garantir que a tabela de perfis tenha a coluna de apoiador
 * ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supporter_tier text;
 */
