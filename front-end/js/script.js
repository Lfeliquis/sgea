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
    };

    if (data) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        const responseText = await response.text();
        
        // Debug: Mostra a resposta bruta no console
        console.log('Resposta bruta:', responseText);
        
        try {
            const json = JSON.parse(responseText);
            if (!response.ok) {
                throw new Error(json.message || 'Erro na requisição');
            }
            return json;
        } catch (e) {
            console.error('Falha ao parsear JSON:', e);
            throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}...`);
        }
    } catch (error) {
        console.error(`Erro na requisição ${method} para ${url}:`, error);
        throw error;
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
      // Mostrar estado de carregamento
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Processando...';

      // Obter dados do formulário
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => data[key] = value);

      // Enviar requisição como JSON
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

      // Executar callback de sucesso
      if (onSuccess) onSuccess(result, form);
    } catch (error) {
      console.error('Erro no formulário:', error);
      if (onError) {
        onError(error, form);
      } else {
        alert(error.message || 'Erro ao processar formulário');
      }
    } finally {
      // Restaurar botão
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
          <button class="btn-inscrever" data-id="${evento.id}">Inscrever-se</button>
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
            carregarCertificados();
          } catch (error) {
            alert(error.message || "Erro ao realizar inscrição");
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
  // Configura formulário de evento
  setupFormAJAX(
    'event-form',
    './back-end/cadastrar_evento.php',
    (result, form) => {
        if (result.success) {
            alert(result.message);
            form.reset();
            carregarEventosCoordenador();
        } else {
            throw new Error(result.message);
        }
    },
    (error) => {
        console.error('Erro no formulário:', error);
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
            <div class="event-item">
              <span class="event-title">${evento.nome}</span>
              <span class="event-date">${formatarData(evento.data_inicio)} - ${evento.local}</span>
              <div class="event-actions">
                <button class="btn-editar" data-id="${evento.id}">Editar</button>
                <button class="btn-presenca" data-id="${evento.id}">Presença</button>
              </div>
            </div>
          `).join('')
        : '<p>Nenhum evento cadastrado ainda.</p>';

      // Configura botões de ação
      document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', () => abrirModalEdicao(btn.getAttribute('data-id')));
      });
      
      document.querySelectorAll('.btn-presenca').forEach(btn => {
        btn.addEventListener('click', () => abrirModalPresenca(btn.getAttribute('data-id')));
      });
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      document.querySelector(".event-list").innerHTML = '<p>Erro ao carregar eventos.</p>';
    }
  }

  // Configura botão para gerar código de presença
  const btnGerarCodigo = document.querySelector(".btn-gerar-codigo");
  if (btnGerarCodigo) {
    btnGerarCodigo.addEventListener("click", async () => {
      const eventId = prompt("Para qual evento deseja gerar o código? (Insira o ID)");
      if (!eventId) return;

      try {
        const result = await fetchAPI('./back-end/gerar_codigo_presenca.php', 'POST', { evento_id: eventId });
        alert(`Código de presença gerado: ${result.codigo}\nValidade: ${result.validade}`);
      } catch (error) {
        alert(error.message || "Erro ao gerar código");
      }
    });
  }

  // Carrega lista de presença
  async function carregarPresencas(eventId) {
    try {
      const presencas = await fetchAPI(`./back-end/listar_presencas.php?evento_id=${eventId}`);
      const presencaList = document.querySelector(".presenca-list");
      
      presencaList.innerHTML = presencas.length > 0
        ? presencas.map(presenca => `
            <div class="presenca-item">
              <span>${presenca.nome_aluno}</span>
              <span class="status-presenca confirmado">
                Confirmado em ${formatarDataHora(presenca.data_presenca)}
              </span>
            </div>
          `).join('')
        : '<p>Nenhuma presença registrada ainda.</p>';
    } catch (error) {
      console.error('Erro ao carregar presenças:', error);
      document.querySelector(".presenca-list").innerHTML = '<p>Erro ao carregar presenças.</p>';
    }
  }

  // Abre modal de edição
  async function abrirModalEdicao(eventId) {
    try {
      const evento = await fetchAPI(`./back-end/obter_evento.php?id=${eventId}`);
      
      const modal = document.createElement("div");
      modal.classList.add("modal");
      modal.id = "modal-edicao";
      modal.innerHTML = `
        <div class="modal-content">
          <span class="fechar-modal">&times;</span>
          <h2>Editar Evento</h2>
          <form id="form-edicao" data-id="${eventId}">
            <div class="form-group">
              <input type="text" name="nome" value="${evento.nome}" placeholder="Nome do Evento" required />
            </div>
            
            <div class="form-group">
              <textarea name="descricao" placeholder="Descrição do Evento">${evento.descricao || ''}</textarea>
            </div>

            <div class="form-group">
              <label>Data e Hora de Início:</label>
              <div class="datetime-container">
                <input type="date" name="data_inicio_date" value="${evento.data_inicio.split(' ')[0]}" required />
                <input type="time" name="data_inicio_time" value="${evento.data_inicio.split(' ')[1].substring(0, 5)}" required />
              </div>
            </div>

            <div class="form-group">
              <label>Data e Hora de Término:</label>
              <div class="datetime-container">
                <input type="date" name="data_fim_date" value="${evento.data_fim.split(' ')[0]}" required />
                <input type="time" name="data_fim_time" value="${evento.data_fim.split(' ')[1].substring(0, 5)}" required />
              </div>
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
        `./back-end/editar_evento.php?id=${eventId}`,
        () => {
          alert('Evento atualizado com sucesso!');
          carregarEventosCoordenador();
          fecharModal("modal-edicao");
          modal.remove();
        }
      );
      
      // Configura botão de exclusão
      modal.querySelector(".btn-excluir").addEventListener("click", async () => {
        if (confirm("Tem certeza que deseja excluir este evento?")) {
          try {
            await fetchAPI(`./back-end/excluir_evento.php?id=${eventId}`, 'DELETE');
            alert('Evento excluído com sucesso!');
            carregarEventosCoordenador();
            fecharModal("modal-edicao");
            modal.remove();
          } catch (error) {
            alert(error.message || 'Erro ao excluir evento');
          }
        }
      });
    } catch (error) {
      console.error('Erro ao abrir modal de edição:', error);
      alert('Erro ao carregar dados do evento');
    }
  }

  // Abre modal de presença
  async function abrirModalPresenca(eventId) {
    try {
      const evento = await fetchAPI(`./back-end/obter_evento.php?id=${eventId}`);
      const modal = document.getElementById("modal-presenca");
      
      if (modal) {
        modal.querySelector("h2").textContent = `Presença: ${evento.nome}`;
        abrirModal("modal-presenca");
        await carregarPresencas(eventId);
      }
    } catch (error) {
      console.error('Erro ao abrir modal de presença:', error);
      alert('Erro ao carregar dados de presença');
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