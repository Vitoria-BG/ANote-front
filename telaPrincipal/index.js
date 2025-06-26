window.addEventListener("DOMContentLoaded", async () => {
  let usuarioJSON = localStorage.getItem("usuario");

  if (!usuarioJSON) {
    alert("Usuário não logado.");
    window.location.href = "../formularios/login.html"; // Redireciona se não estiver logado
    return;
  }

  let usuario = JSON.parse(usuarioJSON);

  usuario = await verificarLogin(usuario);
  if (!usuario) return;
  // Exibe o nome do usuário
  document.getElementById("username").textContent = `Olá, ${usuario.nome}!`;
  renderizarCadernos(usuario.cadernos);
  renderizarAnotacoesSoltas(usuario.anotacoes, usuario.cadernos);
});

const coresTag = {
  VERMELHO: "#FF0000",
  VERDE: "#00CC00",
  AZUL: "#007BFF",
  AMARELO: "#FFD700",
  CIANO: "#00FFFF",
  MAGENTA: "#FF00FF",
  LARANJA: "#FFA500",
  ROSA: "#FFC0CB",
  MARROM: "#8B4513",
  CINZA: "#808080",
  PRETO: "#000000",
  BRANCO: "#FFFFFF",
};

function mapearCor(nome) {
  const cores = {
    VERMELHO: "#ff4d4d",
    VERDE: "#28a745",
    AZUL: "#007bff",
    AMARELO: "#ffc107",
    CIANO: "#17a2b8",
    MAGENTA: "#e83e8c",
    LARANJA: "#fd7e14",
    ROSA: "#f78fb3",
    MARROM: "#795548",
    CINZA: "#6c757d",
    PRETO: "#343a40",
    BRANCO: "#ffffff",
  };
  return cores[nome?.toUpperCase()] || "#000";
}

function criarPaletaDeCores() {
  const cores = Object.entries(coresTag); // pega nome e hex
  const container = document.getElementById("colorPalette");
  container.innerHTML = "";

  cores.forEach(([nome, cor]) => {
    const bolinha = document.createElement("div");
    bolinha.classList.add("cor-opcao");
    bolinha.style.backgroundColor = cor;
    bolinha.title = nome;

    bolinha.addEventListener("click", () => {
      document
        .querySelectorAll(".cor-opcao")
        .forEach((el) => el.classList.remove("selecionada"));
      bolinha.classList.add("selecionada");
      bolinha.setAttribute("data-cor", nome); // salva o nome da cor
    });

    container.appendChild(bolinha);
  });

  document.getElementById("saveTag").addEventListener("click", () => {
    const nome = document.getElementById("tagName").value.trim();
    const selecionada = document.querySelector(".cor-opcao.selecionada");

    if (!nome || !selecionada) {
      alert("Preencha o nome e escolha uma cor.");
      return;
    }

    const cor = selecionada.title;
    criarTag(nome, cor);
  });
}
function aplicarCorDaTag(anotacao, elementoDiv) {
  if (anotacao.tags && anotacao.tags.length > 0) {
    if (anotacao.tags[0].cor != null) {
      const tag = anotacao.tags[0]; // usa a primeira tag
      const corHex = coresTag[tag.cor] || "#000"; // fallback preto se não encontrada
      elementoDiv.style.color = `${corHex}`;
    } else {
      elementoDiv.style.color = `#000`;
    }
  } else {
    elementoDiv.style.color = `#000`;
  }
}

function aplicarBackgroundColorDaTag(anotacao, elementoDiv) {
  if (anotacao.tags && anotacao.tags.length > 0) {
    if (anotacao.tags[0].cor != null) {
      const tag = anotacao.tags[0]; // usa a primeira tag
      const corHex = coresTag[tag.cor] || "#fff"; // fallback preto se não encontrada
      elementoDiv.style.backgroundColor = `${corHex}`;
    } else {
      elementoDiv.style.backgroundColor = `#fff`;
    }
  } else {
    elementoDiv.style.backgroundColor = `#fff`;
  }
}

