SET search_path TO public;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_role
        CHECK (role IN ('admin', 'relawan', 'petugas', 'warga', 'donatur'))
);

CREATE TABLE regions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    province VARCHAR(100) NOT NULL,
    city_regency VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    village VARCHAR(100) NOT NULL,
    rt VARCHAR(10),
    rw VARCHAR(10),
    postal_code VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE aid_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE households (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomor_kk VARCHAR(32) NOT NULL UNIQUE,
    nama_kepala_keluarga VARCHAR(150) NOT NULL,
    nik_kepala_keluarga VARCHAR(32),
    alamat TEXT NOT NULL,
    region_id BIGINT NOT NULL REFERENCES regions(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    phone VARCHAR(30),
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    registered_by_role VARCHAR(30) NOT NULL,
    registration_source VARCHAR(30) NOT NULL,
    status_data VARCHAR(30) NOT NULL DEFAULT 'draft',
    duplicate_flag BOOLEAN NOT NULL DEFAULT FALSE,
    duplicate_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_households_registered_by_role
        CHECK (registered_by_role IN ('warga', 'relawan', 'petugas', 'admin')),
    CONSTRAINT chk_households_registration_source
        CHECK (registration_source IN ('self', 'assisted')),
    CONSTRAINT chk_households_status_data
        CHECK (status_data IN ('draft', 'submitted', 'under_review', 'verified', 'rejected'))
);

CREATE TABLE family_members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    nik VARCHAR(32) UNIQUE,
    name VARCHAR(150) NOT NULL,
    relationship_to_head VARCHAR(100) NOT NULL,
    birth_date DATE,
    age INT,
    gender VARCHAR(20),
    education_level VARCHAR(100),
    occupation VARCHAR(100),
    is_married BOOLEAN,
    is_lansia BOOLEAN NOT NULL DEFAULT FALSE,
    is_disability BOOLEAN NOT NULL DEFAULT FALSE,
    is_pregnant BOOLEAN NOT NULL DEFAULT FALSE,
    is_student BOOLEAN NOT NULL DEFAULT FALSE,
    has_chronic_illness BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_family_members_age
        CHECK (age IS NULL OR age >= 0),
    CONSTRAINT chk_family_members_gender
        CHECK (gender IS NULL OR gender IN ('laki_laki', 'perempuan'))
);

CREATE TABLE economic_conditions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL UNIQUE REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    monthly_income_total NUMERIC(14,2),
    income_source VARCHAR(150),
    head_job_status VARCHAR(100),
    monthly_basic_expense NUMERIC(14,2),
    dependents_count INT,
    has_other_income_source BOOLEAN NOT NULL DEFAULT FALSE,
    debt_estimation NUMERIC(14,2),
    notes TEXT,
    updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_economic_conditions_income
        CHECK (monthly_income_total IS NULL OR monthly_income_total >= 0),
    CONSTRAINT chk_economic_conditions_expense
        CHECK (monthly_basic_expense IS NULL OR monthly_basic_expense >= 0),
    CONSTRAINT chk_economic_conditions_dependents
        CHECK (dependents_count IS NULL OR dependents_count >= 0),
    CONSTRAINT chk_economic_conditions_debt
        CHECK (debt_estimation IS NULL OR debt_estimation >= 0)
);

CREATE TABLE housing_conditions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL UNIQUE REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    home_ownership_status VARCHAR(30),
    house_condition VARCHAR(30),
    floor_type VARCHAR(100),
    roof_type VARCHAR(100),
    wall_type VARCHAR(100),
    clean_water_access BOOLEAN,
    electricity_access BOOLEAN,
    sanitation_type VARCHAR(100),
    bedroom_count INT,
    notes TEXT,
    updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_housing_conditions_home_ownership
        CHECK (
            home_ownership_status IS NULL OR
            home_ownership_status IN ('milik_sendiri', 'kontrak', 'menumpang', 'lainnya')
        ),
    CONSTRAINT chk_housing_conditions_house_condition
        CHECK (
            house_condition IS NULL OR
            house_condition IN ('layak', 'semi_layak', 'tidak_layak')
        ),
    CONSTRAINT chk_housing_conditions_bedroom_count
        CHECK (bedroom_count IS NULL OR bedroom_count >= 0)
);

