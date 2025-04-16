CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('jobseeker', 'employer', 'admin')),
  company VARCHAR(255),
  position VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  phone VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
  years_of_experience NUMERIC(4,1),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  salary VARCHAR(100),
  employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employment_type VARCHAR(50) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_skills (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  importance INTEGER NOT NULL DEFAULT 1 CHECK (importance BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'rejected', 'accepted', 'interview')),
  cover_letter TEXT,
  resume_url TEXT,
  match_score INTEGER CHECK (match_score BETWEEN 0 AND 100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  interview_type VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);