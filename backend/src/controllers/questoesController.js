
const QuestoesModel = require('../models/questoesModel');
const fs = require('fs');
const path = require('path');

function validarId(valor) {
  const id = Number.parseInt(valor, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validarDadosQuestao(dados = {}) {
  const obrigatorios = [
    'idvest',
    'idtopico',
    'graudif',
    'enunciado',
    'alt_a',
    'alt_b',
    'alt_c',
    'alt_d',
    'resp_correta'
  ];

  const camposPreenchidos = obrigatorios.every((campo) => {
    const valor = dados[campo];
    return (
      valor !== undefined &&
      valor !== null &&
      String(valor).trim() !== ''
    );
  });

  if (!camposPreenchidos) return false;

  const camposNumericos = ['idvest', 'idtopico', 'graudif'];

  return camposNumericos.every((campo) => {
    const valor = Number(dados[campo]);
    return Number.isInteger(valor) && valor > 0;
  });
}

// Remove um arquivo enviado quando o cadastro ou edição falha.
function removerArquivoUpload(arquivo) {
  if (!arquivo) return;

  fs.unlink(arquivo.path, (erro) => {
    if (erro) {
      console.error('Erro ao remover arquivo temporário:', erro.message);
    }
  });
}

// Remove uma imagem antiga que esteja armazenada localmente.
function removerImagemAntiga(imagemUrl) {
  if (!imagemUrl || !imagemUrl.startsWith('/uploads/')) return;

  const nomeArquivo = path.basename(imagemUrl);
  const caminho = path.join(
    __dirname,
    '../../uploads',
    nomeArquivo
  );

  fs.unlink(caminho, (erro) => {
    if (erro && erro.code !== 'ENOENT') {
      console.error('Erro ao remover imagem antiga:', erro.message);
    }
  });
}

async function listarTodos(req, res) {
  try {
    const questoes = await QuestoesModel.listarTodos();
    return res.status(200).json(questoes);
  } catch (error) {
    console.error('Erro ao listar questões:', error.message);
    return res.status(500).json({
      mensagem: 'Erro ao listar questões.'
    });
  }
}

async function buscarPorId(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: 'ID inválido.'
    });
  }

  try {
    const questao = await QuestoesModel.buscarPorId(id);

    if (!questao) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    return res.status(200).json(questao);
  } catch (error) {
    console.error('Erro ao buscar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao buscar questão.'
    });
  }
}

async function criar(req, res) {
  if (!validarDadosQuestao(req.body)) {
    removerArquivoUpload(req.file);

    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios corretamente.'
    });
  }

  try {
    const dados = { ...req.body };

    // Se houver arquivo enviado, utiliza o caminho gerado pelo servidor.
    if (req.file) {
      dados.imagem_url = `/uploads/${req.file.filename}`;
    } else {
      dados.imagem_url = dados.imagem_url?.trim() || null;
    }

    const questao = await QuestoesModel.criar(dados);

    return res.status(201).json({
      mensagem: 'Questão cadastrada com sucesso!',
      questao
    });
  } catch (error) {
    removerArquivoUpload(req.file);

    console.error('Erro ao criar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao cadastrar questão.'
    });
  }
}

async function atualizar(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    removerArquivoUpload(req.file);

    return res.status(400).json({
      mensagem: 'ID inválido.'
    });
  }

  if (!validarDadosQuestao(req.body)) {
    removerArquivoUpload(req.file);

    return res.status(400).json({
      mensagem: 'Preencha todos os campos obrigatórios corretamente.'
    });
  }

  try {
    // Recupera a questão atual para preservar sua imagem, se necessário.
    const questaoAtual = await QuestoesModel.buscarPorId(id);

    if (!questaoAtual) {
      removerArquivoUpload(req.file);

      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    const dados = { ...req.body };

    if (req.file) {
      // Uma nova imagem foi enviada.
      dados.imagem_url = `/uploads/${req.file.filename}`;
    } else if (dados.remover_imagem === 'true') {
      // O administrador solicitou a remoção da imagem.
      dados.imagem_url = null;
    } else if (dados.imagem_url?.trim()) {
      // Foi informada uma URL de imagem.
      dados.imagem_url = dados.imagem_url.trim();
    } else {
      // Nenhuma alteração de imagem: mantém a anterior.
      dados.imagem_url = questaoAtual.imagem_url || null;
    }

    const questao = await QuestoesModel.atualizar(id, dados);

    if (!questao) {
      removerArquivoUpload(req.file);

      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    // Só remove a imagem antiga depois que a atualização deu certo.
    if (
      questaoAtual.imagem_url &&
      questaoAtual.imagem_url !== dados.imagem_url
    ) {
      removerImagemAntiga(questaoAtual.imagem_url);
    }

    return res.status(200).json({
      mensagem: 'Questão atualizada com sucesso!',
      questao
    });
  } catch (error) {
    removerArquivoUpload(req.file);

    console.error('Erro ao atualizar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao atualizar questão.'
    });
  }
}

async function deletar(req, res) {
  const id = validarId(req.params.id);

  if (!id) {
    return res.status(400).json({
      mensagem: 'ID inválido.'
    });
  }

  try {
    const questao = await QuestoesModel.buscarPorId(id);

    if (!questao) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    const deletado = await QuestoesModel.deletar(id);

    if (!deletado) {
      return res.status(404).json({
        mensagem: `Questão ${id} não encontrada.`
      });
    }

    removerImagemAntiga(questao.imagem_url);

    return res.status(200).json({
      mensagem: `Questão ${id} removida com sucesso.`
    });
  } catch (error) {
    console.error('Erro ao deletar questão:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao deletar questão.'
    });
  }
}

async function filtrar(req, res) {
  try {
    const questoes = await QuestoesModel.filtrar({
      vestibular: req.query.vestibular,
      materia: req.query.materia,
      topico: req.query.topico
    });

    return res.status(200).json(questoes);
  } catch (error) {
    console.error('Erro ao filtrar questões:', error.message);

    return res.status(500).json({
      mensagem: 'Erro ao filtrar questões.'
    });
  }
}

module.exports = {
  listarTodos,
  buscarPorId,
  filtrar,
  criar,
  atualizar,
  deletar
};
