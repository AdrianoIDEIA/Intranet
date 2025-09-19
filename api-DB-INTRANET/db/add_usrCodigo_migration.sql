-- Migration para remover email e adicionar usrCodigo na tabela Usuarios do INTRANET
-- Remove a coluna email e adiciona usrCodigo para evitar duplicatas

USE Intranet;
GO

-- Remover índice do email se existir
IF EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Usuarios') AND name = 'idx_usuarios_email')
BEGIN
    SET NOCOUNT ON;
    PRINT 'Removendo índice idx_usuarios_email...';
    DROP INDEX idx_usuarios_email ON dbo.Usuarios;
END
GO

-- Remover constraint única do email se existir
DECLARE @constraint_name NVARCHAR(256);
SELECT @constraint_name = kc.name
FROM sys.key_constraints AS kc
JOIN sys.index_columns AS ic ON kc.unique_index_id = ic.index_id AND kc.parent_object_id = ic.object_id
JOIN sys.columns AS c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE kc.parent_object_id = OBJECT_ID('dbo.Usuarios')
  AND c.name = 'email'
  AND kc.type = 'UQ';

IF @constraint_name IS NOT NULL
BEGIN
    SET NOCOUNT ON;
    PRINT 'Removendo constraint ' + @constraint_name + '...';
    EXEC('ALTER TABLE Usuarios DROP CONSTRAINT ' + @constraint_name);
END

-- Remover coluna email se existir (após remover dependências)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Usuarios') AND name = 'email')
BEGIN
    SET NOCOUNT ON;
    PRINT 'Removendo coluna email...';
    ALTER TABLE Usuarios DROP COLUMN email;
END
GO

-- Adicionar coluna usrCodigo se não existir
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Usuarios') AND name = 'usrCodigo')
BEGIN
    SET NOCOUNT ON;
    PRINT 'Adicionando coluna usrCodigo...';
    ALTER TABLE Usuarios ADD usrCodigo INT NULL;
END
GO

-- Criar índice para usrCodigo se não existir
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Usuarios') AND name = 'idx_usuarios_usrCodigo')
BEGIN
    SET NOCOUNT ON;
    PRINT 'Criando índice para usrCodigo...';
    CREATE INDEX idx_usuarios_usrCodigo ON Usuarios(usrCodigo);
END
GO

PRINT 'Migração concluída com sucesso!';
GO
