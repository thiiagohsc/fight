// Knight or Sorcerer
// littleMonster or BigMonster

function randRange(min, max) {
    return min + Math.random() * (max - min);
}

class Character {

    _life = 1;
    maxLife = 1;
    attack = 0;
    defense = 0;
    avatar = '❓';
    isDefending = false;

    constructor(name) {
        this.name = name;
    }

    get life() {
        return this._life;
    }

    set life(newLife) {
        newLife = newLife < 0 ? 0 : newLife;
        this._life = newLife > this.maxLife ? this.maxLife : newLife;
    }

    get isAlive() {
        return this.life > 0;
    }

    defend() {
        this.isDefending = true;
    }
}

// Cada lutador sorteia seus atributos dentro da faixa da sua classe: os números
// nunca são os mesmos duas vezes, então nem sempre dá pra saber quem é mais forte.
class Knight extends Character {
    constructor(name) {
        super(name);
        this.avatar = '🛡️';
        this.maxLife = randRange(85, 115);
        this.life = this.maxLife;
        this.attack = randRange(8, 13);
        this.defense = randRange(6, 10);
    }
}

class Sorcerer extends Character {
    constructor(name) {
        super(name);
        this.avatar = '🧙';
        this.maxLife = randRange(65, 90);
        this.life = this.maxLife;
        this.attack = randRange(12, 18);
        this.defense = randRange(2, 5);
    }
}

class LittleMonster extends Character {
    constructor() {
        super('Little Monster');
        this.avatar = '👺';
        this.maxLife = randRange(35, 55);
        this.life = this.maxLife;
        this.attack = randRange(5, 9);
        this.defense = randRange(3, 6);
    }
}

class BigMonster extends Character {
    constructor() {
        super('Big Monster');
        this.avatar = '👹';
        this.maxLife = randRange(75, 105);
        this.life = this.maxLife;
        this.attack = randRange(10, 15);
        this.defense = randRange(4, 7);
    }
}

class Stage {
    constructor(player, monster, playerEl, monsterEl, logObject, callbacks = {}) {
        this.player = player;
        this.monster = monster;
        this.playerEl = playerEl;
        this.monsterEl = monsterEl;
        this.log = logObject;
        this.onGameOver = callbacks.onGameOver || (() => {});
        this.gameOver = false;
        this.monsterTurnDelay = 900;
    }

    Start() {
        this.update();

        this.playerEl.querySelector('.attackButton')
            .addEventListener('click', () => this.playerAction('attack'));

        this.playerEl.querySelector('.defendButton')
            .addEventListener('click', () => this.playerAction('defend'));

        this.log.addMenssage(`O combate começou! ${this.player.name} enfrenta ${this.monster.name}.`, 'info');
    }

    setPlayerControlsEnabled(enabled) {
        this.playerEl.querySelector('.attackButton').disabled = !enabled;
        this.playerEl.querySelector('.defendButton').disabled = !enabled;
    }

    playerAction(actionType) {
        if (this.gameOver) return;

        this.setPlayerControlsEnabled(false);
        this.doAction(this.player, this.monster, actionType, this.playerEl, this.monsterEl);

        if (this.checkGameOver()) return;

        setTimeout(() => this.monsterTurn(), this.monsterTurnDelay);
    }

    monsterTurn() {
        if (this.gameOver) return;

        const actionType = Math.random() < 0.15 ? 'defend' : 'attack';
        this.doAction(this.monster, this.player, actionType, this.monsterEl, this.playerEl);

        if (this.checkGameOver()) return;

        this.setPlayerControlsEnabled(true);
    }

    doAction(acting, target, actionType, actingEl, targetEl) {
        if (actionType === 'defend') {
            acting.defend();
            this.log.addMenssage(`${acting.name} entrou em posição de defesa.`, 'defend');
            this.update();
            return;
        }

        this.playAttackAnimation(actingEl);

        const variance = () => 0.8 + Math.random() * 0.4;
        const rawAttack = acting.attack * variance();
        const defenseBoost = target.isDefending ? 1.6 : 1;
        const mitigation = target.defense * defenseBoost * variance();
        const damage = (rawAttack * rawAttack) / (rawAttack + mitigation);

        target.life -= damage;
        this.showDamagePopup(targetEl, damage);
        this.shake(targetEl);

        if (damage < rawAttack * 0.35) {
            this.log.addMenssage(`${target.name} amorteceu quase todo o golpe de ${acting.name}, sofrendo só ${damage.toFixed(2)} de dano`, 'block');
        } else {
            this.log.addMenssage(`${acting.name} causou ${damage.toFixed(2)} de dano em ${target.name}`, 'damage');
        }

        target.isDefending = false;
        this.update();
    }

    playAttackAnimation(el) {
        const avatar = el.querySelector('.avatar');
        avatar.classList.remove('attacking');
        void avatar.offsetWidth;
        avatar.classList.add('attacking');
    }

    showDamagePopup(el, amount) {
        const popup = document.createElement('div');
        popup.className = 'damage-popup';
        popup.textContent = `-${amount.toFixed(1)}`;
        el.appendChild(popup);
        popup.addEventListener('animationend', () => popup.remove());
    }

    shake(el) {
        el.classList.remove('hit');
        // Force reflow so the animation can restart if triggered again quickly
        void el.offsetWidth;
        el.classList.add('hit');
    }

    checkGameOver() {
        if (!this.player.isAlive || !this.monster.isAlive) {
            this.gameOver = true;
            this.setPlayerControlsEnabled(false);

            const playerWon = this.monster.life <= 0 && this.player.life > 0;
            const winnerName = playerWon ? this.player.name : this.monster.name;

            this.log.addMenssage(`${winnerName} venceu o combate!`, 'death');
            this.onGameOver(playerWon, winnerName);
            return true;
        }
        return false;
    }

    update() {
        this.updateFighter(this.player, this.playerEl);
        this.updateFighter(this.monster, this.monsterEl);
    }

    updateFighter(fighter, el) {
        el.querySelector('.avatar').textContent = fighter.avatar;
        el.querySelector('.name').innerHTML = `${fighter.name} - ${fighter.life.toFixed(1)} HP`;

        const pct = Math.max(0, (fighter.life / fighter.maxLife) * 100);
        const bar = el.querySelector('.bar');
        bar.style.width = `${pct}%`;
        bar.style.backgroundColor = pct > 50 ? '#3ddc84' : pct > 20 ? '#f5c518' : '#e5484d';

        el.classList.toggle('defending', fighter.isDefending);
        el.classList.toggle('defeated', !fighter.isAlive);
    }
}


class Log {
    list = [];

    constructor(listEl) {
        this.listEl = listEl;
    }

    addMenssage(msg, type = 'info') {
        this.list.push({ msg, type });
        this.render();
    }

    render() {
        this.listEl.innerHTML = '';

        for (const entry of this.list) {
            this.listEl.innerHTML += `<li class="log-${entry.type}">${entry.msg}</li>`;
        }

        this.listEl.scrollTop = this.listEl.scrollHeight;
    }
}
