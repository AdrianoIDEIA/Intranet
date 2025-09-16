-- Script de criação do banco de dados Intranet para SQL Server
-- Baseado no esquema fornecido para o sistema de gerenciamento terapêutico

-- Criação do banco de dados
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Intranet')
BEGIN
    CREATE DATABASE Intranet;
END
GO

USE Intranet;
GO

-- Drop tables if they exist to avoid errors on creation
IF OBJECT_ID('dbo.Anamneses', 'U') IS NOT NULL DROP TABLE dbo.Anamneses;
IF OBJECT_ID('dbo.Paciente_Terapeuta', 'U') IS NOT NULL DROP TABLE dbo.Paciente_Terapeuta;
IF OBJECT_ID('dbo.Paciente_Cartas_Habilidades', 'U') IS NOT NULL DROP TABLE dbo.Paciente_Cartas_Habilidades;
IF OBJECT_ID('dbo.Cartas_Habilidades', 'U') IS NOT NULL DROP TABLE dbo.Cartas_Habilidades;
IF OBJECT_ID('dbo.Paciente_Treinos', 'U') IS NOT NULL DROP TABLE dbo.Paciente_Treinos;
IF OBJECT_ID('dbo.Pendencias', 'U') IS NOT NULL DROP TABLE dbo.Pendencias;
IF OBJECT_ID('dbo.Planos_Terapeuticos', 'U') IS NOT NULL DROP TABLE dbo.Planos_Terapeuticos;
IF OBJECT_ID('dbo.Avaliacoes', 'U') IS NOT NULL DROP TABLE dbo.Avaliacoes;
IF OBJECT_ID('dbo.Tipos_Avaliacao', 'U') IS NOT NULL DROP TABLE dbo.Tipos_Avaliacao;
IF OBJECT_ID('dbo.Treinos', 'U') IS NOT NULL DROP TABLE dbo.Treinos;
IF OBJECT_ID('dbo.Tipos_Treino', 'U') IS NOT NULL DROP TABLE dbo.Tipos_Treino;
IF OBJECT_ID('dbo.Status', 'U') IS NOT NULL DROP TABLE dbo.Status;
IF OBJECT_ID('dbo.Terapeutas', 'U') IS NOT NULL DROP TABLE dbo.Terapeutas;
IF OBJECT_ID('dbo.Pacientes', 'U') IS NOT NULL DROP TABLE dbo.Pacientes;
GO

-- Tabela Pacientes
CREATE TABLE Pacientes (
    paciente_id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(255) NOT NULL,
    data_nascimento DATE NULL,
    genero NVARCHAR(50) NULL,
    contato NVARCHAR(255) NULL,
    endereco NVARCHAR(255) NULL
);
GO

-- Tabela Terapeutas
CREATE TABLE Terapeutas (
    terapeuta_id INT IDENTITY(1,1) PRIMARY KEY,
    nome NVARCHAR(255) NOT NULL,
    especialidade NVARCHAR(255) NULL,
    contato NVARCHAR(255) NULL
);
GO

-- Tabela Status
CREATE TABLE Status (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    nome_status NVARCHAR(100) NOT NULL,
    descricao NVARCHAR(MAX) NULL
);
GO

-- Tabela Tipos_Treino
CREATE TABLE Tipos_Treino (
    tipo_treino_id INT IDENTITY(1,1) PRIMARY KEY,
    nome_tipo NVARCHAR(255) NOT NULL
);
GO

-- Tabela Treinos
CREATE TABLE Treinos (
    treino_id INT IDENTITY(1,1) PRIMARY KEY,
    nome_treino NVARCHAR(255) NOT NULL,
    descricao NVARCHAR(MAX) NULL,
    tipo_treino_id INT NOT NULL,
    FOREIGN KEY (tipo_treino_id) REFERENCES Tipos_Treino(tipo_treino_id)
);
GO

-- Tabela Tipos_Avaliacao
CREATE TABLE Tipos_Avaliacao (
    tipo_avaliacao_id INT IDENTITY(1,1) PRIMARY KEY,
    nome_tipo NVARCHAR(255) NOT NULL
);
GO

-- Tabela Avaliacoes
CREATE TABLE Avaliacoes (
    avaliacao_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    data_avaliacao DATE NOT NULL,
    conteudo NVARCHAR(MAX) NULL,
    tipo_avaliacao_id INT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id),
    FOREIGN KEY (tipo_avaliacao_id) REFERENCES Tipos_Avaliacao(tipo_avaliacao_id)
);
GO

-- Tabela Planos_Terapeuticos
CREATE TABLE Planos_Terapeuticos (
    plano_terapeutico_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    data_plano DATE NOT NULL,
    objetivos NVARCHAR(MAX) NULL,
    intervencoes NVARCHAR(MAX) NULL,
    tipo NVARCHAR(255) NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id)
);
GO

-- Tabela Pendencias
CREATE TABLE Pendencias (
    pendencia_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    terapeuta_id INT NOT NULL,
    descricao NVARCHAR(MAX) NULL,
    data_criacao DATE NOT NULL,
    status_id INT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id),
    FOREIGN KEY (terapeuta_id) REFERENCES Terapeutas(terapeuta_id),
    FOREIGN KEY (status_id) REFERENCES Status(status_id)
);
GO

-- Tabela Paciente_Treinos
CREATE TABLE Paciente_Treinos (
    paciente_treino_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    treino_id INT NOT NULL,
    data_atribuicao DATE NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id),
    FOREIGN KEY (treino_id) REFERENCES Treinos(treino_id)
);
GO

-- Tabela Cartas_Habilidades
CREATE TABLE Cartas_Habilidades (
    carta_habilidade_id INT IDENTITY(1,1) PRIMARY KEY,
    nome_carta NVARCHAR(255) NOT NULL,
    descricao NVARCHAR(MAX) NULL
);
GO

-- Tabela Paciente_Cartas_Habilidades
CREATE TABLE Paciente_Cartas_Habilidades (
    paciente_carta_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    carta_habilidade_id INT NOT NULL,
    data_alocacao DATE NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id),
    FOREIGN KEY (carta_habilidade_id) REFERENCES Cartas_Habilidades(carta_habilidade_id)
);
GO

-- Tabela Paciente_Terapeuta
CREATE TABLE Paciente_Terapeuta (
    paciente_terapeuta_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    terapeuta_id INT NOT NULL,
    data_inicio DATE NULL,
    data_fim DATE NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id),
    FOREIGN KEY (terapeuta_id) REFERENCES Terapeutas(terapeuta_id)
);
GO

-- Tabela Anamneses
CREATE TABLE Anamneses (
    anamnese_id INT IDENTITY(1,1) PRIMARY KEY,
    paciente_id INT NOT NULL,
    data_anamnese DATE NOT NULL,
    conteudo NVARCHAR(MAX) NULL,
    status_id INT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES Pacientes(paciente_id),
    FOREIGN KEY (status_id) REFERENCES Status(status_id)
);
GO
