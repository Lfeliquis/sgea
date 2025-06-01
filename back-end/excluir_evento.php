<?php
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

try {
    // Obtém os dados JSON do corpo da requisição
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Dados inválidos', 400);
    }

    // Validação do ID do evento
    $evento_id = isset($data['id']) ? filter_var($data['id'], FILTER_VALIDATE_INT) : null;
    if (!$evento_id || $evento_id <= 0) {
        throw new Exception('ID do evento inválido', 400);
    }

    // Conexão com o banco de dados
    require __DIR__ . '/conexao/connect.php';
    
    // Verifica se o coordenador é o dono do evento
    $check_sql = "SELECT id FROM eventos WHERE id = ? AND coordenador_id = ?";
    $check_stmt = $mysqli->prepare($check_sql);
    $check_stmt->bind_param("ii", $evento_id, $_SESSION['id']);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows == 0) {
        throw new Exception('Você não tem permissão para excluir este evento', 403);
    }
    
    // Exclui o evento
    $sql = "DELETE FROM eventos WHERE id = ?";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception('Erro na preparação da query: ' . $mysqli->error, 500);
    }

    $stmt->bind_param("i", $evento_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Erro ao executar a query: ' . $stmt->error, 500);
    }

    // Resposta de sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Evento excluído com sucesso'
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
    if (isset($check_stmt)) $check_stmt->close();
    if (isset($mysqli)) $mysqli->close();
}