CREATE TABLE household_assets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL UNIQUE REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    owns_house BOOLEAN,
    has_bicycle BOOLEAN NOT NULL DEFAULT FALSE,
    has_motorcycle BOOLEAN NOT NULL DEFAULT FALSE,
    has_car BOOLEAN NOT NULL DEFAULT FALSE,
    has_other_land BOOLEAN NOT NULL DEFAULT FALSE,
    productive_assets TEXT,
    savings_range VARCHAR(100),
    other_assets TEXT,
    updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE household_vulnerabilities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL UNIQUE REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    is_disaster_victim BOOLEAN NOT NULL DEFAULT FALSE,
    lost_job_recently BOOLEAN NOT NULL DEFAULT FALSE,
    has_severe_ill_member BOOLEAN NOT NULL DEFAULT FALSE,
    has_disabled_member BOOLEAN NOT NULL DEFAULT FALSE,
    has_elderly_member BOOLEAN NOT NULL DEFAULT FALSE,
    has_pregnant_member BOOLEAN NOT NULL DEFAULT FALSE,
    has_school_children BOOLEAN NOT NULL DEFAULT FALSE,
    ever_received_aid_before BOOLEAN,
    special_condition_notes TEXT,
    updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    original_filename VARCHAR(255),
    mime_type VARCHAR(100),
    uploaded_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_documents_type
        CHECK (
            document_type IN ('ktp', 'kk', 'sktm', 'foto_rumah', 'foto_lapangan', 'lainnya')
        )
);

CREATE TABLE document_verifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON UPDATE CASCADE ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    verified_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    verification_note TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_document_verifications_status
        CHECK (status IN ('pending', 'approved', 'revision_required', 'rejected'))
);

CREATE TABLE aid_applications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    aid_type_id BIGINT NOT NULL REFERENCES aid_types(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    application_no VARCHAR(50) NOT NULL UNIQUE,
    submitted_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    submission_date DATE,
    status VARCHAR(30) NOT NULL,
    current_step_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_aid_applications_status
        CHECK (
            status IN (
                'draft',
                'submitted',
                'initial_validation',
                'document_verification',
                'field_survey',
                'scoring',
                'admin_review',
                'approved',
                'rejected',
                'cancelled'
            )
        )
);

CREATE TABLE application_status_histories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES aid_applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE duplicate_checks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES aid_applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    check_type VARCHAR(30) NOT NULL,
    result VARCHAR(30) NOT NULL,
    matched_reference VARCHAR(255),
    notes TEXT,
    checked_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_duplicate_checks_type
        CHECK (check_type IN ('nomor_kk', 'nik', 'alamat', 'kontak', 'manual')),
    CONSTRAINT chk_duplicate_checks_result
        CHECK (result IN ('clear', 'suspected_duplicate', 'confirmed_duplicate'))
);

CREATE TABLE surveys (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES aid_applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    surveyor_user_id BIGINT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    survey_date DATE NOT NULL,
    location_lat NUMERIC(10,7),
    location_lng NUMERIC(10,7),
    summary TEXT,
    matches_submitted_data BOOLEAN,
    recommendation VARCHAR(30),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_surveys_recommendation
        CHECK (
            recommendation IS NULL OR
            recommendation IN ('recommended', 'not_recommended', 'need_follow_up')
        ),
    CONSTRAINT chk_surveys_status
        CHECK (status IN ('draft', 'submitted', 'reviewed')),
    CONSTRAINT chk_surveys_lat
        CHECK (location_lat IS NULL OR (location_lat BETWEEN -90 AND 90)),
    CONSTRAINT chk_surveys_lng
        CHECK (location_lng IS NULL OR (location_lng BETWEEN -180 AND 180))
);

CREATE TABLE survey_checklists (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id BIGINT NOT NULL REFERENCES surveys(id) ON UPDATE CASCADE ON DELETE CASCADE,
    item_code VARCHAR(50) NOT NULL,
    item_label VARCHAR(150) NOT NULL,
    value_text TEXT,
    value_number NUMERIC(14,2),
    value_boolean BOOLEAN,
    notes TEXT
);

CREATE TABLE survey_photos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    survey_id BIGINT NOT NULL REFERENCES surveys(id) ON UPDATE CASCADE ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scoring_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES aid_applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    income_score NUMERIC(5,2),
    dependents_score NUMERIC(5,2),
    housing_score NUMERIC(5,2),
    asset_score NUMERIC(5,2),
    vulnerability_score NUMERIC(5,2),
    history_aid_score NUMERIC(5,2),
    total_score NUMERIC(5,2),
    priority_level VARCHAR(30),
    scoring_version VARCHAR(50),
    scored_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    score_note TEXT,
    scored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_scoring_results_priority_level
        CHECK (
            priority_level IS NULL OR
            priority_level IN ('sangat_layak', 'layak', 'verifikasi_tambahan', 'tidak_prioritas')
        ),
    CONSTRAINT chk_scoring_results_nonnegative
        CHECK (
            (income_score IS NULL OR income_score >= 0) AND
            (dependents_score IS NULL OR dependents_score >= 0) AND
            (housing_score IS NULL OR housing_score >= 0) AND
            (asset_score IS NULL OR asset_score >= 0) AND
            (vulnerability_score IS NULL OR vulnerability_score >= 0) AND
            (history_aid_score IS NULL OR history_aid_score >= 0) AND
            (total_score IS NULL OR total_score >= 0)
        )
);

