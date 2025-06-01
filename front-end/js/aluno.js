// =============================================
// FUNÇÕES ESPECÍFICAS DA PÁGINA DO ALUNO
// =============================================

if (document.querySelector(".aluno-section")) {
  // Carrega eventos do servidor
  async function carregarEventos() {
    try {
        const eventos = await fetchAPI('./back-end/listar_eventos.php');
        const eventList = document.getElementById("event-list");
        
        eventList.innerHTML = eventos.map(evento => `
            <div class="event-item">
                <span class="event-title">${evento.nome}</span>
                <span class="event-date">${formatarData(evento.data_inicio)} - ${evento.local}</span>
                <span class="event-coord">Coordenador: ${evento.coordenador_nome}</span>
                <div class="event-actions">
                    <button class="btn-inscrever" data-id="${evento.id}">Inscrever-se</button>
                    <button class="btn-confirmar-evento" data-id="${evento.id}">Confirmar Presença</button>
                </div>
            </div>
        `).join('');

        // Configura eventos de inscrição
        document.querySelectorAll(".btn-inscrever").forEach(btn => {
            btn.addEventListener("click", async () => {
                const eventId = btn.getAttribute('data-id');
                try {
                    const result = await fetchAPI('./back-end/inscrever_evento.php', 'POST', { evento_id: eventId });
                    alert("Inscrição realizada com sucesso!");
                    carregarEventos();
                } catch (error) {
                    alert(error.message || "Erro ao realizar inscrição");
                }
            });
        });

        // Configura eventos de confirmação de presença
        document.querySelectorAll(".btn-confirmar-evento").forEach(btn => {
            btn.addEventListener("click", async () => {
                const eventId = btn.getAttribute('data-id');
                const codigo = prompt("Digite o código de presença fornecido pelo coordenador:");
                
                if (!codigo) {
                    alert("Por favor, insira um código válido.");
                    return;
                }

                try {
                    const result = await fetchAPI('./back-end/confirmar_presenca.php', 'POST', { codigo: codigo.trim() });
                    alert(result.message || "Presença confirmada com sucesso!");
                    carregarCertificados();
                } catch (error) {
                    alert(error.message || "Erro ao confirmar presença");
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        document.getElementById("event-list").innerHTML = '<p>Erro ao carregar eventos. Tente novamente.</p>';
    }
  }

  // Carrega certificados do servidor
  async function carregarCertificados() {
    try {
      const certificados = await fetchAPI('./back-end/listar_certificados.php');
      const certificateList = document.getElementById("certificate-list");
      
      certificateList.innerHTML = certificados.length > 0 
        ? certificados.map(cert => `
            <div class="certificate-item">
              <span>${cert.evento_nome} - ${formatarData(cert.data_emissao)}</span>
              <a href="${cert.link_certificado}" class="btn-download" download>Baixar Certificado</a>
            </div>
          `).join('')
        : '<p>Nenhum certificado disponível ainda.</p>';
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      document.getElementById("certificate-list").innerHTML = '<p>Erro ao carregar certificados.</p>';
    }
  }

  // Configura botão de confirmar presença
  const btnConfirmar = document.querySelector(".btn-confirmar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", async () => {
      const codigo = prompt("Digite o código de presença:");
      if (!codigo) {
        alert("Por favor, insira um código válido.");
        return;
      }

      try {
        const result = await fetchAPI('./back-end/confirmar_presenca.php', 'POST', { codigo: codigo.trim() });
        alert(result.message || "Presença confirmada com sucesso!");
        carregarCertificados();
      } catch (error) {
        alert(error.message || "Erro ao confirmar presença");
      }
    });
  }

  // Carregar dados ao iniciar
  window.addEventListener('DOMContentLoaded', () => {
    carregarEventos();
    carregarCertificados();
  });
}