// =============================================
// FUNÇÕES GERAIS E UTILITÁRIOS
// =============================================

// Funções para manipulação de modais
function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function fecharModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Fechar modais ao clicar no botão de fechar ou fora
document.querySelectorAll(".fechar-modal").forEach((btn) => {
  btn.addEventListener("click", function() {
    const modal = this.closest(".modal");
    if (modal) fecharModal(modal.id);
  });
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal(modal.id);
  });
});

// Funções auxiliares de formatação
function formatarData(dataString) {
  if (!dataString) return '';
  const data = new Date(dataString);
  return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatarDataHora(dataString) {
  if (!dataString) return '';
  const data = new Date(dataString);
  return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// =============================================
// FUNÇÕES AJAX GENÉRICAS
// =============================================

/**
 * Função AJAX genérica para requisições HTTP
 * @param {string} url - Endpoint da API
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Dados a serem enviados (opcional)
 * @returns {Promise} - Promise com a resposta da requisição
 */

async function fetchAPI(url, method = 'GET', data = null) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' // Adicione isso se estiver usando sessões/cookies
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Tenta obter a mensagem de erro do corpo da resposta
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição ${method} para ${url}:`, error);
    throw new Error(error.message || 'Erro na comunicação com o servidor');
  }
}

/**
 * Manipulador de formulários com AJAX
 * @param {string} formId - ID do formulário
 * @param {string} endpoint - URL do endpoint
 * @param {function} onSuccess - Callback para sucesso
 * @param {function} onError - Callback para erro (opcional)
 */
function setupFormAJAX(formId, endpoint, onSuccess, onError = null) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Processando...';

      // Coleta todos os dados do formulário, incluindo o campo hidden id
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => data[key] = value);

      console.log('Dados sendo enviados:', data); // Adicione este log para depuração

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro na requisição');
      }

      if (onSuccess) onSuccess(result, form);
    } catch (error) {
      console.error('Erro no formulário:', error);
      if (onError) {
        onError(error, form);
      } else {
        alert(error.message || 'Erro ao processar formulário');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

// =============================================
// FUNÇÕES ESPECÍFICAS DA PÁGINA DE LOGIN
// =============================================

const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

if (registerBtn && loginBtn) {
  registerBtn.addEventListener("click", () => container.classList.add("active"));
  loginBtn.addEventListener("click", () => container.classList.remove("active"));
}

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
                    <button class="btn-confirmar-evento" data-id="${evento.id}">Confirmar Presença</button>
                </div>
            </div>
        `).join('');

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