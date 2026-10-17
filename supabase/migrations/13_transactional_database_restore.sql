CREATE OR REPLACE FUNCTION public.restore_platform_database_backup(backup JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  table_name TEXT;
  table_rows JSONB;
  column_list TEXT;
  record_columns TEXT;
  update_list TEXT;
  restored_counts JSONB := '{}'::jsonb;
  restored_count INTEGER;
  table_names CONSTANT TEXT[] := ARRAY[
    'stores',
    'store_categories',
    'store_products',
    'products',
    'store_settings',
    'delivery_settings',
    'orders',
    'store_orders',
    'store_payments',
    'platform_settings',
    'blog_posts',
    'pricing_plans'
  ];
BEGIN
  IF jsonb_typeof(backup) IS DISTINCT FROM 'object'
    OR jsonb_typeof(backup->'tables') IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Invalid backup document.';
  END IF;

  FOREACH table_name IN ARRAY table_names LOOP
    table_rows := backup->'tables'->table_name;
    IF jsonb_typeof(table_rows) IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'Backup is missing a valid "%" table array.', table_name;
    END IF;

    restored_count := jsonb_array_length(table_rows);
    IF restored_count = 0 THEN
      restored_counts := jsonb_set(restored_counts, ARRAY[table_name], '0'::jsonb, TRUE);
      CONTINUE;
    END IF;

    SELECT
      string_agg(format('%I', attribute.attname), ', ' ORDER BY attribute.attnum),
      string_agg(format('records.%I', attribute.attname), ', ' ORDER BY attribute.attnum),
      string_agg(format('%I = EXCLUDED.%I', attribute.attname, attribute.attname), ', ' ORDER BY attribute.attnum)
        FILTER (WHERE attribute.attname <> 'id')
    INTO column_list, record_columns, update_list
    FROM pg_attribute AS attribute
    WHERE attribute.attrelid = format('public.%I', table_name)::regclass
      AND attribute.attnum > 0
      AND NOT attribute.attisdropped
      AND attribute.attgenerated = '';

    IF column_list IS NULL OR update_list IS NULL THEN
      RAISE EXCEPTION 'The "%" table does not have a supported backup schema.', table_name;
    END IF;

    EXECUTE format(
      'INSERT INTO public.%1$I (%2$s)
       SELECT %3$s
       FROM jsonb_populate_recordset(NULL::public.%1$I, $1) AS records
       ON CONFLICT (id) DO UPDATE SET %4$s',
      table_name,
      column_list,
      record_columns,
      update_list
    )
    USING table_rows;

    restored_counts := jsonb_set(restored_counts, ARRAY[table_name], to_jsonb(restored_count), TRUE);
  END LOOP;

  RETURN restored_counts;
END;
$$;

REVOKE ALL ON FUNCTION public.restore_platform_database_backup(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.restore_platform_database_backup(JSONB) TO service_role;
