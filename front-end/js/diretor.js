// =============================================
// FUNÇÕES ESPECÍFICAS DA PÁGINA DO DIRETOR
// =============================================

if (document.querySelector(".diretor-section")) {
  // Configura formulário de coordenador
  setupFormAJAX(
    'coordenador-form',
    './back-end/cadastrar_coordenador.php',
    (result, form) => {
      alert('Coordenador cadastrado com sucesso!');
      form.reset();
      carregarCoordenadores();
    }
  );

  // Carrega lista de coordenadores
  async function carregarCoordenadores() {
    try {
      const coordenadores = await fetchAPI('./back-end/listar_coordenadores.php');
      const coordenadorList = document.getElementById("coordenador-list");
      
      coordenadorList.innerHTML = coordenadores.length > 0
        ? coordenadores.map(coordenador => `
            <div class="coordenador-item">
              <span>${coordenador.nome} - ${coordenador.email}</span>
              <button class="btn-remover" data-id="${coordenador.id}">Remover</button>
            </div>
          `).join('')
        : '<p>Nenhum coordenador cadastrado ainda.</p>';

      // Configura botões de remoção
      document.querySelectorAll(".btn-remover").forEach(btn => {
        btn.addEventListener("click", async () => {
          const coordenadorId = btn.getAttribute('data-id');
          if (confirm("Tem certeza que deseja remover este coordenador?")) {
            try {
              await fetchAPI(`./back-end/remover_coordenador.php?id=${coordenadorId}`, 'DELETE');
              alert("Coordenador removido com sucesso!");
              carregarCoordenadores();
            } catch (error) {
              alert(error.message || "Erro ao remover coordenador");
            }
          }
        });
      });
    } catch (error) {
      console.error('Erro ao carregar coordenadores:', error);
      document.getElementById("coordenador-list").innerHTML = '<p>Erro ao carregar coordenadores.</p>';
    }
  }

  // Carregar dados ao iniciar
  window.addEventListener('DOMContentLoaded', carregarCoordenadores);
}