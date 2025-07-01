const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'depression_screening_db',
      port: 3306
    });
    
    console.log('Database connected successfully!');
    await connection.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();