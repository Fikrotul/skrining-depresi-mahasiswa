USE depression_screening_db1;

-- Insert Default Admin
INSERT INTO admin_users (username, email, password, full_name) VALUES 
('admin', 'admin@mentalcare.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtO5S8VyOy', 'System Administrator');
-- Password: admin123

-- Insert Diseases
INSERT INTO diseases (code, name, description, severity_level) VALUES 
('P01', 'Depresi Ringan', 'Tingkat depresi yang masih dapat diatasi dengan perubahan gaya hidup dan dukungan sosial', 'ringan'),
('P02', 'Depresi Sedang', 'Tingkat depresi yang memerlukan intervensi profesional dan mungkin memerlukan terapi', 'sedang'),
('P03', 'Depresi Berat', 'Tingkat depresi yang memerlukan penanganan intensif dan pengawasan medis', 'berat');

-- Insert Symptoms
INSERT INTO symptoms (code, name, description) VALUES 
('G01', 'Perasaan sedih yang mendalam', 'Merasa sedih, kosong, atau putus asa hampir setiap hari'),
('G02', 'Kehilangan minat pada aktivitas', 'Kehilangan minat atau kesenangan pada aktivitas yang biasa dinikmati'),
('G03', 'Mudah lelah dan kehilangan energi', 'Merasa lelah atau kehilangan energi hampir setiap hari'),
('G04', 'Perubahan pola tidur', 'Insomnia atau hipersomnia hampir setiap hari'),
('G05', 'Sulit berkonsentrasi', 'Kesulitan berpikir, berkonsentrasi, atau mengambil keputusan'),
('G06', 'Sering merasa cemas', 'Perasaan cemas, gelisah, atau khawatir berlebihan'),
('G07', 'Mudah tersinggung', 'Mudah marah, tersinggung, atau frustrasi'),
('G08', 'Kesulitan beraktivitas', 'Kesulitan melakukan aktivitas sehari-hari'),
('G09', 'Merasa bersalah', 'Perasaan bersalah atau tidak berharga yang berlebihan'),
('G10', 'Gangguan pola makan', 'Perubahan nafsu makan atau berat badan yang signifikan'),
('G11', 'Merasa tertekan', 'Perasaan tertekan dan putus asa'),
('G12', 'Perubahan berat badan', 'Penurunan atau peningkatan berat badan yang tidak disengaja'),
('G13', 'Halusinasi atau delusi', 'Mengalami halusinasi atau delusi'),
('G14', 'Merasa putus asa', 'Perasaan putus asa dan tidak ada harapan'),
('G15', 'Pikiran tentang kematian', 'Pikiran berulang tentang kematian atau bunuh diri');

-- Insert CF Rules
INSERT INTO cf_rules (symptom_code, disease_code, cf_expert) VALUES 
('G01', 'P01', 0.6),
('G02', 'P01', 0.2),
('G03', 'P01', 0.2),
('G04', 'P01', 0.4),
('G05', 'P01', 0.4),
('G06', 'P02', 0.6),
('G07', 'P02', 0.8),
('G08', 'P02', 0.4),
('G09', 'P02', 0.6),
('G10', 'P02', 0.6),
('G11', 'P03', 0.8),
('G12', 'P03', 0.8),
('G13', 'P03', 0.4),
('G14', 'P03', 0.8),
('G15', 'P03', 0.8);

-- Insert Treatment Recommendations
INSERT INTO treatments (disease_code, treatment_name, description, priority_order) VALUES 
('P01', 'Olahraga teratur', 'Melakukan aktivitas fisik secara rutin untuk meningkatkan endorfin', 1),
('P01', 'Pola makan seimbang', 'Mengonsumsi makanan bergizi dan seimbang', 2),
('P01', 'Tidur yang cukup', 'Menjaga pola tidur 7-9 jam per hari', 3),
('P01', 'Psikoedukasi', 'Edukasi tentang depresi dan cara mengatasinya', 4),
('P01', 'Psikoterapi', 'Konseling dengan psikolog atau konselor', 5),
('P01', 'Strategi coping adaptif', 'Mengembangkan cara mengatasi stres yang sehat', 6),

('P02', 'Manajemen stres', 'Teknik mengelola stres dengan relaksasi', 1),
('P02', 'Terapi relaksasi', 'Teknik relaksasi dan mindfulness', 2),
('P02', 'Psikoterapi intensif', 'Terapi psikologi yang lebih intensif', 3),
('P02', 'Farmakoterapi', 'Pengobatan dengan obat-obatan (konsultasi dokter)', 4),

('P03', 'Farmakoterapi ketat', 'Pengobatan dengan pengawasan medis ketat', 1),
('P03', 'Psikoterapi berkelanjutan', 'Terapi psikologi intensif dan berkelanjutan', 2),
('P03', 'Dukungan sosial', 'Dukungan dari keluarga dan lingkungan sosial', 3),
('P03', 'Rawat inap', 'Perawatan di rumah sakit jika diperlukan', 4);
