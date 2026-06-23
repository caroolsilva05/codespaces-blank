CREATE DATABASE IF NOT EXISTS plataforma_bellinati
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE plataforma_bellinati;

CREATE TABLE IF NOT EXISTS registros_do_projeto_scrum (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  nome_do_projeto VARCHAR(255) NOT NULL,
  codigo_do_projeto VARCHAR(255) NULL,
  fornecedor VARCHAR(255) NULL,
  responsavel VARCHAR(255) NULL,
  fase_atual VARCHAR(255) NULL DEFAULT 'Backlog',
  status_geral VARCHAR(255) NULL DEFAULT 'Em dia',
  dados_do_registro JSON NOT NULL DEFAULT (JSON_OBJECT()),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  INDEX idx_registros_scrum_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS poc_records (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  poc_name VARCHAR(255) NOT NULL,
  supplier VARCHAR(255) NULL,
  responsible VARCHAR(255) NULL,
  status VARCHAR(255) NULL DEFAULT 'Em Planejamento',
  recommendation VARCHAR(255) NULL,
  record_data JSON NOT NULL DEFAULT (JSON_OBJECT()),
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  INDEX idx_poc_records_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fornecedores (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(255) NULL,
  canais JSON NULL DEFAULT (JSON_ARRAY()),
  responsavel VARCHAR(255) NULL,
  contato VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  telefone VARCHAR(255) NULL,
  status VARCHAR(255) NULL DEFAULT 'Ativo',
  sla_meta DECIMAL(10,2) NULL DEFAULT 0,
  performance_score DECIMAL(10,2) NULL DEFAULT 0,
  risco VARCHAR(255) NULL DEFAULT 'Baixo',
  projetos_ativos DECIMAL(10,2) NULL DEFAULT 0,
  incidentes_abertos DECIMAL(10,2) NULL DEFAULT 0,
  avaliacao TEXT NULL,
  observacoes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  INDEX idx_fornecedores_updated_at (updated_at),
  INDEX idx_fornecedores_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
