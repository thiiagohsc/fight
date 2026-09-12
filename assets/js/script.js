const characterSelect = document.querySelector('#characterSelect');
const fightarea = document.querySelector('#fightarea');
const logEl = document.querySelector('#log');
const log = new Log(logEl);

const gameOverOverlay = document.querySelector('#gameOverOverlay');
const gameOverText = document.querySelector('#gameOverText');
const restartButton = document.querySelector('#restartButton');

const CHARACTERS = {
    knight: () => new Knight('Cavaleiro'),
    sorcerer: () => new Sorcerer('Feiticeiro'),
};

const MONSTERS = [LittleMonster, BigMonster];

function pickRandomMonster() {
    const MonsterClass = MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    return new MonsterClass();
}

function startGame(characterKey) {
    const player = CHARACTERS[characterKey]();
    const monster = pickRandomMonster();

    characterSelect.hidden = true;
    fightarea.hidden = false;
    logEl.hidden = false;

    const stage = new Stage(
        player,
        monster,
        document.querySelector('#char'),
        document.querySelector('#monster'),
        log,
        {
            onGameOver: (playerWon, winnerName) => {
                gameOverText.textContent = playerWon ? `🏆 ${winnerName} venceu!` : `💀 ${winnerName} venceu!`;
                gameOverOverlay.hidden = false;
            },
        }
    );

    stage.Start();
}

document.querySelectorAll('.select-card').forEach((card) => {
    card.addEventListener('click', () => startGame(card.dataset.character));
});

restartButton.addEventListener('click', () => window.location.reload());
