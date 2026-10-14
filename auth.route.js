const { Router } = require("express");
const conn = require("../db/conection.js");

const router = Router();


router.post("/auth", async (req, res) => {
    try {
        const { telefone, senha } = req.body;

        if (!telefone || !senha) {
            return res.status(400).json({
                isAuth: false,
                mensagem: "Informe o telefone e a senha."
            });
        }

        const cmd = "SELECT * FROM utilizadores WHERE telefone = ? AND senha = ?;";

        const [resultado] = await conn.query(cmd, [telefone, senha]);

        if (resultado.length > 0) {
            return res.json({ isAuth: true });
        }

        return res.json({ isAuth: false });

    } catch (erro) {
        console.error("Erro ao autenticar:", erro);

        return res.status(500).json({
            isAuth: false,
            mensagem: "Erro interno do servidor."
        });
    }
});


router.get("/utilizadores", async (req, res) => {
    try {
        const [utilizadores] = await conn.query(
            "SELECT id, apelido, telefone FROM utilizadores ORDER BY apelido"
        );

        res.json(utilizadores);

    } catch (erro) {
        console.error("Erro ao buscar utilizadores:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar os contatos."
        });
    }
});


/* Salvar uma mensagem no banco de dados */
router.post("/chat", async (req, res) => {
    try {
        const {
            telefone_remetente,
            telefone_destinatario,
            mensagem
        } = req.body;

        if (
            !telefone_remetente ||
            !telefone_destinatario ||
            !mensagem ||
            !mensagem.trim()
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Informe o remetente, destinatário e texto."
            });
        }

        const cmd = `
            INSERT INTO mensagens
            (telefone_remetente, telefone_destinatario, mensagem, data_envio)
            VALUES (?, ?, ?, NOW())
        `;

        await conn.query(cmd, [
            telefone_remetente,
            telefone_destinatario,
            mensagem.trim()
        ]);

        res.status(201).json({
            sucesso: true,
            mensagem: "Mensagem salva com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao salvar mensagem:", erro);

        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao salvar a mensagem."
        });
    }
});


/* Buscar mensagens entre dois usuários */
router.get("/chat", async (req, res) => {
    try {
        const { telefone1, telefone2 } = req.query;

        if (!telefone1 || !telefone2) {
            return res.status(400).json({
                mensagem: "Informe os dois telefones."
            });
        }

        const cmd = `
            SELECT id, telefone_remetente,
                   telefone_destinatario, mensagem, data_envio
            FROM mensagens
            WHERE
                (telefone_remetente = ? AND telefone_destinatario = ?)
                OR
                (telefone_remetente = ? AND telefone_destinatario = ?)
            ORDER BY data_envio ASC
        `;

        const [mensagens] = await conn.query(cmd, [
            telefone1,
            telefone2,
            telefone2,
            telefone1
        ]);

        res.json(mensagens);

    } catch (erro) {
        console.error("Erro ao buscar mensagens:", erro);

        res.status(500).json({
            mensagem: "Erro ao carregar as mensagens."
        });
    }
});



//Exportamos as rotas definidas no arquivo.
module.exports = router;