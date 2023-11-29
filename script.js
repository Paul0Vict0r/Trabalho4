// Selecionando elementos do DOM

const buttonElements = document.querySelectorAll('.clickable');
// Essa linha seleciona todos os elementos no documento que possuem a classe CSS "clickable" e armazena essa coleção de elementos na variável buttonElements. Esses elementos representam os botões clicáveis do jogo.

const controlElement = document.querySelector('.control .background');
//Aqui, o código seleciona o elemento com a classe CSS "background" que está dentro de um elemento com a classe "control". Esse elemento representa a área de fundo do botão de controle no jogo e é armazenado na variável controlElement.

const controlStatusElement = document.querySelector('.control p');
//Essa linha seleciona o elemento <p> dentro de um elemento com a classe "control". Esse elemento é responsável por exibir o status do botão de controle no jogo, e a referência é armazenada em controlStatusElement.

const scoreElement = document.querySelector('.score');
//Aqui, o código seleciona o elemento com a classe CSS "score", que é responsável por exibir a pontuação atual no jogo. A referência é armazenada na variável scoreElement.

const highScoreElement = document.querySelector('.high-score');
//Essa linha seleciona o elemento com a classe CSS "high-score", que exibe a pontuação mais alta alcançada no jogo. A referência é armazenada em highScoreElement.

const container = document.querySelector('.container');
//Aqui, o código seleciona o elemento com a classe CSS "container", que representa o contêiner principal do jogo. Essa referência é armazenada em container.

const nightModeButton = document.querySelector('.night-mode-button');
//Essa linha seleciona o elemento com a classe CSS "night-mode-button", que representa o botão para alternar entre os modos noturno e diurno no jogo. A referência é armazenada em nightModeButton.


// Variáveis do jogo

let roundAnswers = [];
//Essa variável armazena as respostas geradas aleatoriamente pelo jogo em cada rodada. Inicialmente, está vazia porque o jogo ainda não começou.

let playerAnswers = [];
//Esta variável guarda as respostas do jogador durante a rodada atual. Inicia vazia e é preenchida à medida que o jogador clica nos botões.

let difficulty = 4;
//Representa o nível de dificuldade do jogo, indicando quantos botões o jogador precisa lembrar e reproduzir para completar uma rodada. Começa com 4 botões.

let intervalDecrease = 0;
//Controla a diminuição do intervalo de exibição dos botões durante a reprodução da sequência. Inicia com 0 e pode aumentar à medida que o jogador progride no jogo.

let score = 0;
//Armazena a pontuação atual do jogador, indicando quantas rodadas foram completadas com sucesso.

let highScore = 0;
//Mantém o recorde mais alto alcançado pelo jogador em termos de pontuação. Inicia em 0 e é atualizado conforme o jogador atinge novas pontuações mais altas.


let waitingPlayerAnswer = false;
//Indica se o jogo está aguardando a resposta do jogador. Quando true, significa que o jogador deve reproduzir a sequência. Quando false, o jogador não deve clicar nos botões.

let canStartRound = true;
//Controla se uma nova rodada pode ser iniciada. Quando true, o jogador pode iniciar uma nova rodada. Depois de iniciar uma rodada, isso se torna false até que a rodada atual seja concluída.

// Função para obter um valor aleatório de uma array
const getRandomValueAtArray = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// Função para exibir a sequência de cliques
const displaySequence = (index) => {
    const element = roundAnswers[index];

    setTimeout(() => {
        element.classList.add('active');

        setTimeout(() => {
            element.classList.remove('active');
            index++;

            if (index < roundAnswers.length) {
                displaySequence(index);
            } else {
                waitingPlayerAnswer = true;

                controlElement.style.backgroundColor = 'lightblue';
                controlStatusElement.innerHTML = 'REPRODUZA';

                toggleButtonsCursorStyle();
            }
        }, 750 - intervalDecrease);
    }, 750 - intervalDecrease);
};

// Função para iniciar uma rodada
const callRound = () => {
    playerAnswers = [];

    controlElement.style.cursor = 'auto';
    controlElement.style.backgroundColor = 'yellow';
    controlStatusElement.innerHTML = 'OBSERVE';

    roundAnswers = [];

    const loopLimit = difficulty;

    for (let i = 0; i < loopLimit; i++) {
        const randomValue = getRandomValueAtArray(buttonElements);
        roundAnswers.push(randomValue);
    }

    displaySequence(0);
};

// Função para alternar o estilo do cursor dos botões
const toggleButtonsCursorStyle = () => {
    for (let element of buttonElements) {
        element.style.cursor = element.style.cursor === 'pointer' ? '' : 'pointer';
    }
};

// Função para ajustar a dificuldade do jogo
const revampDifficulty = (toIncrease) => {
    if (toIncrease) {
        difficulty++;
        intervalDecrease = (intervalDecrease < 800) ? intervalDecrease + 10 : intervalDecrease;
    } else {
        difficulty = 4;
        intervalDecrease = 0;
    }
};

// Função para atualizar a pontuação e armazenar localmente
const updateScore = () => {
    scoreElement.innerHTML = score;
    highScoreElement.innerHTML = (highScore > 0) ? highScore : '-';

    localStorage.setItem('highScore', highScore.toString());
};

// Função para processar as respostas do jogador
const processAnswers = () => {
    waitingPlayerAnswer = false;

    toggleButtonsCursorStyle();

    let allCorrect = true;

    for (let i in roundAnswers) {
        const properAnswer = roundAnswers[i];
        const playerAnswer = playerAnswers[i];

        if (properAnswer !== playerAnswer) {
            allCorrect = false;
        }
    }

    if (allCorrect) {
        controlElement.style.cursor = 'pointer';
        controlElement.style.backgroundColor = 'green';

        controlStatusElement.innerHTML = 'ACERTOU';

        setTimeout(() => {
            callRound();
        }, 750);
    } else {
        controlElement.style.cursor = 'pointer';
        controlElement.style.backgroundColor = 'red';

        controlStatusElement.innerHTML = 'RECOMEÇAR';

        // Atualizando a maior pontuação e armazenando localmente
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
        }

        canStartRound = true;
    }

    score = (allCorrect) ? score + 1 : score;
    score = (allCorrect) ? score : 0;

    updateScore();
    revampDifficulty(allCorrect);
};

// Função para processar o clique em um botão
const processClick = (element) => {
    if (!waitingPlayerAnswer) {
        return;
    }

    playerAnswers.push(element);
    element.classList.add('active');

    setTimeout(() => {
        element.classList.remove('active');
    }, 750);

    const i = playerAnswers.length - 1;

    if (playerAnswers[i] !== roundAnswers[i] || playerAnswers.length === roundAnswers.length) {
        processAnswers();
    }
};

// Atribuindo eventos aos elementos
controlElement.onclick = () => {
    if (canStartRound) {
        callRound();
        canStartRound = false;
    }
};

nightModeButton.onclick = () => {
    container.classList.toggle('night-mode');
    container.classList.toggle('day-mode');
};

for (let element of buttonElements) {
    element.onclick = () => {
        processClick(element);
    };

    element.onmouseenter = () => {
        if (waitingPlayerAnswer && !element.classList.contains('active')) {
            element.classList.add('hover');
        }
    };

    element.onmouseleave = () => {
        if (waitingPlayerAnswer && !element.classList.contains('active')) {
            element.classList.remove('hover');
        }
    };
};

// Verificando se há uma maior pontuação armazenada localmente e atualizando a variável highScore
const storedHighScore = localStorage.getItem('highScore');
if (storedHighScore !== null) {
    highScore = parseInt(storedHighScore, 10);
    updateScore();
}