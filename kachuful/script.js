let players = [];
let rounds = 0;
let roundBids = []; // Track bids for each round and player

function loadGameState() {
    // Check if the page was reloaded or if it should load saved data
    if (localStorage.getItem('resetGame') === 'true') {
        // Clear localStorage if game reset flag is set
        localStorage.removeItem('players');
        localStorage.removeItem('rounds');
        localStorage.removeItem('roundBids');
        localStorage.removeItem('resetGame');
    }

    const savedPlayers = localStorage.getItem('players');
    const savedRounds = localStorage.getItem('rounds');
    const savedRoundBids = localStorage.getItem('roundBids');

    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
    }
    if (savedRounds) {
        rounds = parseInt(savedRounds);
    }
    if (savedRoundBids) {
        roundBids = JSON.parse(savedRoundBids);
    }

    updatePlayersList();
    updateScoreTable();
    updateRanking();
    addRoundsToTable();
}

function saveGameState() {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('rounds', rounds.toString());
    localStorage.setItem('roundBids', JSON.stringify(roundBids));
}

function addPlayer() {
    const playerName = document.getElementById('player-name').value.trim();
    if (playerName && !players.some(player => player.name === playerName)) {
        // Add the new player
        players.push({ name: playerName, totalScore: 0 });
        
        // Reset all scores and bids
        resetScoresAndBids();

        // Update UI components
        updatePlayersList();
        updateScoreTable();
        updateRanking();
        document.getElementById('player-name').value = '';

        saveGameState();
    } else {
        alert('Please enter a unique player name.');
    }
}

function resetScoresAndBids() {
    // Reset scores for each player
    players.forEach(player => player.totalScore = 0);

    // Reset the bid tracking and score display
    roundBids = [];
    const scoreBody = document.getElementById('score-body');
    scoreBody.innerHTML = '';

    const totalRow = document.getElementById('total-scores').children[0];
    totalRow.innerHTML = '<td>Total</td>';
    players.forEach(player => {
        const td = document.createElement('td');
        td.textContent = '0'; // Reset score to 0
        totalRow.appendChild(td);
    });

    saveGameState();
}

function updatePlayersList() {
    const headerRow = document.getElementById('player-header');
    headerRow.innerHTML = '<th>Round</th>';
    players.forEach(player => {
        const th = document.createElement('th');
        th.textContent = player.name;
        headerRow.appendChild(th);
    });

    saveGameState();
}

function addRound() {
    rounds++;
    roundBids.push(Array(players.length).fill(0)); // Initialize bids for the new round
    const row = document.createElement('tr');
    
    // Determine the symbol based on round number modulo 4
    let symbol = '';
    let symbolClass = '';
    switch (rounds % 4) {
        case 1:
            symbol = '♠'; // Spade symbol
            symbolClass = 'spade-symbol';
            break;
        case 2:
            symbol = '♦'; // Diamond symbol
            symbolClass = 'diamond-symbol';
            break;
        case 3:
            symbol = '♣'; // Club symbol
            symbolClass = 'club-symbol';
            break;
        case 0:
            symbol = '♥'; // Heart symbol
            symbolClass = 'heart-symbol';
            break;
    }

    row.innerHTML = `<td>Round ${rounds} <span class="${symbolClass}">${symbol}</span></td>`;

    players.forEach((player, index) => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'bid-input';
        input.placeholder = player.name; // Set player name as placeholder
        input.oninput = () => validateBidInput(input);
        input.onchange = () => updateScore(index, input, rounds - 1);
        td.appendChild(input);
        row.appendChild(td);
    });

    document.getElementById('score-body').appendChild(row);

    saveGameState();
}

function validateBidInput(input) {
    input.value = input.value.replace(/[^-0-9]/g, ''); // Allow negative numbers as well
}

function updateScore(playerIndex, input, roundIndex) {
    const newBid = parseInt(input.value) || 0;
    const currentScoreElement = document.getElementById('total-scores').children[0].children[playerIndex + 1];
    let currentScore = parseInt(currentScoreElement.textContent) || 0;

    // Calculate the difference between the new and previous bid
    const previousBid = roundBids[roundIndex][playerIndex] || 0;
    const scoreDifference = newBid - previousBid;

    // Update player's total score
    currentScore += scoreDifference;
    currentScoreElement.textContent = currentScore;

    // Update bid tracking
    roundBids[roundIndex][playerIndex] = newBid;
    players[playerIndex].totalScore = currentScore;

    updateRanking();

    saveGameState();
}

function updateRanking() {
    const rankList = document.getElementById('rank-list');
    rankList.innerHTML = '';

    const rankedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
    rankedPlayers.forEach((player, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${player.name}: ${player.totalScore} points`;
        rankList.appendChild(li);
    });

    saveGameState();
}

function updateScoreTable() {
    const scoreBody = document.getElementById('score-body');
    scoreBody.innerHTML = '';
    rounds = 0;
    roundBids = []; // Clear bids tracking when resetting the table

    saveGameState();
}

function addRoundsToTable() {
    // Add rounds to the table based on saved state
    for (let i = 0; i < rounds; i++) {
        addRound();
    }
}

function endGame() {
    if (confirm('Are you sure you want to end the game? This will remove all players and their scores.')) {
        // Clear all data
        localStorage.removeItem('players');
        localStorage.removeItem('rounds');
        localStorage.removeItem('roundBids');

        // Reset the game state
        players = [];
        rounds = 0;
        roundBids = [];
        updatePlayersList();
        updateScoreTable();
        updateRanking();

        // Set a flag to clear localStorage on the next page load
        localStorage.setItem('resetGame', 'true');
        
        // Reload the page to reflect changes
        location.reload();
    }
}

// Handle page refresh
window.addEventListener('beforeunload', () => {
    // Save the current state before unloading
    saveGameState();
});

// Load the game state when the page loads
window.onload = loadGameState;
