async function fazerLogin(event) {
    event.preventDefault();

    const telefone = document.getElementById("telefone").value;
    const senha = document.getElementById("senha").value;

    try {
        const resposta = await fetch("http://localhost:3000/auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                telefone: telefone,
                senha: senha
            })
        });

        const dados = await resposta.json();

     if (dados.isAuth) {
    sessionStorage.setItem("telefoneUsuario", telefone);
    window.location.href = "conversas.html";
} else {
            alert(dados.mensagem || "Telefone ou senha incorretos.");
        }

    } catch (erro) {
        console.error("Erro ao fazer login:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
}