CREATE TABLE beneficiary_decisions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL UNIQUE REFERENCES aid_applications(id) ON UPDATE CASCADE ON DELETE CASCADE,
    decision_status VARCHAR(20) NOT NULL,
    approved_aid_type_id BIGINT REFERENCES aid_types(id) ON UPDATE CASCADE ON DELETE SET NULL,
    approved_amount NUMERIC(14,2),
    approved_note TEXT,
    decided_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_beneficiary_decisions_status
        CHECK (decision_status IN ('approved', 'rejected', 'waitlisted')),
    CONSTRAINT chk_beneficiary_decisions_amount
        CHECK (approved_amount IS NULL OR approved_amount >= 0)
);

CREATE TABLE aid_distributions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    beneficiary_decision_id BIGINT NOT NULL REFERENCES beneficiary_decisions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    aid_type_id BIGINT NOT NULL REFERENCES aid_types(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    distribution_code VARCHAR(50) NOT NULL UNIQUE,
    planned_date DATE,
    distributed_date TIMESTAMPTZ,
    recipient_name VARCHAR(150) NOT NULL,
    recipient_relation VARCHAR(100),
    delivery_location TEXT,
    distributed_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    quantity NUMERIC(14,2),
    unit VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_aid_distributions_status
        CHECK (status IN ('received', 'recorded', 'allocated', 'sent', 'delivered', 'completed', 'failed')),
    CONSTRAINT chk_aid_distributions_quantity
        CHECK (quantity IS NULL OR quantity >= 0)
);

CREATE TABLE distribution_proofs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    distribution_id BIGINT NOT NULL REFERENCES aid_distributions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    proof_type VARCHAR(20) NOT NULL,
    file_url TEXT NOT NULL,
    caption TEXT,
    uploaded_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_distribution_proofs_type
        CHECK (proof_type IN ('photo', 'signature', 'receipt', 'other'))
);

CREATE TABLE distribution_status_histories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    distribution_id BIGINT NOT NULL REFERENCES aid_distributions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    reason TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE complaints (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    household_id BIGINT NOT NULL REFERENCES households(id) ON UPDATE CASCADE ON DELETE CASCADE,
    application_id BIGINT REFERENCES aid_applications(id) ON UPDATE CASCADE ON DELETE SET NULL,
    distribution_id BIGINT REFERENCES aid_distributions(id) ON UPDATE CASCADE ON DELETE SET NULL,
    submitted_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    complaint_type VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    resolution_note TEXT,
    resolved_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_complaints_type
        CHECK (complaint_type IN ('data_error', 'aid_not_received', 'distribution_error', 'other')),
    CONSTRAINT chk_complaints_status
        CHECK (status IN ('open', 'in_review', 'resolved', 'rejected'))
);

CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_logs_action
        CHECK (action IN ('create', 'update', 'delete', 'verify', 'approve', 'reject', 'distribute', 'login'))
);

CREATE INDEX idx_households_region_id ON households(region_id);
CREATE INDEX idx_households_created_by_user_id ON households(created_by_user_id);
CREATE INDEX idx_households_nomor_kk ON households(nomor_kk);
CREATE INDEX idx_households_nik_kepala_keluarga ON households(nik_kepala_keluarga);

CREATE INDEX idx_family_members_household_id ON family_members(household_id);
CREATE INDEX idx_family_members_nik ON family_members(nik);

CREATE INDEX idx_economic_conditions_updated_by_user_id ON economic_conditions(updated_by_user_id);
CREATE INDEX idx_housing_conditions_updated_by_user_id ON housing_conditions(updated_by_user_id);
CREATE INDEX idx_household_assets_updated_by_user_id ON household_assets(updated_by_user_id);
CREATE INDEX idx_household_vulnerabilities_updated_by_user_id ON household_vulnerabilities(updated_by_user_id);

CREATE INDEX idx_documents_household_id ON documents(household_id);
CREATE INDEX idx_documents_uploaded_by_user_id ON documents(uploaded_by_user_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);

