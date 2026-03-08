<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'msg' => 'Método inválido.']); exit;
}

// Honeypot anti-spam
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => false, 'msg' => 'Spam detectado.']); exit;
}

$nome     = trim(strip_tags($_POST['nome']      ?? ''));
$email    = trim(strip_tags($_POST['email']     ?? ''));
$servico  = trim(strip_tags($_POST['servico']   ?? ''));
$orcamento= trim(strip_tags($_POST['orcamento'] ?? ''));
$mensagem = trim(strip_tags($_POST['mensagem']  ?? ''));

// Validação
if (mb_strlen($nome) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$servico || mb_strlen($mensagem) < 10) {
    echo json_encode(['ok' => false, 'msg' => 'Preencha todos os campos obrigatórios corretamente.']); exit;
}

// Monta e-mail
$para    = 'gdegoblin0@gmail.com';
$assunto = '=?UTF-8?B?' . base64_encode("Novo contato: $nome") . '?=';
$corpo   = "Nome: $nome\nE-mail: $email\nServiço: $servico\nOrçamento: " . ($orcamento ?: 'Não informado') . "\n\nMensagem:\n$mensagem\n\nRecebido em: " . date('d/m/Y H:i:s');
$headers = "From: site@andersonfreitas.dev\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8";

$enviado = mail($para, $assunto, $corpo, $headers);

// Salva em CSV como backup
$fp = fopen(__DIR__ . '/leads.csv', 'a');
if ($fp) {
    if (filesize(__DIR__ . '/leads.csv') === 0) fputcsv($fp, ['Data','Nome','Email','Serviço','Orçamento','Mensagem']);
    fputcsv($fp, [date('d/m/Y H:i:s'), $nome, $email, $servico, $orcamento ?: '-', $mensagem]);
    fclose($fp);
}

echo json_encode(['ok' => true, 'msg' => 'Mensagem recebida! Retorno em até 24h.']);
