// Selecionando elementos do DOM
const buttonElements = document.querySelectorAll('.clickable'); // Botões clicáveis
const controlElement = document.querySelector('.control .background'); // Área de fundo do botão de controle
const controlStatusElement = document.querySelector('.control p'); // Elemento <p> dentro da área de controle
const scoreElement = document.querySelector('.score'); // Elemento que exibe a pontuação atual
const highScoreElement = document.querySelector('.high-score'); // Elemento que exibe a pontuação mais alta
const container = document.querySelector('.container'); // Contêiner principal do jogo
const nightModeButton = document.querySelector('.night-mode-button'); // Botão para alternar entre os modos noturno e diurno

// Variáveis do jogo
let roundAnswers = []; // Respostas geradas aleatoriamente pelo jogo em cada rodada
let playerAnswers = []; // Respostas do jogador durante a rodada atual
let difficulty = 4; // Nível de dificuldade do jogo (quantidade de botões a serem lembrados)
let intervalDecrease = 0; // Controle da diminuição do intervalo de exibição dos botões durante a reprodução da sequência
let score = 0; // Pontuação atual do jogador (quantidade de rodadas completadas com sucesso)
let highScore = 0; // Recorde mais alto alcançado pelo jogador em termos de pontuação
let waitingPlayerAnswer = false; // Indica se o jogo está aguardando a resposta do jogador
let canStartRound = true; // Controla se uma nova rodada pode ser iniciada

// Função para obter um valor aleatório de uma array
const getRandomValueAtArray = (array) => array[Math.floor(Math.random() * array.length)];

// Função para exibir a sequência de cliques
const displaySequence = (index) => {
    const element = roundAnswers[index];
    setTimeout(() => {
        element.classList.add('active');
        setTimeout(() => {
            element.classList.remove('active');
            index++;

            // Se ainda houver elementos na sequência, continuar exibindo
            if (index < roundAnswers.length) {
                displaySequence(index);
            } 

            // Se a sequência foi totalmente exibida, permitir que o jogador responda
            else {
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

    // Configurações visuais iniciais para a rodada
    controlElement.style.cursor = 'auto';
    controlElement.style.backgroundColor = 'yellow';
    controlStatusElement.innerHTML = 'OBSERVE';

    const loopLimit = difficulty - roundAnswers.length;

    // Gera respostas aleatórias para a rodada
    for (let i = 0; i < loopLimit; i++) {
        const randomValue = getRandomValueAtArray(buttonElements);
        roundAnswers.push(randomValue);
    }

    displaySequence(0); // Inicia a exibição da sequência
};

// Função para alternar o estilo do cursor dos botões
const toggleButtonsCursorStyle = () => {
    for (let element of buttonElements) {
        // Alterna entre 'pointer' e '' (cursor padrão)
        element.style.cursor = element.style.cursor === 'pointer' ? '' : 'pointer';
    }
};

// Função para ajustar a dificuldade do jogo
const revampDifficulty = (toIncrease) => {
    if (toIncrease) {
        // Aumenta a dificuldade e diminui o intervalo de exibição dos botões
        difficulty++;
        intervalDecrease = (intervalDecrease < 800) ? intervalDecrease + 10 : intervalDecrease;
    } 
    
    else {
        // Reinicia a dificuldade e o intervalo
        difficulty = 4;
        intervalDecrease = 0;
    }
};

// Função para atualizar a pontuação e armazenar localmente
const updateScore = () => {
    // Atualiza os elementos visuais com a pontuação
    scoreElement.innerHTML = score;
    highScoreElement.innerHTML = (highScore > 0) ? highScore : '-';
    // Armazena a pontuação mais alta localmente
    localStorage.setItem('highScore', highScore.toString());
};

// Função para processar as respostas do jogador
const processAnswers = () => {
    waitingPlayerAnswer = false;
    toggleButtonsCursorStyle();
    let allCorrect = true;

    // Verifica se as respostas do jogador coincidem com as respostas do jogo
    for (let i in roundAnswers) {
        const properAnswer = roundAnswers[i];
        const playerAnswer = playerAnswers[i];

        if (properAnswer !== playerAnswer) {
            allCorrect = false;
        }
    }

    // Se todas as respostas estiverem corretas, avança para a próxima rodada
    if (allCorrect) {
        controlElement.style.cursor = 'pointer';
        controlElement.style.backgroundColor = 'green';
        controlStatusElement.innerHTML = 'ACERTOU';
        setTimeout(() => callRound(), 750);
    } 
    
    // Se houver erros, exibe a mensagem de recomeçar e atualiza a pontuação mais alta
    else {
        controlElement.style.cursor = 'pointer';
        controlElement.style.backgroundColor = 'red';
        controlStatusElement.innerHTML = 'RECOMEÇAR';

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore.toString());
        }

        // Permite iniciar uma nova rodada após um breve intervalo
        setTimeout(() => {
            if (!waitingPlayerAnswer) {
                roundAnswers = [];
                callRound();
            }
        }, 1500);

        canStartRound = true;
    }
    // Atualiza a pontuação e ajusta a dificuldade
    score = (allCorrect) ? score + 1 : 0;
    updateScore();
    revampDifficulty(allCorrect);
};

// Função para processar o clique em um botão
const processClick = (element) => {
    if (!waitingPlayerAnswer) return;

    // Registra a resposta do jogador e adiciona estilo visual
    playerAnswers.push(element);
    element.classList.add('active');

    setTimeout(() => {
        element.classList.remove('active');
    }, 750);

    const i = playerAnswers.length - 1;

    // Verifica se a resposta do jogador está correta ou se todas as respostas foram dadas
    if (playerAnswers[i] !== roundAnswers[i] || playerAnswers.length === roundAnswers.length) {
        processAnswers();
    }
};

// Atribuindo eventos aos elementos
controlElement.onclick = () => {

    // Inicia uma nova rodada se permitido
    if (canStartRound) {
        callRound();
        canStartRound = false;
    }
};

nightModeButton.onclick = () => {
    // Alterna entre os modos noturno e diurno
    container.classList.toggle('night-mode');
    container.classList.toggle('day-mode');
};

for (let element of buttonElements) {
    element.onclick = () => processClick(element);

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
