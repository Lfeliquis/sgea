<?php
// Desativa a exibição de erros na tela (importante para produção)
ini_set('display_errors', 0);
error_reporting(0);

// Deve ser a PRIMEIRA linha do script
header('Content-Type: application/json');

session_start();

// Verifica se o script está sendo acessado via POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

// Verifica autenticação
if (!isset($_SESSION['id']) || $_SESSION['tipo'] !== 'coordenador') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Acesso não autorizado']);
    exit();
}

// Configura tratamento de erros
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

try {
    // Obtém os dados JSON do corpo da requisição
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Dados inválidos', 400);
    }

    // Validação dos campos obrigatórios (agora usando datetime-local)
    $required = ['nome', 'local', 'data_inicio', 'data_fim'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("O campo {$field} é obrigatório", 400);
        }
    }

    // Conexão com o banco de dados
    require __DIR__ . '/conexao/connect.php';
    
    // Prepara os dados
    $nome = $mysqli->real_escape_string($data['nome']);
    $descricao = !empty($data['descricao']) ? $mysqli->real_escape_string($data['descricao']) : null;
    $local = $mysqli->real_escape_string($data['local']);
    $coordenador_id = $_SESSION['id'];
    
    // Formata as datas (datetime-local envia como YYYY-MM-DDTHH:MM)
    $data_inicio = str_replace('T', ' ', $data['data_inicio']) . ':00';
    $data_fim = str_replace('T', ' ', $data['data_fim']) . ':00';
    
    // Valida as datas
    if (strtotime($data_fim) <= strtotime($data_inicio)) {
        throw new Exception('Data de término deve ser posterior à data de início', 400);
    }

    // Prepara e executa a query
    $sql = "INSERT INTO eventos (nome, descricao, data_inicio, data_fim, local, coordenador_id) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception('Erro na preparação da query: ' . $mysqli->error, 500);
    }

    $stmt->bind_param("sssssi", $nome, $descricao, $data_inicio, $data_fim, $local, $coordenador_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Erro ao executar a query: ' . $stmt->error, 500);
    }

    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Evento cadastrado com sucesso',
        'event_id' => $stmt->insert_id
    ]);

} catch (Exception $e) {
    // Resposta de erro
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
} finally {
    // Fecha conexões
    if (isset($stmt)) $stmt->close();
    if (isset($mysqli)) $mysqli->close();
}