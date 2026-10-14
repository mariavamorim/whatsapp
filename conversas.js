
const listaContatos = document.getElementById("lista-contatos");
const areaMensagens = document.getElementById("mensagens");
const formMensagem = document.getElementById("form-mensagem");
const textoMensagem = document.getElementById("texto-mensagem");
const telefoneUsuario = sessionStorage.getItem("telefoneUsuario");
let telefoneContato = null;

async function carregarContatos() {
    try {
        const resposta = await fetch("http://localhost:3000/utilizadores");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar contatos.");
        }

        const utilizadores = await resposta.json();

        listaContatos.innerHTML = "";

        if (utilizadores.length === 0) {
            listaContatos.textContent = "Nenhum contato cadastrado.";
            return;
        }

        utilizadores.forEach((usuario) => {
            const contato = document.createElement("button");
            contato.className = "contato";

            const avatar = document.createElement("div");
            avatar.className = "avatar";
            avatar.textContent = usuario.apelido.charAt(0).toUpperCase();

            const info = document.createElement("div");
            info.className = "info-contato";

            const nome = document.createElement("strong");
            nome.textContent = usuario.apelido;

            const telefone = document.createElement("p");
            telefone.textContent = usuario.telefone;

            info.appendChild(nome);
            info.appendChild(telefone);

            contato.appendChild(avatar);
            contato.appendChild(info);

            contato.addEventListener("click", () => {
                abrirConversa(usuario.apelido, avatar.textContent, usuario.telefone);

                document.querySelectorAll(".contato").forEach((item) => {
                    item.classList.remove("selecionado");
                });

                contato.classList.add("selecionado");
            });

            listaContatos.appendChild(contato);
        });

    } catch (erro) {
        console.error("Erro ao carregar contatos:", erro);
        listaContatos.textContent = "Não foi possível carregar os contatos.";
    }
}


async function abrirConversa(nome, inicial, telefone) {
    telefoneContato = telefone;

    document.getElementById("nome-chat").textContent = nome;
    document.getElementById("avatar-chat").textContent = inicial;

    areaMensagens.innerHTML = `
        <div class="aviso">Carregando mensagens...</div>
    `;

    textoMensagem.focus();

    await carregarMensagens();
}


async function carregarMensagens() {
    if (!telefoneUsuario || !telefoneContato) {
        areaMensagens.innerHTML = `
            <div class="aviso">
                Faça login e selecione um contato.
            </div>
        `;
        return;
    }

    try {
        const url = new URL("http://localhost:3000/chat");

        url.searchParams.set("telefone1", telefoneUsuario);
        url.searchParams.set("telefone2", telefoneContato);

        const resposta = await fetch(url);

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar as mensagens.");
        }

        const mensagens = await resposta.json();
        areaMensagens.innerHTML = "";

        if (mensagens.length === 0) {
            areaMensagens.innerHTML = `
                <div class="aviso">
                    Nenhuma mensagem ainda. Envie a primeira!
                </div>
            `;
            return;
        }

        mensagens.forEach((item) => {
            const mensagem = document.createElement("div");

            mensagem.className =
                item.telefone_remetente === telefoneUsuario
                    ? "mensagem enviada"
                    : "mensagem recebida";

            const conteudo = document.createElement("div");
            conteudo.textContent = item.mensagem;

            const horario = document.createElement("span");
            horario.textContent = new Date(item.data_envio)
                .toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                });

            mensagem.appendChild(conteudo);
            mensagem.appendChild(horario);
            areaMensagens.appendChild(mensagem);
        });

        areaMensagens.scrollTop = areaMensagens.scrollHeight;

    } catch (erro) {
        console.error("Erro ao carregar mensagens:", erro);

        areaMensagens.innerHTML = `
            <div class="aviso">
                Não foi possível carregar as mensagens.
            </div>
        `;
    }
}




formMensagem.addEventListener("submit", async function(event) {
    event.preventDefault();

    const texto = textoMensagem.value.trim();

    if (!texto) {
        return;
    }

    if (!telefoneUsuario || !telefoneContato) {
        alert("Faça login e selecione um contato antes de enviar.");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                telefone_remetente: telefoneUsuario,
                telefone_destinatario: telefoneContato,
                mensagem: texto
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.sucesso) {
            throw new Error(dados.mensagem || "Erro ao enviar mensagem.");
        }

        textoMensagem.value = "";
        await carregarMensagens();

    } catch (erro) {
        console.error("Erro ao enviar mensagem:", erro);
        alert("Não foi possível enviar a mensagem. Confira o servidor.");
    }
});


carregarContatos();

