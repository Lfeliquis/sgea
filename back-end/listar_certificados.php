<?php
include('./conexao/connect.php');
include('./conexao/protect.php');

header('Content-Type: application/json');

try {
    $aluno_id = $_SESSION['id'];
    
    $sql = "SELECT c.id, e.nome AS evento_nome, c.link_certificado, c.data_emissao
            FROM certificados c
            JOIN inscricoes i ON c.inscricao_id = i.id
            JOIN eventos e ON i.evento_id = e.id
            WHERE i.aluno_id = ?
            ORDER BY c.data_emissao DESC";
    
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("i", $aluno_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $certificados = [];
    while ($row = $result->fetch_assoc()) {
        $certificados[] = $row;
    }
    
    echo json_encode($certificados);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

$stmt->close();
$mysqli->close();
?>