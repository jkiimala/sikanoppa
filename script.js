document.addEventListener('DOMContentLoaded', function () {

    let players = [];
    let currentPlayerIndex = 0;
    let currentScore = 0;
    let numDice = 1;
    let targetPoints = 50;
    let gameStarted = false;
    let dice1 = 1;
    let dice2 = 1;

    // KURSORI INPUT KENTTÄÄN VALMIIKSI //
    document.getElementById(playerName.id).focus();
    document.getElementById(playerName.id).select();

    // PELAAJIEN LISÄÄMINEN //
    function addPlayer() {
        const playerNameInput = document.getElementById('playerName');
        const playerName = playerNameInput.value.trim();

        if (playerName !== '') {
            players.push({ name: playerName, score: 0 });
            playerNameInput.value = '';
            updateUI();
        } else {
            showNotification('HUOM! Pelaajan nimi ei voi olla tyhjä.', 'error');
        }
    }

    // PELAAJIEN POISTO - SIKANAPPULA //
    function startOver() {
        players = [];
        resetGame();
        showNotification('RÖH! RÖH! Lisää uudet pelaajat.', 'error');
    }


    // PELIN ALOITUS //
    function startGame() {
        if (players.length < 2) {
            showNotification('HUOM! Lisää vähintään kaksi pelaajaa.', 'error');
            return;
        }

        const selectedNumDice = document.querySelector('[data-dice].active');
        const selectedTargetPoints = document.querySelector('[data-points].active');

        if (selectedNumDice && selectedTargetPoints) {
            numDice = parseInt(selectedNumDice.dataset.dice);
            targetPoints = parseInt(selectedTargetPoints.dataset.points);

            if (!isNaN(numDice) && !isNaN(targetPoints)) {
                gameStarted = true;
                document.getElementById('roll-dice').disabled = false;
                document.getElementById('hold').disabled = false;
                document.getElementById('reset').disabled = false;
                document.getElementById('peliruutu').style.display = 'block';
                document.getElementById('alkuruutu').classList.add('invisible');
                updateUI();
                return;
            } else {
                showNotification('Valitse noppien määrä ja pelin pisteet.', 'error');
            }
        } else {
            showNotification('Valitse noppien määrä ja pelin pisteet.', 'error');
        }
    }

    // PELIN KESTO //
    function setTargetPoints(points) {
        targetPoints = points;
        document.getElementById('points-50').classList.remove('active');
        document.getElementById('points-100').classList.remove('active');

        if (points === 50) {
            document.getElementById('points-50').classList.add('active');
        } else {
            document.getElementById('points-100').classList.add('active');
        }
    }
    
    // KIERROKSEN PISTEET //
    function updateRoundScore() {
        const roundScoreElement = document.getElementById('round-score');
        roundScoreElement.innerHTML = `Kierroksen pisteet: ${currentScore}`;
    }

    // PELAAJA VAIHTUU //
    function switchPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        currentScore = 0;
        DoubleCount = 0;
        updateUI();
        updateRoundScore(); // Päivitä kierroksen yhteispisteet kun vaihdetaan pelaajaa
    }

    
    // Funktio hakee nopan kuvan tiedostonimen perusteella
    function getDiceImage(value) {
        return `img/noppa${value}.png`;
    }

    // NOPAN HEITTO //
    function rollDie() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // UI:n päivitys //
    function updateUI() {
        const currentPlayerElement = document.getElementById('current-player');
        
        // Näyttää tämän hetkisen pelaajan //
        currentPlayerElement.innerText = players[currentPlayerIndex] ? `Nyt heittää: ${players[currentPlayerIndex].name}` : '';
        
        const diceValueElement = document.getElementById('dice-value');
        const diceImageElement = document.getElementById('dice-image');

        if (gameStarted) {
            if (numDice === 1) {
                diceValueElement.innerHTML = `Nopan lukema: ${dice1}`;
                diceImageElement.innerHTML = `<img src="${getDiceImage(dice1)}" alt="Noppa" class="dice-image">`;
            } else if (numDice === 2) {
                const diceValueText = (dice1 === 1 || dice2 === 1) ? '1' : `${dice1} + ${dice2} = ${dice1 + dice2}`;
                diceValueElement.innerHTML = `Nopan lukema: ${diceValueText}`;
                diceImageElement.innerHTML = `
                    <img src="${getDiceImage(dice1)}" alt="Noppa 1" class="dice-image">
                    <img src="${getDiceImage(dice2)}" alt="Noppa 2" class="dice-image">
                `;
            }
        }

        const playersElement = document.getElementById('players');
        playersElement.innerHTML = '';
        for (let i = 0; i < players.length; i++) {
            const playerItem = document.createElement('div');
            playerItem.innerText = `${i + 1}. ${players[i].name} - Pisteet: ${players[i].score}`;
            playersElement.appendChild(playerItem);
        }

        // Järjestä pelaajat
        const sortedPlayers = players.slice().sort((a, b) => a.score - b.score);
        const addedPlayersElement = document.getElementById('added-players');
        addedPlayersElement.innerHTML = `Pelaajat:<br>${sortedPlayers.map((player, index) => `${index + 1}. ${player.name}`).join('<br>')}`;
    }

    // NOPPIEN HEITTO //
    function rollDice() {
        dice1 = rollDie();
        dice2 = rollDie();
    
        let roundPoints = 0;
    
        if (numDice === 1) {
            const diceValue = dice1;
    
            if (diceValue === 1) {
                showNotification('Sika vei pisteet! Vuoro siirtyy seuraavalle.', 'error');
                switchPlayer();
            } else {
                roundPoints = diceValue;
            }
        } else {
            const diceValue = (dice1 === 1 || dice2 === 1) ? 1 : dice1 + dice2;
    
            if (dice1 === dice2) {
                if (dice1 === 1) {
                    roundPoints = 25;
                    showNotification('Tuplasika! Sait 25 pistettä.', 'success');
                } else {
                    roundPoints = (dice1 + dice2) * 2;
    
                    DoubleCount++;
    
                    // Tarkistus kolmelle peräkkäiselle tuplalle
                    if (DoubleCount === 3) {
                        showNotification('Sikamaista! Menetit kierroksen pisteet.', 'error');
                        
                        DoubleCount = 0;
                        currentScore = 0;
                        switchPlayer();
                        return;
                    } else {
                        showNotification('Tuplapisteet! Sait ' + roundPoints + ' pistettä.', 'success');
                    }
                }
            } else if (dice1 === 1 || dice2 === 1) {
                // Nollataan peräkkäiset tuplapisteet, jos tulee yksi
                DoubleCount = 0;
                showNotification('Sika vei pisteet! Vuoro siirtyy seuraavalle.', 'error');
                switchPlayer();
            } else {
                roundPoints = dice1 + dice2;
    
                // Nollataan peräkkäiset tuplapisteet, jos tulee eri luku
                DoubleCount = 0;
            }
        }
    
        currentScore += roundPoints;
    
        updateUI();
        updateRoundScore();
    }
    

    // Pisteiden otto //
    function hold() {
        players[currentPlayerIndex].score += currentScore;

        if (players[currentPlayerIndex].score >= targetPoints) {
            showNotification(`${players[currentPlayerIndex].name} VOITTI!`, 'success');
            resetGame();
        } else {
            currentScore = 0;
            switchPlayer();
        }
        updateRoundScore(); // Päivitä kierroksen yhteispisteet kun pelaaja päättää ottaa pisteet
    }

    

    // ILMOITUKSET //
    function showNotification(message, type) {
        const notificationElement = document.getElementById('notification');
        notificationElement.innerHTML = message;
        notificationElement.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
        notificationElement.classList.add('show');
        notificationElement.style.textAlign = 'center';

        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 2000); // Säädetään kauanko ilmoitus näkyy (ms) //
    }

    
    // UUSI PELI //
    function resetGame() {
        gameStarted = false;
        players.forEach(player => player.score = 0);
        currentPlayerIndex = 0;
        currentScore = 0;
        DoubleCount = 0;
        document.getElementById('roll-dice').disabled = true;
        document.getElementById('hold').disabled = true;
        document.getElementById('reset').disabled = true;
        document.getElementById('peliruutu').style.display = 'none';
        document.getElementById('alkuruutu').classList.remove('invisible');
        updateUI();
    }

    function setNumDice(n) {
        numDice = n;
        document.getElementById('one-die').classList.remove('active');
        document.getElementById('two-dice').classList.remove('active');

        if (n === 1) {
            document.getElementById('one-die').classList.add('active');
        } else {
            document.getElementById('two-dice').classList.add('active');
        }
    }
 
    
    // Event listener sika-nappulalle
    document.getElementById('start-over').addEventListener('click', startOver);

    // Event listenerit buttoneille
    document.getElementById('one-die').addEventListener('click', () => setNumDice(1));
    document.getElementById('two-dice').addEventListener('click', () => setNumDice(2));
    document.getElementById('points-50').addEventListener('click', () => setTargetPoints(50));
    document.getElementById('points-100').addEventListener('click', () => setTargetPoints(100));
    document.getElementById('add-player').addEventListener('click', addPlayer);
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    document.getElementById('hold').addEventListener('click', hold);
    document.getElementById('reset').addEventListener('click', resetGame);

    updateUI();
    updateRoundScore();
});

