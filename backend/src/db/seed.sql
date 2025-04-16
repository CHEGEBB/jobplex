-- Create admin user (password: admin123)
INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
VALUES ('admin@jobplex.com', '$2b$10$5euNeOdpF6qP72.DsLjYYeS3WwPnPQHR/kCsK.bBhJ3QFLpxOGFUi', 'Admin', 'User', 'admin', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create some skill categories
INSERT INTO skills (name, category, created_at, updated_at)
VALUES 
  ('JavaScript', 'Programming Languages', NOW(), NOW()),
  ('TypeScript', 'Programming Languages', NOW(), NOW()),
  ('Python', 'Programming Languages', NOW(), NOW()),
  ('Java', 'Programming Languages', NOW(), NOW()),
  ('C#', 'Programming Languages', NOW(), NOW()),
  ('SQL', 'Database', NOW(), NOW()),
  ('MongoDB', 'Database', NOW(), NOW()),
  ('PostgreSQL', 'Database', NOW(), NOW()),
  ('Docker', 'DevOps', NOW(), NOW()),
  ('Kubernetes', 'DevOps', NOW(), NOW()),
  ('React', 'Frontend', NOW(), NOW()),
  ('Angular', 'Frontend', NOW(), NOW()),
  ('Vue.js', 'Frontend', NOW(), NOW()),
  ('Node.js', 'Backend', NOW(), NOW()),
  ('Django', 'Backend', NOW(), NOW()),
  ('Spring Boot', 'Backend', NOW(), NOW()),
  ('AWS', 'Cloud', NOW(), NOW()),
  ('Azure', 'Cloud', NOW(), NOW()),
  ('Google Cloud', 'Cloud', NOW(), NOW()),
  ('TensorFlow', 'Machine Learning', NOW(), NOW()),
  ('PyTorch', 'Machine Learning', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;