<?php
session_start();
include('./back-end/conexao/connect.php');

if(isset($_POST['email']) || isset($_POST['senha'])) {
    if(strlen($_POST['email']) == 0) {
        echo "<script>alert('Preencha seu email');</script>";
    } else if(strlen($_POST['senha']) == 0) {
        echo "<script>alert('Preencha sua senha');</script>";
    } else {
        $email = $mysqli->real_escape_string($_POST['email']);
        $senha = $mysqli->real_escape_string($_POST['senha']);

        $sql_code = "SELECT * FROM usuarios WHERE email = '$email'";
        $sql_query = $mysqli->query($sql_code) or die("Falha na execução do SQL: " . $mysqli->error);
  
        if($sql_query->num_rows == 1) {
            $usuario = $sql_query->fetch_assoc();
            
            if($senha == $usuario['senha']) {
                $_SESSION['id'] = $usuario['id'];
                $_SESSION['nome'] = $usuario['nome'];
                header("Location: aluno.php");
                exit();
            } else {
                echo "<script>alert('Falha ao logar! Senha incorreta');</script>";
            }
        } else {
            echo "<script>alert('Falha ao logar! Email não encontrado');</script>";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SGEA: Login</title>
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="../sgea/front-end/css/style.css" />
  </head>

  <body>
    <div class="container">
      <div class="form-box login">
        <form action="" method="POST">
          <h1>Login</h1>
          <div class="input-box">
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
            />
            <i class="bx bxs-envelope"></i>
          </div>
          <div class="input-box">
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              required
            />
            <i class="bx bxs-lock-alt"></i>
          </div>
          <div class="forgot-link">
            <a href="">Esqueceu sua senha?</a>
          </div>
          <button type="submit" class="btn">
            Login
          </button>
        </form>
      </div>

      <div class="form-box register">
        <form action="">
          <h1>Cadastre-se</h1>
          <div class="input-box">
            <input
              type="text"
              placeholder="Username"
              required
            />
            <i class="bx bxs-user"></i>
          </div>
          <div class="input-box">
            <input
              type="email"
              placeholder="Email"
              required
            />
            <i class="bx bxs-envelope"></i>
          </div>
          <div class="input-box">
            <input
              type="password"
              placeholder="Password"
              required
            />
            <i class="bx bxs-lock-alt"></i>
          </div>
          <button type="submit" class="btn">
            Cadastrar
          </button>
        </form>
      </div>

      <div class="toggle-box">
        <div class="toggle-panel toggle-left">
          <h1>Seja bem vindo!</h1>
          <p>Nao possui uma conta?</p>
          <button class="btn register-btn">Cadastre-se</button>
        </div>

        <div class="toggle-panel toggle-right">
          <h1>Bem-vindo de volta!</h1>
          <p>Ja possui uma conta?</p>
          <button class="btn login-btn">Faca o login</button>
        </div>
      </div>
    </div>

    <script src="../sgea/front-end/js/script.js"></script>
  </body>
</html>