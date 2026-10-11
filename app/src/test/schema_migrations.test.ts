import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Database Schema & RLS Migrations Specification Validation', () => {
  const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');

  it('contains all required versioned SQL migration files', () => {
    const files = fs.readdirSync(migrationsDir);
    expect(files).toContain('20261011000001_core_schema.sql');
    expect(files).toContain('20261011000002_row_level_security.sql');
    expect(files).toContain('20261011000003_public_views_and_rpcs.sql');
  });

  describe('20261011000001_core_schema.sql', () => {
    const coreSql = fs.readFileSync(
      path.join(migrationsDir, '20261011000001_core_schema.sql'),
      'utf8'
    );

    it('enforces private by default on profiles table', () => {
      expect(coreSql).toMatch(/visibility\s+TEXT\s+NOT\s+NULL\s+DEFAULT\s+'private'/i);
      expect(coreSql).toMatch(/discoverable\s+BOOLEAN\s+NOT\s+NULL\s+DEFAULT\s+FALSE/i);
    });

    it('enforces private by default on portfolios and projects tables', () => {
      // Portfolios default private
      expect(coreSql).toMatch(/portfolios[\s\S]*?DEFAULT\s+'private'/i);
      // Projects default private
      expect(coreSql).toMatch(/projects[\s\S]*?DEFAULT\s+'private'/i);
      // Profile sections default private
      expect(coreSql).toMatch(/profile_sections[\s\S]*?DEFAULT\s+'private'/i);
    });

    it('includes constraint that discovery requires public visibility', () => {
      expect(coreSql).toContain('CONSTRAINT discoverable_requires_public');
      expect(coreSql).toContain("discoverable = FALSE OR visibility = 'public'");
    });

    it('enforces ON DELETE CASCADE on user data tables', () => {
      expect(coreSql).toContain('REFERENCES auth.users(id) ON DELETE CASCADE');
      expect(coreSql).toContain('REFERENCES public.profiles(id) ON DELETE CASCADE');
    });

    it('defines automatic trigger for new users setting visibility to private', () => {
      expect(coreSql).toContain('handle_new_user()');
      expect(coreSql).toContain("'private'");
      expect(coreSql).toContain('FALSE');
      expect(coreSql).toContain('CREATE TRIGGER on_auth_user_created');
    });
  });

  describe('20261011000002_row_level_security.sql', () => {
    const rlsSql = fs.readFileSync(
      path.join(migrationsDir, '20261011000002_row_level_security.sql'),
      'utf8'
    );

    it('enables Row Level Security on every table', () => {
      const requiredTables = [
        'profiles',
        'profile_sections',
        'portfolios',
        'projects',
        'profile_skills',
        'education',
        'experience',
        'credentials',
        'external_links',
        'share_links',
        'reports',
        'audit_events',
      ];

      requiredTables.forEach((table) => {
        expect(rlsSql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      });
    });

    it('enforces owner-only mutation policies on profiles and content', () => {
      expect(rlsSql).toContain('auth.uid() = id');
      expect(rlsSql).toContain('auth.uid() = user_id');
      expect(rlsSql).toContain('auth.uid() = owner_id');
    });

    it('restricts share_links to the owner only', () => {
      expect(rlsSql).toContain('CREATE POLICY "share_links_owner_all"');
      expect(rlsSql).toContain('ON public.share_links FOR ALL');
      expect(rlsSql).toContain('auth.uid() = owner_id');
    });
  });

  describe('20261011000003_public_views_and_rpcs.sql', () => {
    const rpcSql = fs.readFileSync(
      path.join(migrationsDir, '20261011000003_public_views_and_rpcs.sql'),
      'utf8'
    );

    it('implements get_public_profile strictly filtering for public visibility', () => {
      expect(rpcSql).toContain('FUNCTION public.get_public_profile');
      expect(rpcSql).toContain("p.visibility = 'public'");
      // Ensure private email is omitted
      expect(rpcSql).not.toContain('email TEXT');
    });

    it('implements get_explore_profiles requiring discoverable = TRUE and visibility = public', () => {
      expect(rpcSql).toContain('FUNCTION public.get_explore_profiles');
      expect(rpcSql).toContain("p.visibility = 'public'");
      expect(rpcSql).toContain('p.discoverable = TRUE');
    });

    it('implements verify_share_token with hash check and revocation check', () => {
      expect(rpcSql).toContain('FUNCTION public.verify_share_token');
      expect(rpcSql).toContain('sl.token_hash = p_token_hash');
      expect(rpcSql).toContain('sl.revoked_at IS NULL');
      expect(rpcSql).toContain('(sl.expires_at IS NULL OR sl.expires_at > now())');
      expect(rpcSql).toContain('TRUE AS is_valid');
    });

    it('hardens RPC execution by revoking default PUBLIC grants', () => {
      expect(rpcSql).toContain('REVOKE EXECUTE ON FUNCTION public.get_public_profile(TEXT) FROM PUBLIC;');
      expect(rpcSql).toContain('REVOKE EXECUTE ON FUNCTION public.get_explore_profiles(INTEGER, INTEGER, TEXT) FROM PUBLIC;');
      expect(rpcSql).toContain('REVOKE EXECUTE ON FUNCTION public.verify_share_token(TEXT, TEXT) FROM PUBLIC;');
      expect(rpcSql).toContain('GRANT EXECUTE ON FUNCTION public.verify_share_token(TEXT, TEXT) TO anon, authenticated;');
    });
  });

  describe('Security Regression Audits across Migrations & setup_database.sql', () => {
    const coreSql = fs.readFileSync(path.join(migrationsDir, '20261011000001_core_schema.sql'), 'utf8');
    const rlsSql = fs.readFileSync(path.join(migrationsDir, '20261011000002_row_level_security.sql'), 'utf8');
    const rpcSql = fs.readFileSync(path.join(migrationsDir, '20261011000003_public_views_and_rpcs.sql'), 'utf8');
    const setupSql = fs.readFileSync(path.resolve(__dirname, '../../supabase/setup_database.sql'), 'utf8');

    it('prevents public portfolio SELECT from exposing content of private profiles', () => {
      // In migrations
      expect(rlsSql).toContain("profiles.id = portfolios.user_id AND profiles.visibility = 'public'");
      // In consolidated setup script
      expect(setupSql).toContain("profiles.id = portfolios.user_id AND profiles.visibility = 'public'");
    });

    it('prevents public project SELECT from exposing content of private profiles', () => {
      // In migrations
      expect(rlsSql).toContain("profiles.id = projects.owner_id AND profiles.visibility = 'public'");
      // In consolidated setup script
      expect(setupSql).toContain("profiles.id = projects.owner_id AND profiles.visibility = 'public'");
    });

    it('enforces report validation constraints (resource_type and reason length)', () => {
      // In migrations
      expect(coreSql).toContain("CHECK (resource_type IN ('profile', 'portfolio', 'project'))");
      expect(coreSql).toContain('char_length(reason) >= 10 AND char_length(reason) <= 2000');
      // In consolidated setup script
      expect(setupSql).toContain("CHECK (resource_type IN ('profile', 'portfolio', 'project'))");
      expect(setupSql).toContain('char_length(reason) >= 10 AND char_length(reason) <= 2000');
    });

    it('enforces schema- and table-specific constraint checks with existing data safety', () => {
      // Verify schema and table qualification in catalog query
      expect(coreSql).toContain("n.nspname = 'public'");
      expect(coreSql).toContain("t.relname = 'reports'");
      expect(coreSql).toContain("c.conname = 'valid_report_resource_type'");
      expect(coreSql).toContain("c.conname = 'valid_report_reason_length'");
      expect(coreSql).toContain('v_invalid_resource_type_count');
      expect(coreSql).toContain('v_invalid_reason_count');

      expect(setupSql).toContain("n.nspname = 'public'");
      expect(setupSql).toContain("t.relname = 'reports'");
      expect(setupSql).toContain("c.conname = 'valid_report_resource_type'");
      expect(setupSql).toContain("c.conname = 'valid_report_reason_length'");
      expect(setupSql).toContain('v_invalid_resource_type_count');
      expect(setupSql).toContain('v_invalid_reason_count');
    });

    it('creates handle_new_user BEFORE calling its REVOKE statements in both migrations and setup script', () => {
      const coreCreateIdx = coreSql.indexOf('CREATE OR REPLACE FUNCTION public.handle_new_user()');
      const coreRevokeIdx = coreSql.indexOf('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;');
      expect(coreCreateIdx).toBeGreaterThan(-1);
      expect(coreRevokeIdx).toBeGreaterThan(coreCreateIdx);

      const setupCreateIdx = setupSql.indexOf('CREATE OR REPLACE FUNCTION public.handle_new_user()');
      const setupRevokeIdx = setupSql.indexOf('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;');
      expect(setupCreateIdx).toBeGreaterThan(-1);
      expect(setupRevokeIdx).toBeGreaterThan(setupCreateIdx);
    });

    it('ensures all policies in migration 2 and setup_database.sql are idempotent with DROP POLICY IF EXISTS', () => {
      const tablesWithPolicies = [
        'profiles',
        'profile_sections',
        'portfolios',
        'projects',
        'profile_skills',
        'education',
        'experience',
        'credentials',
        'external_links',
        'share_links',
        'reports',
        'audit_events',
      ];

      tablesWithPolicies.forEach((table) => {
        expect(rlsSql).toContain(`DROP POLICY IF EXISTS`);
        expect(setupSql).toContain(`DROP POLICY IF EXISTS`);
        expect(rlsSql).toContain(`ON public.${table}`);
        expect(setupSql).toContain(`ON public.${table}`);
      });
    });

    it('hardens handle_new_user against direct execution by untrusted roles', () => {
      // In migrations
      expect(coreSql).toContain('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;');
      expect(coreSql).toContain('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;');
      // In consolidated setup script
      expect(setupSql).toContain('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;');
      expect(setupSql).toContain('REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;');
    });

    it('ensures verify_share_token filters expired/revoked links in WHERE clause avoiding metadata leakage', () => {
      // In migrations
      expect(rpcSql).toMatch(/WHERE[\s\S]*?sl\.revoked_at IS NULL[\s\S]*?sl\.expires_at > now\(\)/);
      // In consolidated setup script
      expect(setupSql).toMatch(/WHERE[\s\S]*?sl\.revoked_at IS NULL[\s\S]*?sl\.expires_at > now\(\)/);
    });
  });
});

