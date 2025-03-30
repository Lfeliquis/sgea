<?php
include('./back-end/conexao/protect.php');
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>SGEA: Aluno</title>
    <link
      rel="stylesheet"
      href="../sgea/front-end/css/style.css"
    />
  </head>
  <body>
    <header>
      <div class="header-content">
        <h1>Bem-vindo, <?php echo $_SESSION['nome'];?></h1>
        <nav>
          <a href="#eventos">Eventos</a>
          <a href="#certificados">Certificados</a>
          <a href="../sgea/logout.php">Sair</a>
        </nav>
      </div>
    </header>

    <main>
      <!-- Container para as caixas -->
      <div class="caixa-container">
        <!-- Caixa de Eventos Disponíveis -->
        <div class="caixa">
          <h2>Eventos Disponíveis</h2>
          <div
            id="event-list"
            class="event-list"
          >
            <!-- Lista de eventos dinâmica (pode ser populada com JavaScript ou backend) -->
          </div>
          <button class="btn">Ver Mais Eventos</button>
        </div>

        <!-- Caixa de Emissão de Certificados -->
        <div class="caixa">
          <h2>Meus Certificados</h2>
          <div
            id="certificate-list"
            class="certificate-list"
          >
            <!-- Lista de certificados dinâmica -->
          </div>
          <button class="btn">Ver Todos os Certificados</button>
        </div>
      </div>
    </main>

    <script src="../sgea/front-end/js/script.js"></script>
  </body>
</html>