async function verificarLogin(usuarioAtual) {
  try {
    const response = await fetch(
      "http://localhost:8080/usuarios/" + usuarioAtual.id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const usuario = await response.json();
    console.log(usuario);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    return usuario;
  } catch (err) {
    alert(err.message);
  }
}

function renderizarCadernos(cadernos) {
  const lista = document.getElementById("listaCaderno");
  lista.innerHTML = "";

  cadernos.forEach((caderno, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <div class="caderno-item listaAnotacao" onclick="toggleAnotacoesCaderno(${index})" style="color: ${mapearCor(
      caderno.tags && caderno.tags[0]?.cor
    )}">
             "    ${caderno.titulo}
            </div>
            <button id="criarAnotacoes-caderno-${index}" class="action buttonSalvarCaderno toggleAnotacao hidden">
                + Criar anotação
            </button>
            <ul id="anotacoes-caderno-${index}" class="anotacoes-caderno hidden"></ul>
            
            <button id="editarAnotacoes-caderno-${index}" class="toggleAnotacao buttonEditarCaderno hidden">
                Editar
            </button>
            <button id="excluirAnotacoes-caderno-${index}" class=" toggleAnotacao buttonExcluirCaderno hidden">
                Excluir
            </button>
          `;
    lista.appendChild(li);
    const toggleBtn = li.querySelector(".toggleAnotacao");
    toggleBtn.addEventListener("click", () => {
      toggleAnotacao(caderno);
    });
    document
      .getElementById("editarAnotacoes-caderno-" + index)
      .addEventListener("click", () => {
        editarCaderno(caderno);
      });
    document
      .getElementById("excluirAnotacoes-caderno-" + index)
      .addEventListener("click", () => {
        excluirCaderno(caderno);
      });
    const listaAnotacao = document.getElementById("anotacoes-caderno-" + index);
    listaAnotacao.innerHTML = "";
    caderno.anotacoes.forEach((anotacao) => {
      const liAnotacao = document.createElement("ul");
      liAnotacao.textContent = anotacao.titulo;
      liAnotacao.onclick = () => abrirAnotacao(caderno, anotacao);
      listaAnotacao.appendChild(liAnotacao);
    });
  });
}
function toggleAnotacoesCaderno(index) {
  document
    .getElementById("anotacoes-caderno-" + index)
    .classList.toggle("hidden");
  document
    .getElementById("criarAnotacoes-caderno-" + index)
    .classList.toggle("hidden");
  document
    .getElementById("editarAnotacoes-caderno-" + index)
    .classList.toggle("hidden");
  document
    .getElementById("excluirAnotacoes-caderno-" + index)
    .classList.toggle("hidden");
}

function renderizarAnotacoesSoltas(anotacoes, cadernos) {
  let copia = 0;
  const lista = document.getElementById("listaAnotacao");
  lista.innerHTML = "";

  anotacoes.forEach((anotacao) => {
    copia = 0;
    cadernos.forEach((caderno) => {
      caderno.anotacoes.forEach((anotacaoCaderno) => {
        if (anotacao.id === anotacaoCaderno.id) {
          copia = 1;
          return;
        }
      });
      if (copia == 1) {
        return;
      }
    });
    if (copia == 1) {
      return;
    }
    const li = document.createElement("li");
    li.textContent = anotacao.titulo;
    li.classList.add("listaAnotacao");
    li.onclick = () => abrirAnotacao(null, anotacao);
    lista.appendChild(li);
  });
}
function abrirAnotacao(caderno, anotacao) {
  const container = document.getElementById("conteudoPrincipal");
  container.classList.remove("main-content");
  container.classList.add("main-contentAnotacao");
  container.innerHTML = `
        <h1>${anotacao.titulo}</h1>
          <button class="buttonExcluirAnotacao" id="btnExcluir">Excluir</button>
          <button class="buttonEditarAnotacao" id="btnEditar">Editar</button>
          <button class="buttonSalvarAnotacao" id="btnSalvar">Salvar</button>
          <div class="tagList" id="tagList">
    ${
      caderno
        ? caderno.tags
            .map(
              (tag) =>
                `<span class="tag" data-tag-id="${
                  tag.id
                }" style="background-color: ${mapearCor(tag.cor)}">${
                  tag.nome
                }</span>`
            )
            .join("")
        : `<span></span>`
    }
      ${anotacao.tags
        .map(
          (tag) =>
            `<span class="tag" data-tag-id-anotacao="${
              tag.id
            }" style="background-color: ${mapearCor(tag.cor)}">${
              tag.nome
            }</span>`
        )
        .join("")}
  </div>
        <textarea id="corpoAnotacao" class="textoAnotacoes">${
          anotacao.corpo
        }</textarea>
    `;
  if (caderno != null) {
    aplicarBackgroundColorDaTag(caderno, container);
  }
  aplicarCorDaTag(anotacao, container);
  document.getElementById("btnSalvar").addEventListener("click", () => {
    salvarAnotacao(caderno, anotacao, null);
  });

  document.getElementById("btnEditar").addEventListener("click", () => {
    editarAnotacao(caderno, anotacao);
  });

  document.getElementById("btnExcluir").addEventListener("click", () => {
    excluirAnotacao(anotacao);
  });

  if (caderno != null) {
    document.querySelectorAll(".tag[data-tag-id]").forEach((tag) => {
      tag.addEventListener("click", () => {
        console.log(tag.dataset);
        const confirmar = confirm("Remover esta tag do caderno?");
        if (!confirmar) return;
        excluirTagCaderno(caderno, tag);
      });
    });
  }
  document.querySelectorAll(".tag[data-tag-id-anotacao]").forEach((tag) => {
    tag.addEventListener("click", () => {
      console.log(tag.dataset);
      const confirmar = confirm("Remover esta tag da anotação?");
      if (!confirmar) return;
      excluirTagAnotacao(anotacao, tag);
    });
  });
}
function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "../formularios/login.html"; // ou a URL da sua tela de login
}
function noHiddenAnotacao() {
  document.getElementById("anotacaoHidden").classList.toggle("hidden");
}
function noHiddenCaderno() {
  document.getElementById("cadernoHidden").classList.toggle("hidden");
}
function noHiddenEditarAnotacao() {
  document.getElementById("editarAnotacao").classList.toggle("hidden");
}
function noHiddenEditarCaderno() {
  document.getElementById("editarCaderno").classList.toggle("hidden");
}

function criarCaderno() {
  let container = document.getElementsByClassName("form-containerC");
  if (container.display === "none") {
    container.display = "flex";
  } else {
    container.display = "none";
  }
}

async function excluirTagAnotacao(anotacao, tag) {
  try {
    const response = await fetch(
      "http://localhost:8080/anotacoes/" +
        anotacao.id +
        "/tags/" +
        tag.dataset.tagIdAnotacao,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.href = "../telaPrincipal/telaPrincipal.html";
  } catch (err) {
    alert(err.message);
  }
}

async function excluirTagCaderno(caderno, tag) {
  try {
    const response = await fetch(
      "http://localhost:8080/cadernos/" +
        caderno.id +
        "/tags/" +
        tag.dataset.tagId,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.href = "../telaPrincipal/telaPrincipal.html";
  } catch (err) {
    alert(err.message);
  }
}

async function excluirAnotacao(anotacao) {
  try {
    const response = await fetch(
      "http://localhost:8080/anotacoes/" + anotacao.id,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.href = "../telaPrincipal/telaPrincipal.html";
  } catch (err) {
    alert(err.message);
  }
}

async function excluirCaderno(caderno) {
  try {
    const response = await fetch(
      "http://localhost:8080/cadernos/" + caderno.id,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    window.location.href = "../telaPrincipal/telaPrincipal.html";
  } catch (err) {
    alert(err.message);
  }
}
function salvarEdicaoAnotacao(caderno, anotacao) {
  let nomeAnotacao = document.getElementById("tituloAnotacaoEditar").value;
  salvarAnotacao(caderno, anotacao, nomeAnotacao);
}
async function getTags() {
  try {
    const response = await fetch("http://localhost:8080/tags", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const tags = await response.json();
    console.log(tags);
    return tags;
  } catch (err) {
    alert(err.message);
  }
}
async function salvarEdicaoAnotacaoTag(caderno, anotacao) {
  let tags = await getTags();
  const container = document.getElementById("existingTags");
  container.innerHTML = "";
  let tagsSelecionadas = [];
  tags.forEach((tag) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <span id="${
              tag.id
            }" class="tag" style="background-color: ${mapearCor(tag.cor)}">${
      tag.nome
    }</span>
          `;
    container.appendChild(li);
    let tagAtual = document.getElementById(tag.id);
    tagAtual.addEventListener("click", () => {
      const index = tagsSelecionadas.indexOf(tag);
      if (index === -1) {
        tagAtual.style.filter = `brightness(0.6)`;
        tagsSelecionadas.push(tag);
      } else {
        tagAtual.style.filter = `brightness(1)`;
        tagsSelecionadas = tagsSelecionadas.filter((item) => item !== tag);
      }
    });
  });
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("buttonEditarAnotacao");
  button.textContent = "Adicionar a Anotação";
  container.appendChild(button);
  button.addEventListener("click", () => {
    tagsSelecionadas.forEach((tag) => {
      salvarAnotacaoTag(anotacao, tag);
    });
  });
}

