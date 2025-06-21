-- Database schema for Production Business Coach

-- Drop tables if they exist
DROP TABLE IF EXISTS boston_matrix_items;
DROP TABLE IF EXISTS analysis_results;
DROP TABLE IF EXISTS business_data;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create business_data table
CREATE TABLE business_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_name VARCHAR(255) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  data_content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create analysis_results table
CREATE TABLE analysis_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data_id INTEGER NOT NULL REFERENCES business_data(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  analysis_content JSONB NOT NULL,
  parent_analysis_id INTEGER REFERENCES analysis_results(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create boston_matrix_items table
CREATE TABLE boston_matrix_items (
  id SERIAL PRIMARY KEY,
  analysis_id INTEGER NOT NULL REFERENCES analysis_results(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  market_growth VARCHAR(50) NOT NULL,
  market_share VARCHAR(50) NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_business_data_user_id ON business_data(user_id);
CREATE INDEX idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX idx_analysis_results_data_id ON analysis_results(data_id);
CREATE INDEX idx_analysis_results_parent_id ON analysis_results(parent_analysis_id);
CREATE INDEX idx_boston_matrix_items_analysis_id ON boston_matrix_items(analysis_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_business_data_timestamp
BEFORE UPDATE ON business_data
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_analysis_results_timestamp
BEFORE UPDATE ON analysis_results
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_boston_matrix_items_timestamp
BEFORE UPDATE ON boston_matrix_items
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 