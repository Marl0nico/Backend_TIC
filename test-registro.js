import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const testRegistro = async () => {
  const userData = {
    nombre: 'Test User',
    usuario: 'testuser123',
    email: 'test@puce.edu.ec',
    password: 'Password123!',
    celular: '0987654321',
    universidad: 'PUCE',
    carrera: 'SistemasPUCE',
    bio: 'Testing registration flow',
    intereses: 'Programacion'
  };

  try {
    console.log('🚀 Iniciando prueba de registro...');
    console.log('📝 Datos:', userData);
    console.log('');

    const response = await axios.post(`${API_URL}/estudiante/registro`, userData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registro exitoso!');
    console.log('📊 Status:', response.status);
    console.log('💬 Mensaje:', response.data.msg);
    console.log('');
    console.log('📋 Respuesta completa:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Error en registro:');
    console.error('Status:', error.response?.status);
    console.error('Mensaje:', error.response?.data?.msg);
    console.error('Error completo:', error.response?.data || error.message);
    console.error('');
    
    // Detalles técnicos
    if (error.response) {
      console.error('📊 Detalles HTTP:');
      console.error('  Status:', error.response.status);
      console.error('  Headers:', error.response.headers);
      console.error('  Data:', error.response.data);
    } else if (error.request) {
      console.error('📊 La solicitud fue hecha pero sin respuesta:');
      console.error('  Request:', error.request);
    } else {
      console.error('📊 Error en la configuración:');
      console.error('  Mensaje:', error.message);
    }
  }
};

// Ejecutar prueba
testRegistro();
