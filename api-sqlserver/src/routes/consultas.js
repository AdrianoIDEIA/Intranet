const searchPatients = async (nome) => {
  const apiToken = 'K2Bu3i02K1S1jYPV46ZDFVayBhbcGnoGsfSOOWxOvcMtTIV60OPtDuMFj0qrjobU'; // Pegue este valor do seu .env no frontend ou de forma segura
  const url = `http://localhost:5001/api/consultas/paciente-por-nome/${nome}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-token': apiToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const pacientes = await response.json();
    return pacientes; // Retorna a lista de pacientes
  } catch (error) {
    console.error('Falha ao buscar pacientes:', error);
    return [];
  }
};