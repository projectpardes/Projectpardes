
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shkpradqqvixpkbakijr.supabase.co';
const supabaseKey = 'sb_publishable_-BPSRHXo5YzrhHR4WZpwpQ_7tsIEA0u';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ==============================================================================
 * SCRIPT SQL PARA O SUPABASE (Cópia Direta)
 * ==============================================================================
 * 
 * -- 1. Habilitar suporte a UUIDs
 * CREATE EXTENSION IF NOT EXISTS "pgcrypto";
 * 
 * -- 2. Criar as 4 tabelas faltantes (A nohide_questions já está funcional)
 * 
 * -- Tabela PSHAT
 * CREATE TABLE IF NOT EXISTS public.pshat_questions (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     created_at timestamptz DEFAULT now(),
 *     text text NOT NULL,
 *     options jsonb NOT NULL,
 *     correct_answer int NOT NULL,
 *     explanation text,
 *     xp_reward int DEFAULT 100,
 *     difficulty int DEFAULT 1
 * );
 * 
 * -- Tabela REMEZ
 * CREATE TABLE IF NOT EXISTS public.remez_questions (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     created_at timestamptz DEFAULT now(),
 *     text text NOT NULL,
 *     options jsonb NOT NULL,
 *     correct_answer int NOT NULL,
 *     explanation text,
 *     xp_reward int DEFAULT 100,
 *     difficulty int DEFAULT 1
 * );
 * 
 * -- Tabela DRASH
 * CREATE TABLE IF NOT EXISTS public.drash_questions (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     created_at timestamptz DEFAULT now(),
 *     text text NOT NULL,
 *     options jsonb NOT NULL,
 *     correct_answer int NOT NULL,
 *     explanation text,
 *     xp_reward int DEFAULT 100,
 *     difficulty int DEFAULT 1
 * );
 * 
 * -- Tabela SOD
 * CREATE TABLE IF NOT EXISTS public.sod_questions (
 *     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *     created_at timestamptz DEFAULT now(),
 *     text text NOT NULL,
 *     options jsonb NOT NULL,
 *     correct_answer int NOT NULL,
 *     explanation text,
 *     xp_reward int DEFAULT 100,
 *     difficulty int DEFAULT 1
 * );
 * 
 * -- 3. Habilitar RLS (Segurança) em todas as novas tabelas
 * ALTER TABLE public.pshat_questions ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.remez_questions ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.drash_questions ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.sod_questions ENABLE ROW LEVEL SECURITY;
 * 
 * -- 4. Criar Políticas de Acesso Total
 * 
 * DROP POLICY IF EXISTS "Acesso Total" ON public.pshat_questions;
 * CREATE POLICY "Acesso Total" ON public.pshat_questions FOR ALL USING (true) WITH CHECK (true);
 * 
 * DROP POLICY IF EXISTS "Acesso Total" ON public.remez_questions;
 * CREATE POLICY "Acesso Total" ON public.remez_questions FOR ALL USING (true) WITH CHECK (true);
 * 
 * DROP POLICY IF EXISTS "Acesso Total" ON public.drash_questions;
 * CREATE POLICY "Acesso Total" ON public.drash_questions FOR ALL USING (true) WITH CHECK (true);
 * 
 * DROP POLICY IF EXISTS "Acesso Total" ON public.sod_questions;
 * CREATE POLICY "Acesso Total" ON public.sod_questions FOR ALL USING (true) WITH CHECK (true);
 */
