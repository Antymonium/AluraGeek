import { getProdutos, postProduto, deleteProduto } from './api.js';

// Seletores do DOM
const produtosContainer = document.querySelector('.produtos-container');
const emptyMessage = document.querySelector('.empty-message');
const form = document.querySelector('form');
const nomeInput = document.querySelector('input[placeholder="nome..."]');
const valorInput = document.querySelector('input[placeholder="valor..."]');
const imagemInput = document.querySelector('input[placeholder="imagem..."]');

let undoTimeout; // Timeout para desfazer exclusão
let produtoExcluido = null; // Produto excluído temporariamente
let cardRemovido = null; // Referência ao card removido
let produtosAtuais = []; // Estado local para produtos

// Função para listar os produtos
async function listarProdutos() {
    try {
        const produtos = await getProdutos();
        produtosAtuais = produtos; // Atualiza o estado local com os produtos do servidor
        produtosContainer.innerHTML = ''; // Limpa os produtos existentes
        if (produtos.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            produtos.forEach(produto => criarCardProduto(produto));
        }
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
    }
}

// Função para criar um card de produto no DOM
function criarCardProduto(produto) {
    const cardExistente = produtosContainer.querySelector(`[data-id="${produto.id}"]`);
    if (cardExistente) return; // Evita duplicar o card no DOM

    const card = document.createElement('div');
    card.classList.add('produto-card');
    card.setAttribute('data-id', produto.id); // Atribui o ID ao card
    card.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.nome}">
        <p>${produto.nome}</p>
        <div class="card-footer">
            <p class="price">$ ${produto.valor}</p>
            <button class="btn-lixeira">
                <img src="assets/lixeira.svg" alt="Excluir">
            </button>
        </div>
    `;
    const lixeira = card.querySelector('.btn-lixeira');
    lixeira.addEventListener('click', () => prepararExclusao(produto, card));
    produtosContainer.appendChild(card);
}

// Função para preparar a exclusão e exibir o botão "Desfazer"
function prepararExclusao(produto, card) {
    produtoExcluido = produto;
    cardRemovido = card;
    produtosContainer.removeChild(card);

    excluirProduto(produto.id);
    produtosAtuais = produtosAtuais.filter(p => p.id !== produto.id);

    const desfazerContainer = document.createElement('div');
    desfazerContainer.classList.add('desfazer-container');
    desfazerContainer.innerHTML = `
        <p>Produto "${produto.nome}" foi excluído.</p>
        <button class="btn-desfazer">Desfazer</button>
        <button class="btn-cancelar">X</button>
    `;
    document.body.appendChild(desfazerContainer);

    const btnDesfazer = desfazerContainer.querySelector('.btn-desfazer');
    btnDesfazer.addEventListener('click', () => desfazerExclusao(desfazerContainer));

    const btnCancelar = desfazerContainer.querySelector('.btn-cancelar');
    btnCancelar.addEventListener('click', () => fecharPopup(desfazerContainer));

    // Define um timeout de 10 segundos com fade-out no final
    undoTimeout = setTimeout(() => {
        desfazerContainer.classList.add('fade-out');
        desfazerContainer.addEventListener('transitionend', () => desfazerContainer.remove());
    }, 10000 - 500); // Fade-out ocorre nos últimos 0,5 segundos
}

// Função para excluir o produto do servidor
async function excluirProduto(id) {
    try {
        await deleteProduto(id);
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
    }
}

// Função para desfazer a exclusão
async function desfazerExclusao(container) {
    try {
        if (produtoExcluido && cardRemovido) {
            // Verifica se o produto já existe no servidor antes de recriá-lo
            const produtoJaExiste = produtosAtuais.some(p => p.id === produtoExcluido.id);

            if (!produtoJaExiste) {
                await postProduto(produtoExcluido);
                produtosAtuais.push(produtoExcluido); // Atualiza o estado local
                criarCardProduto(produtoExcluido); // Adiciona o card ao DOM
            }
            cardRemovido = null; // Remove a referência ao card
        }
        produtoExcluido = null; // Limpa o estado temporário
        clearTimeout(undoTimeout);
        container.remove();
    } catch (error) {
        console.error('Erro ao desfazer exclusão:', error);
    }
}

// Função para fechar o popup
function fecharPopup(container) {
    clearTimeout(undoTimeout);
    container.classList.add('fade-out');
    container.addEventListener('transitionend', () => container.remove());
    produtoExcluido = null;
    cardRemovido = null;
}

// Função para adicionar um novo produto
async function adicionarProduto(event) {
    event.preventDefault();

    try {
        const ultimoId = produtosAtuais.length > 0 ? Math.max(...produtosAtuais.map(p => p.id)) : 0;

        const novoProduto = {
            id: ultimoId + 1,
            nome: nomeInput.value,
            valor: valorInput.value,
            imagem: imagemInput.value,
        };

        await postProduto(novoProduto);
        produtosAtuais.push(novoProduto);
        criarCardProduto(novoProduto);
        form.reset();
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
    }
}

// Eventos
form.addEventListener('submit', adicionarProduto);

// Inicializa a listagem de produtos ao carregar a página
listarProdutos();
