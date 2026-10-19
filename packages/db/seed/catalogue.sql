-- Initial catalogue, taken from the WhatsApp bot's live price list (2026-10-19).
-- One pack size per product for now; add grain/pack sizes from the admin app.
-- Prices in paise, GST included. Safe to re-run: existing rows are left alone.

INSERT INTO products (slug, name, category, summary, image, sort_order) VALUES
  ('perlite',      'Perlite',           'Volcanic Mineral',       'Aeration and drainage; prevents root rot',               'perlite-jar.jpg',        1),
  ('pumice',       'Pumice',            'Volcanic Rock',          'Fast drainage for succulents, cacti and bonsai',         'pumice-plain.jpg',       2),
  ('leca',         'LECA (Clay Balls)', 'Expanded Clay',          'Hydroponics and drainage layers; reusable',              'clayballs-jar.jpg',      3),
  ('pine-bark',    'Pine Bark',         'Organic Bark',           'Chunky, airy mixes for orchids and aroids',              'pinebark-plain.jpg',     4),
  ('vermiculite',  'Vermiculite',       'Hydrated Mineral',       'Holds moisture and nutrients; seed germination',         'vermiculite-jar.jpg',    5),
  ('vermicompost', 'Vermicompost',      'Organic Fertiliser',     'Slow-release organic nutrition for healthy roots',       'vermicompost-plain.jpg', 6),
  ('cocopeat',     'Cocopeat',          'Organic Medium',         'Light base medium that holds moisture',                  'cocopeat-plain.jpg',     7),
  ('zeolite',      'Zeolite',           'Natural Mineral',        'Holds nutrients and reduces fertiliser leaching',        'zeolite-jar.jpg',        8),
  ('neem-cake',    'Neem Cake',         'Organic Soil Amendment', 'Organic pest and fungal control for soil',               'neemcake-plain.jpg',     9)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO variants (sku, product_slug, pack_size, weight_grams, price, sort_order, zoho_item_id) VALUES
  ('PERLITE-330G',     'perlite',      '330g',       330,  20000, 1, '3313396000000044045'),
  ('PUMICE-1KG',       'pumice',       '1kg',        1000, 25000, 1, '3313396000000048057'),
  ('LECA-5L',          'leca',         '1.3kg (5L)', 1300, 25000, 1, '3313396000000048048'),
  ('PINE-BARK-1KG',    'pine-bark',    '1kg',        1000, 35000, 1, NULL),
  ('VERMICULITE-500G', 'vermiculite',  '500g',       500,  20000, 1, '3313396000000067012'),
  ('VERMICOMPOST-1KG', 'vermicompost', '1kg',        1000, 12000, 1, '3313396000000056012'),
  ('COCOPEAT-1KG',     'cocopeat',     '1kg',        1000, 12000, 1, '3313396000000056020'),
  ('ZEOLITE-1KG',      'zeolite',      '1kg',        1000, 20000, 1, '3313396000000048040'),
  ('NEEM-CAKE-1KG',    'neem-cake',    '1kg',        1000, 20000, 1, NULL)
ON CONFLICT (sku) DO NOTHING;
