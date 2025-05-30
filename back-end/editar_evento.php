<?php
// Garante que nenhum output seja enviado antes dos headers
ob_start();

include('./conexao/connect.php');
include('./conexao/protect.php');

// Verifica erros antes de qualquer output
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Método não permitido']));
}

if (!isset($_SESSION['tipo']) || $_SESSION['tipo'] != 'coordenador') {
    http_response_code(403);
    die(json_encode(['success' => false, 'error' => 'Acesso negado']));
}

// Limpa o buffer de saída antes de enviar o header
ob_end_clean();
header('Content-Type: application/json');

// Validação do ID
$evento_id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
if (!$evento_id || $evento_id <= 0) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'ID do evento inválido']));
}

// Processa o input JSON
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Dados JSON inválidos']));
}

// Valida campos obrigatórios
$required = ['nome', 'data_inicio', 'data_fim', 'local'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        die(json_encode(['success' => false, 'error' => "Campo $field é obrigatório"]));
    }
}

try {
    // Verifica se o coordenador é o dono do evento
    $check_sql = "SELECT id FROM eventos WHERE id = ? AND coordenador_id = ?";
    $check_stmt = $mysqli->prepare($check_sql);
    $check_stmt->bind_param("ii", $evento_id, $_SESSION['id']);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows == 0) {
        http_response_code(403);
        die(json_encode(['success' => false, 'error' => 'Você não tem permissão para editar este evento']));
    }
    
    // Valida as datas
    $data_inicio = date('Y-m-d H:i:s', strtotime($data['data_inicio']));
    $data_fim = date('Y-m-d H:i:s', strtotime($data['data_fim']));
    
    if (!$data_inicio || !$data_fim) {
        http_response_code(400);
        die(json_encode(['success' => false, 'error' => 'Datas inválidas']));
    }
    
    if (strtotime($data_fim) <= strtotime($data_inicio)) {
        http_response_code(400);
        die(json_encode(['success' => false, 'error' => 'Data de término deve ser posterior à data de início']));
    }
    
    // Prepara os dados para atualização
    $nome = htmlspecialchars($data['nome']);
    $descricao = !empty($data['descricao']) ? htmlspecialchars($data['descricao']) : null;
    $local = htmlspecialchars($data['local']);
    
    // Atualiza o evento
    $sql = "UPDATE eventos 
            SET nome = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?
            WHERE id = ?";
    
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("sssssi", $nome, $descricao, $data_inicio, $data_fim, $local, $evento_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Evento atualizado com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao atualizar evento: ' . $stmt->error]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro no servidor: ' . $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($check_stmt)) $check_stmt->close();
    $mysqli->close();
}
?>