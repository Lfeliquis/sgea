<?php
include('./conexao/connect.php');
include('./conexao/protect.php');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

if ($_SESSION['tipo'] != 'coordenador') {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit();
}

$evento_id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
$data = json_decode(file_get_contents('php://input'), true);

if (!$evento_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID do evento não fornecido']);
    exit();
}

try {
    // Verifica se o coordenador é o criador do evento
    $check_sql = "SELECT id FROM eventos WHERE id = ? AND coordenador_id = ?";
    $check_stmt = $mysqli->prepare($check_sql);
    $check_stmt->bind_param("ii", $evento_id, $_SESSION['id']);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows == 0) {
        echo json_encode(['success' => false, 'message' => 'Você não tem permissão para editar este evento']);
        exit();
    }
    
    // Valida as datas
    if (strtotime($data['data_fim']) <= strtotime($data['data_inicio'])) {
        echo json_encode(['success' => false, 'message' => 'Data de término deve ser posterior à data de início']);
        exit();
    }
    
    // Atualiza o evento
    $sql = "UPDATE eventos 
            SET nome = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?
            WHERE id = ?";
    
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("sssssi", 
        $data['nome'],
        $data['descricao'],
        $data['data_inicio'],
        $data['data_fim'],
        $data['local'],
        $evento_id
    );
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar evento']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$stmt->close();
$mysqli->close();
?>