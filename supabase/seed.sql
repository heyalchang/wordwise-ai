-- WordWise AI Seed Data
-- This file runs after migrations to populate test data
-- Creates local test users and sample documents for development

DO $$
DECLARE
    test_user_1 UUID := '11111111-1111-1111-1111-111111111111';
    test_user_2 UUID := '22222222-2222-2222-2222-222222222222';
    test_user_3 UUID := '33333333-3333-3333-3333-333333333333';
BEGIN
    -- Create test users in auth.users (bypassing RLS for seeding)
    -- Note: In production, users are created through Supabase Auth
    -- These are for local development testing only
    
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000000',
        test_user_1,
        'authenticated',
        'authenticated',
        'test1@wordwise.ai',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "Test User 1", "avatar_url": ""}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        test_user_2,
        'authenticated',
        'authenticated',
        'test2@wordwise.ai',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "Test User 2", "avatar_url": ""}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        test_user_3,
        'authenticated',
        'authenticated',
        'test3@wordwise.ai',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"display_name": "ESL Student", "avatar_url": ""}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Create corresponding profiles
    INSERT INTO profiles (id, display_name, locale, writing_goals) VALUES 
    (test_user_1, 'Test User 1', 'en-US', '["Academic Writing", "Grammar Improvement"]'),
    (test_user_2, 'Test User 2', 'en-US', '["Business Writing", "Clarity"]'),
    (test_user_3, 'ESL Student', 'es-US', '["Academic Essays", "Vocabulary", "Grammar"]')
    ON CONFLICT (id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        writing_goals = EXCLUDED.writing_goals;

    -- Test Documents with Various Content Types
    
    -- Document 1: Short text with grammar errors (for basic grammar testing)
    INSERT INTO documents (id, owner, title, content, readability) VALUES (
      '00000000-0000-0000-0000-000000000001',
      test_user_1,
      'Grammar Test Document',
      '<p>This is a sample text for testing <strong>grammar</strong> checking. There are some erors in this sentence that need to be fixed. The writing could be more clear and concise. Its important to test how the system handle different types of mistakes.</p><p>This sentence have subject-verb disagreement. The student''s essay was wrote in passive voice. Me and my friend went to the store yesterday.</p>',
      '{"flesch_score": 65.2, "passive_pct": 33.3}'
    ) ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      readability = EXCLUDED.readability,
      updated_at = NOW();

    -- Document 2: Medium text with readability testing content
    INSERT INTO documents (id, owner, title, content, readability) VALUES (
      '00000000-0000-0000-0000-000000000002',
      test_user_1,
      'Readability Analysis Test',
      '<p>The quick brown fox jumps over the lazy dog. This sentence is designed to be simple and easy to read. Short sentences help improve readability scores significantly.</p><p><em>However</em>, when we start incorporating more complex sentence structures with multiple clauses, dependent phrases, and sophisticated vocabulary, the readability score begins to decrease substantially, making the text more challenging for readers to comprehend efficiently.</p><p>Passive voice constructions are frequently used in academic writing. The research was conducted by the team. The results were analyzed by experts. These patterns were identified by the software.</p><p>In contrast, active voice makes writing more direct and engaging. The team conducted research. Experts analyzed the results. The software identified patterns.</p>',
      '{"flesch_score": 45.8, "passive_pct": 50.0}'
    ) ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      readability = EXCLUDED.readability,
      updated_at = NOW();

    -- Document 3: Long document for performance testing
    INSERT INTO documents (id, owner, title, content, readability) VALUES (
      '00000000-0000-0000-0000-000000000003',
      test_user_2,
      'Performance Testing Essay - Climate Change',
      '<h2>Climate Change: A Global Challenge</h2><p>Climate change represents one of the most significant challenges facing humanity in the twenty-first century. The scientific consensus is clear: human activities, particularly the emission of greenhouse gases, are driving unprecedented changes in Earth''s climate system.</p><p><strong>The Science Behind Climate Change</strong></p><p>The greenhouse effect is a natural process that has kept Earth habitable for millions of years. However, human activities have dramatically increased the concentration of greenhouse gases in the atmosphere. Carbon dioxide levels have risen from approximately 280 parts per million before the Industrial Revolution to over 420 parts per million today.</p><p>This increase in greenhouse gas concentrations leads to enhanced warming of the planet''s surface. The evidence for this warming is overwhelming and includes rising global temperatures, melting ice sheets, rising sea levels, and changing precipitation patterns.</p><p><em>Impacts on Ecosystems and Human Society</em></p><p>Climate change affects virtually every aspect of the natural world and human society. Ecosystems are being disrupted as species struggle to adapt to rapidly changing conditions. Many plant and animal species are shifting their ranges toward the poles or to higher elevations in search of suitable habitats.</p><p>Agricultural systems face significant challenges as changing temperature and precipitation patterns affect crop yields. Some regions may benefit from longer growing seasons, while others may experience increased drought, flooding, or extreme weather events that damage crops.</p><p>Human health is also at risk from climate change. Heat waves can cause heat-related illness and death, particularly among vulnerable populations. Changes in temperature and precipitation can also affect the distribution of vector-borne diseases such as malaria and dengue fever.</p><p><strong>Mitigation and Adaptation Strategies</strong></p><p>Addressing climate change requires both mitigation efforts to reduce greenhouse gas emissions and adaptation strategies to cope with the changes that are already occurring or are inevitable.</p><p>Mitigation strategies include transitioning to renewable energy sources, improving energy efficiency, protecting and restoring forests, and developing carbon capture and storage technologies. These efforts require coordinated action at local, national, and international levels.</p><p>Adaptation involves preparing for and adjusting to the effects of climate change. This might include building sea walls to protect coastal communities, developing drought-resistant crops, or modifying building codes to account for extreme weather events.</p><p>The challenges posed by climate change are complex and multifaceted, requiring innovative solutions and unprecedented cooperation among nations, communities, and individuals. The decisions we make today will determine the severity of climate impacts for future generations.</p>',
      '{"flesch_score": 38.5, "passive_pct": 25.0}'
    ) ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      readability = EXCLUDED.readability,
      updated_at = NOW();

    -- Document 4: Simple document for UI testing
    INSERT INTO documents (id, owner, title, content, readability) VALUES (
      '00000000-0000-0000-0000-000000000004',
      test_user_2,
      'Simple Test Document',
      '<p>Hello world! This is a simple document for testing the basic functionality of the WordWise AI application.</p>',
      '{"flesch_score": 85.0, "passive_pct": 0.0}'
    ) ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      readability = EXCLUDED.readability,
      updated_at = NOW();

    -- Document 5: Document with complex formatting for offset mapping testing
    INSERT INTO documents (id, owner, title, content, readability) VALUES (
      '00000000-0000-0000-0000-000000000005',
      test_user_3,
      'Formatting Test Document',
      '<p>This document contains <strong>bold text</strong> and <em>italic text</em> to test the offset mapping functionality. The <strong><em>bold italic combination</em></strong> should also work correctly.</p><p>When grammar errors occur in <strong>formatted text like this eror</strong>, the highlighting should position correctly. This tests our HTML-to-text offset mapping system.</p><p>Lists and other formatting:</p><ul><li>First item with a grammar eror</li><li>Second item that are grammatically incorrect</li><li>Third item with proper grammar</li></ul>',
      '{"flesch_score": 72.1, "passive_pct": 12.5}'
    ) ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      readability = EXCLUDED.readability,
      updated_at = NOW();

    -- Document 6: ESL Student Essay (realistic test case)
    INSERT INTO documents (id, owner, title, content, readability) VALUES (
      '00000000-0000-0000-0000-000000000006',
      test_user_3,
      'My Experience Learning English',
      '<p>Learning English has been one of the most challenging but rewarding experience of my life. When I first arrived to United States, I could barely speak few words in English. Everything was difficult - ordering food, asking for direction, even simple conversation with classmates.</p><p>At the beginning, I was very shy to speak because I was afraid of making mistake. My grammar was poor and my vocabulary was limited. I remember one embarrassing moment when I asked a librarian for "book house" instead of "library." She looked confused, but she was kind and helped me anyway.</p><p>However, I didn''t give up. I start watching American TV shows with subtitle, reading children books, and practicing with language exchange partner. Slowly but surely, my English begin to improve. I learned that making mistakes is normal part of learning process.</p><p>Now, after two years of study, I can communicate much better. I still make grammar errors sometimes, but I''m not afraid to speak anymore. Writing is still challenging for me, especially academic essays, but I''m getting better every day.</p><p>My advice for other ESL student is to be patient with yourself and practice every day. Don''t be afraid of making mistakes - they are your teachers. Also, find native speaker who can help you and be willing to help them with your language in return.</p>',
      '{"flesch_score": 78.5, "passive_pct": 15.0}'
    ) ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      readability = EXCLUDED.readability,
      updated_at = NOW();

    -- Sample Grammar Suggestions for Testing
    -- These will help test the suggestion popover UI without waiting for LanguageTool API

    -- Suggestions for Document 1
    INSERT INTO suggestions (doc_id, start_pos, end_pos, type, message, replacements) VALUES 
      ('00000000-0000-0000-0000-000000000001', 82, 87, 'spelling', 'Possible spelling mistake found.', '["errors"]'),
      ('00000000-0000-0000-0000-000000000001', 213, 216, 'grammar', 'Use "It''s" instead of "Its" for "it is".', '["It''s"]'),
      ('00000000-0000-0000-0000-000000000001', 280, 284, 'grammar', 'The verb "handle" does not agree with the subject "system".', '["handles"]')
    ON CONFLICT DO NOTHING;

    -- Suggestions for Document 2  
    INSERT INTO suggestions (doc_id, start_pos, end_pos, type, message, replacements) VALUES 
      ('00000000-0000-0000-0000-000000000002', 445, 464, 'style', 'This sentence uses passive voice. Consider using active voice.', '["The team conducted the research"]'),
      ('00000000-0000-0000-0000-000000000002', 480, 507, 'style', 'This sentence uses passive voice. Consider using active voice.', '["Experts analyzed the results"]')
    ON CONFLICT DO NOTHING;

    -- Suggestions for Document 5 (testing offset mapping with formatting)
    INSERT INTO suggestions (doc_id, start_pos, end_pos, type, message, replacements) VALUES 
      ('00000000-0000-0000-0000-000000000005', 234, 238, 'spelling', 'Possible spelling mistake found.', '["error"]'),
      ('00000000-0000-0000-0000-000000000005', 425, 428, 'spelling', 'Possible spelling mistake found.', '["error"]'),
      ('00000000-0000-0000-0000-000000000005', 453, 456, 'grammar', 'The verb "are" does not agree with the subject.', '["is"]')
    ON CONFLICT DO NOTHING;

    -- Suggestions for Document 6 (ESL Student Essay - realistic errors)
    INSERT INTO suggestions (doc_id, start_pos, end_pos, type, message, replacements) VALUES 
      ('00000000-0000-0000-0000-000000000006', 88, 98, 'grammar', 'Use "experiences" (plural) instead of "experience".', '["experiences"]'),
      ('00000000-0000-0000-0000-000000000006', 134, 136, 'grammar', 'Use "the" before "United States".', '["the"]'),
      ('00000000-0000-0000-0000-000000000006', 163, 166, 'grammar', 'Use "a few" instead of "few".', '["a few"]'),
      ('00000000-0000-0000-0000-000000000006', 245, 254, 'grammar', 'Use "directions" (plural) instead of "direction".', '["directions"]'),
      ('00000000-0000-0000-0000-000000000006', 327, 334, 'grammar', 'Use "mistakes" (plural) instead of "mistake".', '["mistakes"]'),
      ('00000000-0000-0000-0000-000000000006', 635, 640, 'grammar', 'Use "started" instead of "start".', '["started"]'),
      ('00000000-0000-0000-0000-000000000006', 668, 676, 'grammar', 'Use "subtitles" (plural) instead of "subtitle".', '["subtitles"]'),
      ('00000000-0000-0000-0000-000000000006', 689, 702, 'grammar', 'Use "children''s books" instead of "children books".', '["children''s books"]'),
      ('00000000-0000-0000-0000-000000000006', 724, 731, 'grammar', 'Use "a language" instead of "language".', '["a language"]'),
      ('00000000-0000-0000-0000-000000000006', 779, 784, 'grammar', 'Use "began" instead of "begin".', '["began"]'),
      ('00000000-0000-0000-0000-000000000006', 820, 824, 'grammar', 'Use "a normal" instead of "normal".', '["a normal"]'),
      ('00000000-0000-0000-0000-000000000006', 1176, 1183, 'grammar', 'Use "students" (plural) instead of "student".', '["students"]'),
      ('00000000-0000-0000-0000-000000000006', 1262, 1263, 'grammar', 'Use "a" before "native speaker".', '["a"]')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Test data inserted successfully with local test users:';
    RAISE NOTICE '- test1@wordwise.ai (password: password123)';
    RAISE NOTICE '- test2@wordwise.ai (password: password123)';  
    RAISE NOTICE '- test3@wordwise.ai (password: password123) - ESL Student profile';
    RAISE NOTICE '';
    RAISE NOTICE 'Created 6 test documents with realistic grammar errors and suggestions.';
    RAISE NOTICE 'To test:';
    RAISE NOTICE '1. Start the app: npm run dev:local';
    RAISE NOTICE '2. Use email/password login or configure Google OAuth';
    RAISE NOTICE '3. Documents and suggestions are ready for testing';
    
END $$;