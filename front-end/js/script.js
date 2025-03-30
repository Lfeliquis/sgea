// Funções da Página de Login
const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

if (registerBtn && loginBtn) {
  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
  });

  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
  });
}

// Funções da Página do Aluno
if (document.querySelector(".aluno-section")) {
  // Simulação de dados de eventos e certificados
  const eventos = [
    {
      nome: "Workshop de Programação",
      data: "2023-11-15",
      local: "Auditório Principal",
    },
    { nome: "Palestra sobre IA", data: "2023-11-20", local: "Sala 101" },
  ];

  const certificados = [
    { evento: "Workshop de Programação", data: "2023-11-15", codigo: "ABC123" },
  ];

  // Função para carregar eventos na página
  function carregarEventos() {
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = ""; // Limpa a lista antes de carregar
    eventos.forEach((evento) => {
      const eventItem = document.createElement("div");
      eventItem.classList.add("event-item");
      eventItem.innerHTML = `
        <span>${evento.nome} - ${evento.data} - ${evento.local}</span>
        <button class="btn-inscrever">Inscrever-se</button>
      `;
      eventList.appendChild(eventItem);
    });

    // Adiciona eventos de clique aos botões de inscrição
    const btnInscrever = document.querySelectorAll(".btn-inscrever");
    btnInscrever.forEach((btn) => {
      btn.addEventListener("click", () => {
        alert("Inscrição realizada com sucesso!");
      });
    });
  }

  // Função para carregar certificados na página
  function carregarCertificados() {
    const certificateList = document.getElementById("certificate-list");
    certificateList.innerHTML = ""; // Limpa a lista antes de carregar
    certificados.forEach((certificado) => {
      const certificateItem = document.createElement("div");
      certificateItem.classList.add("certificate-item");
      certificateItem.innerHTML = `
        <span>${certificado.evento} - ${certificado.data}</span>
        <button class="btn-download">Baixar Certificado</button>
      `;
      certificateList.appendChild(certificateItem);
    });

    // Adiciona eventos de clique aos botões de download
    const btnDownload = document.querySelectorAll(".btn-download");
    btnDownload.forEach((btn) => {
      btn.addEventListener("click", () => {
        alert("Certificado baixado com sucesso!");
      });
    });
  }

  // Evento para confirmar presença
  const btnConfirmar = document.querySelector(".btn-confirmar");
  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
      const codigo = prompt("Digite o código de presença:");
      if (codigo) {
        alert("Presença confirmada com sucesso!");
      } else {
        alert("Código inválido. Tente novamente.");
      }
    });
  }

  // Carregar dados ao abrir a página
  window.onload = () => {
    carregarEventos();
    carregarCertificados();
  };
}

// Funções da Página do Coordenador
if (document.querySelector(".coordenador-section")) {
  // Função para cadastrar evento
  const eventForm = document.getElementById("event-form");
  if (eventForm) {
    eventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.querySelector(
        '#event-form input[type="text"]'
      ).value;
      const data = document.querySelector(
        '#event-form input[type="date"]'
      ).value;
      const local = document.querySelector(
        '#event-form input[type="text"]'
      ).value;
      const inicio = document.querySelector(
        '#event-form input[type="time"]'
      ).value;
      const fim = document.querySelector(
        '#event-form input[type="time"]'
      ).value;

      if (nome && data && local && inicio && fim) {
        alert(`Evento "${nome}" cadastrado com sucesso!`);
        eventForm.reset(); // Limpa o formulário após o cadastro
      } else {
        alert("Preencha todos os campos do formulário!");
      }
    });
  }

  // Função para gerar código de presença
  const btnGerarCodigo = document.querySelector(".btn-gerar-codigo");
  if (btnGerarCodigo) {
    btnGerarCodigo.addEventListener("click", () => {
      const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
      alert(`Código de presença gerado: ${codigo}`);
    });
  }
}

// Funções da Página do Diretor
if (document.querySelector(".diretor-section")) {
  // Função para cadastrar coordenador
  const coordenadorForm = document.getElementById("coordenador-form");
  if (coordenadorForm) {
    coordenadorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.querySelector(
        '#coordenador-form input[type="text"]'
      ).value;
      const email = document.querySelector(
        '#coordenador-form input[type="email"]'
      ).value;
      const senha = document.querySelector(
        '#coordenador-form input[type="password"]'
      ).value;

      if (nome && email && senha) {
        alert(`Coordenador "${nome}" cadastrado com sucesso!`);
        coordenadorForm.reset(); // Limpa o formulário após o cadastro
      } else {
        alert("Preencha todos os campos do formulário!");
      }
    });
  }

  // Simulação de lista de coordenadores
  const coordenadores = [
    { nome: "João Silva", email: "joao@example.com" },
    { nome: "Maria Oliveira", email: "maria@example.com" },
  ];

  // Função para carregar coordenadores na página
  function carregarCoordenadores() {
    const coordenadorList = document.getElementById("coordenador-list");
    coordenadorList.innerHTML = ""; // Limpa a lista antes de carregar
    coordenadores.forEach((coordenador) => {
      const coordenadorItem = document.createElement("div");
      coordenadorItem.classList.add("coordenador-item");
      coordenadorItem.innerHTML = `
        <span>${coordenador.nome} - ${coordenador.email}</span>
        <button class="btn-remover">Remover</button>
      `;
      coordenadorList.appendChild(coordenadorItem);
    });

    // Adiciona eventos de clique aos botões de remoção
    const btnRemover = document.querySelectorAll(".btn-remover");
    btnRemover.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".coordenador-item");
        item.remove();
        alert("Coordenador removido com sucesso!");
      });
    });
  }

  // Carregar dados ao abrir a página
  window.onload = () => {
    carregarCoordenadores();
  };
}

// Funções para abrir e fechar modais
function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
  }
}

function fecharModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// Fechar modais ao clicar no botão de fechar
document.querySelectorAll(".fechar-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal");
    if (modal) {
      modal.style.display = "none";
    }
  });
});

// Fechar modais ao clicar fora do conteúdo
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Adicionar eventos aos botões que abrem modais
document.querySelectorAll(".btn-editar").forEach((btn) => {
  btn.addEventListener("click", () => {
    abrirModal("modal-editar");
  });
});

document.querySelectorAll(".btn-presenca").forEach((btn) => {
  btn.addEventListener("click", () => {
    abrirModal("modal-presenca");
  });
});
