const apiURL = 'http://localhost:3000/produtos'; // URL da API

// Função para realizar uma requisição GET
export async function getProdutos() {
    try {
        console.log('Requisição GET para:', apiURL); // Log para depuração
        const response = await fetch(apiURL);
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos: ${response.status}`);
        }
        const produtos = await response.json();
        console.log('Produtos recebidos:', produtos); // Log para depuração
        return produtos;
    } catch (error) {
        console.error('Erro na requisição GET:', error);
        throw error;
    }
}

// Função para adicionar um novo produto (POST)
export async function postProduto(produto) {
    try {
        console.log('Tentando adicionar produto:', produto); // Log para depuração
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto),
        });
        if (!response.ok) {
            throw new Error(`Erro ao adicionar produto: ${response.status}`);
        }
        const produtoCriado = await response.json();
        console.log('Produto criado:', produtoCriado); // Log para depuração
        return produtoCriado;
    } catch (error) {
        console.error('Erro na requisição POST:', error);
        throw error;
    }
}

// Função para excluir um produto (DELETE)
export async function deleteProduto(id) {
    try {
        console.log('Tentando excluir produto com ID:', id); // Log para depuração
        const response = await fetch(`${apiURL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Erro ao excluir produto: ${response.status}`);
        }
        console.log(`Produto com ID ${id} excluído com sucesso`); // Log para depuração
    } catch (error) {
        console.error('Erro na requisição DELETE:', error);
        throw error;
    }
}
