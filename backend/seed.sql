INSERT INTO facility (
    id,
    key,
    is_active,
    createdat,
    updatedat,
    description,
    injury_time,
    payment_stage
) VALUES (
    'FAC-002', 
    'KUR', 
    true,
    NOW(),
    NOW(),
    'Kredit Usaha Rakyat', 
    3, 
    'HALF' 
);

---

INSERT INTO collection (
    id,
    cif,
    total_credit,
    outstanding,
    penalty,
    dpd,
    createdat,
    updatedat,
    coll,
    last_activity_at,
    status,
    base,
    facility_id,
    interest
) VALUES (
    gen_random_uuid(),
    'CIF123456',
    10000000,
    8500000,
    150000,
    10,
    NOW(),
    NOW(),
    1, 
    NOW(),
    'ACTIVE',
    8000000,
    'FAC-001', 
    500000
);

---

INSERT INTO debitur (
    cif,
    full_name,
    identitas_number,
    placeof_birth,
    dateof_birth,
    gender,
    married_status,
    job,
    company_name,
    work_duration,
    monthly_salary,
    segmentation,
    risk_grade,
    customer_status,
    createdat
) VALUES (
    'CIF123456',
    'Rizky Nathamael',
    '3201011234567890',
    'Jakarta',
    '1995-06-15',
    'MALE',
    'SINGLE',
    'Software Engineer',
    'PT Teknologi Nusantara',
    36,  
    10000000,
    'MASS',
    'A',
    'ACTIVE',
    NOW()
);

---

INSERT INTO collateral (
    id,
    collateral_type,
    market_value,
    liquidation_value,
    appraisal_date,
    ownership_status,
    collateral_location,
    legal_document,
    binding_status,
    coverage_ratio,
    appraisal_location,
    collection_id
) VALUES (
    gen_random_uuid(),
    'TANAH & BANGUNAN',
    500000000,
    400000000,
    '2024-12-01',
    'OWNED',
    'Jl. Sudirman No.10, Jakarta',
    'SHM No.12345',
    'BOUND',
    80.0,
    'KJPP ABC & Rekan',
    '6cda517b-371c-4925-8fa5-faa0f82f9e5f'
);

---

INSERT INTO auction (
    id,
    collateral_id,
    collection_id,
    schedule,
    result,
    status,
    createdat,
    updatedat
) VALUES (
    gen_random_uuid(),
    '49b60809-82b0-483f-a1db-d38b82bb78b1',
    '6cda517b-371c-4925-8fa5-faa0f82f9e5f',
    '2026-06-15 10:00:00',
    'PENDING',
    'SCHEDULED',
    NOW(),
    NOW()
);


---

INSERT INTO collector_profile (
    id,
    user_id,
    area,
    start_date,
    status,
    createdat,
    updatedat
) VALUES (
    gen_random_uuid(),
    '8d1ed4a9-ae28-4725-a21a-33d00ef19cd8', 
    'Aceh Besar',
    '2024-01-01',
    'ACTIVE',
    NOW(),
    NOW()
);

---

INSERT INTO account (
  account_number,
  cif,
  account_type,
  account_status,
  balance,
  branch_office,
  auto_debit_flag,
  product_code
) VALUES (
  'ACC-00231',
  'CIF123456',
  'loan',
  'active',
  550000.00,
  'BR-JKT01',
  false,
  'PRD-KTA01'
);
