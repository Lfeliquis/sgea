// =============================================
// FUNÇÕES ESPECÍFICAS DA PÁGINA DO COORDENADOR
// =============================================

if (document.querySelector(".coordenador-section")) {
  // Configura formulário de cadastro de evento
  setupFormAJAX(
    'event-form',
    './back-end/cadastrar_evento.php',
    (result, form) => {
      if (result.success) {
        alert('Evento cadastrado com sucesso!');
        form.reset();
        carregarEventosCoordenador();
      } else {
        throw new Error(result.message || 'Erro ao cadastrar evento');
      }
    },
    (error) => {
      alert(error.message);
    }
  );

  // Carrega eventos do coordenador
  async function carregarEventosCoordenador() {
    try {
      const eventos = await fetchAPI('./back-end/listar_eventos_coordenador.php');
      const eventList = document.querySelector(".event-list");
      
      eventList.innerHTML = eventos.length > 0
        ? eventos.map(evento => `
            <div class="event-item" data-id="${evento.id}">
              <h3>${evento.nome}</h3>
              ${evento.descricao ? `<p class="event-desc">${evento.descricao}</p>` : ''}
              <p><strong>Local:</strong> ${evento.local}</p>
              <p><strong>Início:</strong> ${formatarData(evento.data_inicio)}</p>
              <p><strong>Término:</strong> ${formatarData(evento.data_fim)}</p>
              <div class="event-actions">
                <button class="btn-editar">Editar</button>
                <button class="btn-presenca">Presença</button>
              </div>
            </div>
          `).join('')
        : '<p class="no-events">Nenhum evento cadastrado ainda.</p>';

      // Configura botões de ação
      document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
          const eventId = this.closest('.event-item').getAttribute('data-id');
          abrirModalEdicao(eventId);
        });
      });
      
      document.querySelectorAll('.btn-presenca').forEach(btn => {
        btn.addEventListener('click', function() {
          const eventId = this.closest('.event-item').getAttribute('data-id');
          abrirModalPresenca(eventId);
        });
      });
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      document.querySelector(".event-list").innerHTML = '<p class="error">Erro ao carregar eventos: ' + error.message + '</p>';
    }
  }

  // Abre modal de edição
  async function abrirModalEdicao(eventId) {
    try {
        const evento = await fetchAPI(`./back-end/obter_evento.php?id=${eventId}`);
        
        // Formata as datas para o input datetime-local
        const formatarParaInputDatetime = (datetime) => {
            if (!datetime) return '';
            const date = new Date(datetime);
            // Ajusta para o fuso horário local
            const tzOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
            return localISOTime;
        };

        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.id = "modal-edicao";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="fechar-modal">&times;</span>
                <h2>Editar Evento</h2>
                <form id="form-edicao">
                    <input type="hidden" name="id" value="${eventId}">
                    <div class="form-group">
                        <input type="text" name="nome" value="${evento.nome}" placeholder="Nome do Evento" required />
                    </div>
                    
                    <div class="form-group">
                        <textarea name="descricao" placeholder="Descrição do Evento">${evento.descricao || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="data_inicio">Data e Hora de Início:</label>
                        <input type="datetime-local" name="data_inicio" value="${formatarParaInputDatetime(evento.data_inicio)}" required />
                    </div>

                    <div class="form-group">
                        <label for="data_fim">Data e Hora de Término:</label>
                        <input type="datetime-local" name="data_fim" value="${formatarParaInputDatetime(evento.data_fim)}" required />
                    </div>

                    <div class="form-group">
                        <input type="text" name="local" value="${evento.local}" placeholder="Local do Evento" required />
                    </div>

                    <button type="submit" class="btn">Salvar Alterações</button>
                    <button type="button" class="btn btn-excluir">Excluir Evento</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        abrirModal("modal-edicao");
        
        // Configura eventos do modal
        modal.querySelector(".fechar-modal").addEventListener("click", () => {
            fecharModal("modal-edicao");
            modal.remove();
        });
        
        // Configura form de edição
        setupFormAJAX(
            'form-edicao',
            './back-end/editar_evento.php',
            (result) => {
                if (result.success) {
                    alert('Evento atualizado com sucesso!');
                    carregarEventosCoordenador();
                    fecharModal("modal-edicao");
                    modal.remove();
                } else {
                    throw new Error(result.message || 'Erro ao atualizar evento');
                }
            },
            (error) => {
                alert(error.message);
            }
        );
        
        // Configura botão de exclusão
        modal.querySelector(".btn-excluir").addEventListener("click", async () => {
            if (confirm("Tem certeza que deseja excluir este evento?")) {
                try {
                    const result = await fetchAPI('./back-end/excluir_evento.php', 'POST', { id: eventId });
                    if (result.success) {
                        alert('Evento excluído com sucesso!');
                        carregarEventosCoordenador();
                        fecharModal("modal-edicao");
                        modal.remove();
                    } else {
                        throw new Error(result.message || 'Erro ao excluir evento');
                    }
                } catch (error) {
                    alert(error.message || 'Erro ao excluir evento');
                }
            }
        });
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        alert('Erro ao carregar dados do evento: ' + error.message);
    }
  }

  // Abre modal de presença
  async function abrirModalPresenca(eventId) {
    try {
      const evento = await fetchAPI(`./back-end/obter_evento.php?id=${eventId}`);
      const modal = document.getElementById("modal-presenca");
      
      if (modal) {
        modal.querySelector("h2").textContent = `Lista de Presença: ${evento.nome}`;
        abrirModal("modal-presenca");
        
        // Carrega a lista de presença
        try {
          const presencas = await fetchAPI(`./back-end/listar_presencas.php?evento_id=${eventId}`);
          const presencaList = modal.querySelector(".presenca-list");
          
          presencaList.innerHTML = presencas.length > 0
            ? presencas.map(presenca => `
                <div class="presenca-item">
                  <span>${presenca.nome_aluno}</span>
                  <span class="status-presenca confirmado">
                    Confirmado em ${formatarData(presenca.data_presenca)}
                  </span>
                </div>
              `).join('')
            : '<p>Nenhuma presença registrada ainda.</p>';
        } catch (error) {
          console.error('Erro ao carregar presenças:', error);
          modal.querySelector(".presenca-list").innerHTML = '<p class="error">Erro ao carregar presenças: ' + error.message + '</p>';
        }
      }
    } catch (error) {
      console.error('Erro ao abrir modal de presença:', error);
      alert('Erro ao carregar dados de presença: ' + error.message);
    }
  }

  // Carregar dados ao iniciar
  window.addEventListener('DOMContentLoaded', carregarEventosCoordenador);
}