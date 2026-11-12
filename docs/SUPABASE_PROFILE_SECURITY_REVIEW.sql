-- REVISÃO OBRIGATÓRIA ANTES DE APLICAR AO BANCO COMPARTILHADO.
-- NÃO executado na produção nem na Preview.
-- Diagnóstico: a política profile_update_own limita a linha, mas não protege a coluna role.
-- Além disso, profile_insert_own permite um usuário atribuir uma role privilegiada a si mesmo.
-- A API /api/auth/profile cria profiles com role=buyer usando service_role, depois de validar o JWT.
-- Role de vendedor/admin continua restrita à criação administrativa.

BEGIN;

-- Os clientes não precisam de privilégios diretos de INSERT ou UPDATE de role.
-- A remoção de privilégios de tabela é essencial: uma permissão UPDATE geral
-- sobrepõe GRANT UPDATE específico por coluna.
REVOKE ALL PRIVILEGES ON TABLE public.profiles FROM anon, authenticated;

-- O Supabase autenticado pode consultar seu próprio perfil com a RLS existente.
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Permitir edição somente de dados de contato; NÃO conceder UPDATE de role nem id.
GRANT UPDATE (full_name, phone) ON TABLE public.profiles TO authenticated;

-- A criação de perfil passa a ocorrer somente no backend confiável.
DROP POLICY IF EXISTS profile_insert_own ON public.profiles;

COMMIT;

-- Aplicação exige autorização separada porque afeta o banco utilizado pela produção.
-- Antes de executar, revisar todos os outros consumidores da tabela profiles
-- e validar com uma conta buyer e uma seller em ambiente de homologação.
