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