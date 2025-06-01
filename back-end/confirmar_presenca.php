<?php
include('./conexao/connect.php');
include('./conexao/protect.php');

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$codigo = filter_var($data['codigo'], FILTER_SANITIZE_STRING);
$aluno_id = $_SESSION['id'];

try {
    // Verifica se o código é válido e obtém o evento correspondente
    $sql = "SELECT cp.id, cp.evento_id 
            FROM codigos_presenca cp
            JOIN eventos e ON cp.evento_id = e.id
            WHERE cp.codigo = ? 
            AND cp.utilizado = 0
            AND cp.data_geracao >= NOW() - INTERVAL 2 HOUR";
    
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("s", $codigo);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows == 0) {
        echo json_encode(['success' => false, 'message' => 'Código inválido, expirado ou já utilizado']);
        exit();
    }
    
    $row = $result->fetch_assoc();
    $evento_id = $row['evento_id'];
    
    // Verifica se o aluno já confirmou presença
    $presenca_sql = "SELECT id FROM presencas WHERE evento_id = ? AND aluno_id = ?";
    $presenca_stmt = $mysqli->prepare($presenca_sql);
    $presenca_stmt->bind_param("ii", $evento_id, $aluno_id);
    $presenca_stmt->execute();
    $presenca_result = $presenca_stmt->get_result();
    
    if ($presenca_result->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Você já confirmou presença neste evento']);
        exit();
    }
    
    // Registra a presença
    $insert_sql = "INSERT INTO presencas (evento_id, aluno_id, data_presenca, codigo_presenca) 
                   VALUES (?, ?, NOW(), ?)";
    $insert_stmt = $mysqli->prepare($insert_sql);
    $insert_stmt->bind_param("iis", $evento_id, $aluno_id, $codigo);
    
    if ($insert_stmt->execute()) {
        // Marca o código como utilizado
        $update_sql = "UPDATE codigos_presenca SET utilizado = 1 WHERE id = ?";
        $update_stmt = $mysqli->prepare($update_sql);
        $update_stmt->bind_param("i", $row['id']);
        $update_stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Presença confirmada com sucesso']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao confirmar presença']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$stmt->close();
$mysqli->close();
?>