function editarAnotacao(caderno, anotacao) {
  noHiddenEditarAnotacao();
  document.getElementById("btnEditarAnotacao").addEventListener("click", () => {
    salvarEdicaoAnotacao(caderno, anotacao);
  });
  document.getElementById("openTagBox").addEventListener("click", () => {
    toggleTag();
    salvarEdicaoAnotacaoTag(caderno, anotacao);
  });
}

async function salvarAnotacaoTag(anotacao, tag) {
  try {
    const response = await fetch(
      "http://localhost:8080/anotacoes/" + anotacao.id + "/tags/" + tag.id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
    return data;
  } catch (err) {
    alert(err.message);
  }
}
async function salvarAnotacao(caderno, anotacao, nomeAnotacao) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  let texto = document.getElementById("corpoAnotacao").value;
  let cadernoId = null;
  const userID = usuario.id;
  if (nomeAnotacao == null || nomeAnotacao == "") {
    nomeAnotacao = anotacao.titulo;
  }
  if (caderno != null) {
    cadernoId = caderno.id;
  }
  try {
    const response = await fetch(
      "http://localhost:8080/anotacoes/" + anotacao.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: nomeAnotacao,
          corpo: texto,
          usuarioId: userID,
          cadernoId: cadernoId,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
    return data;
  } catch (err) {
    alert(err.message);
  }
}
function salvarEdicaoCaderno(caderno) {
  let nomeCaderno = document.getElementById("tituloCadernoEditar").value;
  salvarCaderno(caderno, nomeCaderno);
}

function editarCaderno(caderno, anotacao) {
  noHiddenEditarCaderno();
  document.getElementById("btnEditarCaderno").addEventListener("click", () => {
    salvarEdicaoCaderno(caderno, anotacao);
  });
  document.getElementById("openTagBoxCaderno").addEventListener("click", () => {
    document.getElementById("tagBoxCaderno").classList.toggle("hidden");
    salvarEdicaoCadernoTag(caderno);
  });

  document.getElementById("tagBoxCaderno").addEventListener("dblclick", () => {
    document.getElementById("tagCreatorCaderno").classList.toggle("hidden");
    criarPaletaDeCoresCaderno();
  });
}
async function salvarCaderno(caderno, nomeCaderno) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const userID = usuario.id;
  if (nomeCaderno == null || nomeCaderno == "") {
    nomeCaderno = caderno.titulo;
  }
  try {
    const response = await fetch(
      "http://localhost:8080/cadernos/" + caderno.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: nomeCaderno,
          usuarioId: userID,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
    return data;
  } catch (err) {
    alert(err.message);
  }
}
function toggleAnotacao(caderno) {
  document.getElementById("criarAnotacao").classList.toggle("hidden");
  document.getElementById("btnSalvarAnotacao").addEventListener("click", () => {
    criarAnotacao(caderno);
  });
}
function toggleTag() {
  document.getElementById("tagBox").classList.toggle("hidden");
}

function toggleCriarTag() {
  document.getElementById("tagCreator").classList.toggle("hidden");
  criarPaletaDeCores();
}
function toggleCriarTagCaderno() {
  document.getElementById("tagCreatorCaderno").classList.toggle("hidden");
  criarPaletaDeCoresCaderno();
}
function toggleCaderno() {
  document.getElementById("criarCaderno").classList.toggle("hidden");
}
async function salvarEdicaoCadernoTag(caderno) {
  const tags = await getTags();
  const container = document.getElementById("existingTagsCaderno");
  container.innerHTML = "";
  let tagsSelecionadas = [];

  tags.forEach((tag) => {
    const li = document.createElement("li");
    li.innerHTML = `<span id="caderno-tag-${
      tag.id
    }" class="tag" style="background-color: ${mapearCor(tag.cor)}">${
      tag.nome
    }</span>`;
    container.appendChild(li);

    const tagElement = document.getElementById(`caderno-tag-${tag.id}`);
    tagElement.addEventListener("click", () => {
      const index = tagsSelecionadas.indexOf(tag);
      if (index === -1) {
        tagElement.style.filter = `brightness(0.6)`;
        tagsSelecionadas.push(tag);
      } else {
        tagElement.style.filter = `brightness(1)`;
        tagsSelecionadas = tagsSelecionadas.filter((t) => t.id !== tag.id);
      }
    });
  });

  const btn = document.createElement("button");
  btn.textContent = "Adicionar ao Caderno";
  btn.classList.add("buttonEditarCaderno");
  btn.addEventListener("click", () => {
    tagsSelecionadas.forEach((tag) => salvarTagNoCaderno(caderno, tag));
  });
  container.appendChild(btn);
}
async function salvarTagNoCaderno(caderno, tag) {
  try {
    const response = await fetch(
      `http://localhost:8080/cadernos/${caderno.id}/tags/${tag.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) throw new Error(`Erro ao salvar tag no caderno`);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
  } catch (err) {
    alert(err.message);
  }
}

function criarPaletaDeCoresCaderno() {
  const container = document.getElementById("colorPaletteCaderno");
  container.innerHTML = "";
  Object.entries(coresTag).forEach(([nome, cor]) => {
    const circle = document.createElement("div");
    circle.classList.add("cor-opcao");
    circle.style.backgroundColor = cor;
    circle.title = nome;

    circle.addEventListener("click", () => {
      document
        .querySelectorAll(".cor-opcao")
        .forEach((el) => el.classList.remove("selecionada"));
      circle.classList.add("selecionada");
    });

    container.appendChild(circle);
  });

  document
    .getElementById("saveTagCaderno")
    .addEventListener("click", async () => {
      const nome = document.getElementById("tagNameCaderno").value;
      const selecionada = document.querySelector(
        "#colorPaletteCaderno .selecionada"
      );
      if (!nome || !selecionada) return alert("Preencha todos os campos");

      await criarTag(nome, selecionada.title);
    });
}
async function criarAnotacao(caderno) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  let title = document.getElementById("tituloAnotacao").value;
  let cadernoId = null;
  const userID = usuario.id;
  if (caderno != null) {
    cadernoId = caderno.id;
  }
  try {
    const response = await fetch("http://localhost:8080/anotacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: title,
        corpo: null,
        usuarioId: userID,
        cadernoId: cadernoId,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
    return data;
  } catch (err) {
    alert(err.message);
  }
}

async function criarCaderno() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  let title = document.getElementById("tituloCaderno").value;
  const userID = usuario.id;
  try {
    const response = await fetch("http://localhost:8080/cadernos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        titulo: title,
        usuarioId: userID,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
    return data;
  } catch (err) {
    alert(err.message);
  }
}
async function criarTag(nome, cor) {
  try {
    const response = await fetch("http://localhost:8080/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nome: nome,
        cor: cor,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    window.location.href = "../telaPrincipal/telaPrincipal.html";
    return data;
  } catch (err) {
    alert(err.message);
  }
}