CREATE INDEX idx_document_verifications_document_id ON document_verifications(document_id);
CREATE INDEX idx_document_verifications_verified_by_user_id ON document_verifications(verified_by_user_id);
CREATE INDEX idx_document_verifications_status ON document_verifications(status);

CREATE INDEX idx_aid_applications_household_id ON aid_applications(household_id);
CREATE INDEX idx_aid_applications_aid_type_id ON aid_applications(aid_type_id);
CREATE INDEX idx_aid_applications_submitted_by_user_id ON aid_applications(submitted_by_user_id);
CREATE INDEX idx_aid_applications_status ON aid_applications(status);

CREATE INDEX idx_application_status_histories_application_id ON application_status_histories(application_id);
CREATE INDEX idx_application_status_histories_changed_by_user_id ON application_status_histories(changed_by_user_id);

CREATE INDEX idx_duplicate_checks_application_id ON duplicate_checks(application_id);
CREATE INDEX idx_duplicate_checks_checked_by_user_id ON duplicate_checks(checked_by_user_id);
CREATE INDEX idx_duplicate_checks_result ON duplicate_checks(result);

CREATE INDEX idx_surveys_application_id ON surveys(application_id);
CREATE INDEX idx_surveys_surveyor_user_id ON surveys(surveyor_user_id);
CREATE INDEX idx_surveys_status ON surveys(status);

CREATE INDEX idx_survey_checklists_survey_id ON survey_checklists(survey_id);
CREATE INDEX idx_survey_photos_survey_id ON survey_photos(survey_id);

CREATE INDEX idx_scoring_results_application_id ON scoring_results(application_id);
CREATE INDEX idx_scoring_results_scored_by_user_id ON scoring_results(scored_by_user_id);
CREATE INDEX idx_scoring_results_priority_level ON scoring_results(priority_level);

CREATE INDEX idx_beneficiary_decisions_application_id ON beneficiary_decisions(application_id);
CREATE INDEX idx_beneficiary_decisions_approved_aid_type_id ON beneficiary_decisions(approved_aid_type_id);
CREATE INDEX idx_beneficiary_decisions_decided_by_user_id ON beneficiary_decisions(decided_by_user_id);

CREATE INDEX idx_aid_distributions_beneficiary_decision_id ON aid_distributions(beneficiary_decision_id);
CREATE INDEX idx_aid_distributions_aid_type_id ON aid_distributions(aid_type_id);
CREATE INDEX idx_aid_distributions_distributed_by_user_id ON aid_distributions(distributed_by_user_id);
CREATE INDEX idx_aid_distributions_status ON aid_distributions(status);

CREATE INDEX idx_distribution_proofs_distribution_id ON distribution_proofs(distribution_id);
CREATE INDEX idx_distribution_proofs_uploaded_by_user_id ON distribution_proofs(uploaded_by_user_id);

CREATE INDEX idx_distribution_status_histories_distribution_id ON distribution_status_histories(distribution_id);
CREATE INDEX idx_distribution_status_histories_changed_by_user_id ON distribution_status_histories(changed_by_user_id);

CREATE INDEX idx_complaints_household_id ON complaints(household_id);
CREATE INDEX idx_complaints_application_id ON complaints(application_id);
CREATE INDEX idx_complaints_distribution_id ON complaints(distribution_id);
CREATE INDEX idx_complaints_submitted_by_user_id ON complaints(submitted_by_user_id);
CREATE INDEX idx_complaints_resolved_by_user_id ON complaints(resolved_by_user_id);
CREATE INDEX idx_complaints_status ON complaints(status);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_regions_set_updated_at
BEFORE UPDATE ON regions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_aid_types_set_updated_at
BEFORE UPDATE ON aid_types
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_households_set_updated_at
BEFORE UPDATE ON households
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_family_members_set_updated_at
BEFORE UPDATE ON family_members
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_economic_conditions_set_updated_at
BEFORE UPDATE ON economic_conditions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_housing_conditions_set_updated_at
BEFORE UPDATE ON housing_conditions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_household_assets_set_updated_at
BEFORE UPDATE ON household_assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_household_vulnerabilities_set_updated_at
BEFORE UPDATE ON household_vulnerabilities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_aid_applications_set_updated_at
BEFORE UPDATE ON aid_applications
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_surveys_set_updated_at
BEFORE UPDATE ON surveys
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_aid_distributions_set_updated_at
BEFORE UPDATE ON aid_distributions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_complaints_set_updated_at
BEFORE UPDATE ON complaints
FOR EACH ROW EXECUTE FUNCTION set_updated_at();