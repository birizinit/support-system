-- Insert some sample tickets for testing
INSERT INTO tickets (title, description, priority, status, category, requester_name, requester_email, requester_phone) VALUES
('Sistema lento na tela de relatórios', 'O sistema está muito lento quando acesso a tela de relatórios, demora mais de 30 segundos para carregar', 'alta', 'aberto', 'Performance', 'João Silva', 'joao.silva@empresa.com', '(11) 99999-1234'),
('Erro ao fazer login', 'Não consigo fazer login no sistema, aparece mensagem de erro "credenciais inválidas"', 'critica', 'em_andamento', 'Autenticação', 'Maria Santos', 'maria.santos@empresa.com', '(11) 99999-5678'),
('Solicitação de novo usuário', 'Preciso criar acesso para novo funcionário do departamento financeiro', 'media', 'aberto', 'Acesso', 'Pedro Costa', 'pedro.costa@empresa.com', '(11) 99999-9012'),
('Backup não está funcionando', 'O backup automático não está sendo executado há 3 dias', 'alta', 'aguardando', 'Infraestrutura', 'Ana Oliveira', 'ana.oliveira@empresa.com', '(11) 99999-3456'),
('Impressora não conecta', 'A impressora do 2º andar não está conectando na rede', 'baixa', 'resolvido', 'Hardware', 'Carlos Lima', 'carlos.lima@empresa.com', '(11) 99999-7890');
