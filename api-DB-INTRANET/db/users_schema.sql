-- Script de criação da tabela Usuarios no banco de dados Intranet

USE Intranet;
GO

-- Drop table if exists
IF OBJECT_ID('dbo.Usuarios', 'U') IS NOT NULL DROP TABLE dbo.Usuarios;
GO

-- Tabela Usuarios
CREATE TABLE Usuarios (
    usrCodigo INT PRIMARY KEY,
    nome NVARCHAR(255) NOT NULL,
    senha NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'USER', -- MASTER, FONO, TO, PSICO
    ativo BIT NOT NULL DEFAULT 1,
    data_criacao DATETIME NOT NULL DEFAULT GETDATE(),
    data_atualizacao DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- Índices para performance
CREATE INDEX idx_usuarios_role ON Usuarios(role);
GO

-- Inserir usuário MASTER inicial
INSERT INTO Usuarios (nome, senha, role, usrCodigo) VALUES ('master', 'master12345', 'MASTER', 1);
GO
