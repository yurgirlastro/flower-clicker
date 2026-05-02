// Game State
const gameState = {
    petals: 0,
    totalClicks: 0,
    clickPower: 1,
    autoGrowerCount: 0,
    pollinatorCount: 0,
    sunnyDaysCount: 0,
    rainbowGardenCount: 0,
    flowerMultiplierCount: 0,
    clickPowerCount: 0,
    multiplier: 1,
    startTime: Date.now()
};

// Upgrade Costs
const upgradeCosts = {
    clickPower: 10,
    autoGrower: 50,
    pollinator: 200,
    sunnyDays: 500,
    rainbowGarden: 1000,
    flowerMultiplier: 2500
};

// Upgrade Production
const upgradeProduction = {
    autoGrower: 1,
    pollinator: 3,
    sunnyDays: 5,
    rainbowGarden: 10
};

// DOM Elements
const flowerButton = document.getElementById('flower');
const petalsDisplay = document.getElementById('petals');
const cpsDisplay = document.getElementById('cps');
const totalClicksDisplay = document.getElementById('totalClicks');
const resetBtn = document.getElementById('reset');
const playtimeDisplay = document.getElementById('playtime');
const upgradeBtns = document.querySelectorAll('.upgrade-btn');

// Load Game State
function loadGame() {
    const saved = localStorage.getItem('flowerClickerSave');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(gameState, data);
        gameState.startTime = Date.now() - (data.playtime || 0);
    }
}

// Save Game State
function saveGame() {
    const save = {
        ...gameState,
        playtime: Math.floor((Date.now() - gameState.startTime) / 1000)
    };
    localStorage.setItem('flowerClickerSave', JSON.stringify(save));
}

// Click Flower
function clickFlower() {
    const gain = gameState.clickPower * gameState.multiplier;
    gameState.petals += gain;
    gameState.totalClicks++;
    
    // Visual feedback
    showClickFeedback(`+${gain}`);
    animateFlower();
    
    updateDisplay();
    saveGame();
}

// Show Click Feedback Animation
function showClickFeedback(text) {
    const feedback = document.getElementById('clickFeedback');
    feedback.textContent = text;
    feedback.style.animation = 'none';
    setTimeout(() => {
        feedback.style.animation = 'floatUp 1s ease-out forwards';
    }, 10);
}

// Animate Flower
function animateFlower() {
    const flower = flowerButton.querySelector('.flower-emoji');
    flower.style.transform = 'scale(0.9) rotate(-5deg)';
    setTimeout(() => {
        flower.style.transform = 'scale(1) rotate(0deg)';
    }, 100);
}

// Buy Upgrade
function buyUpgrade(upgradeType) {
    const cost = upgradeCosts[upgradeType];
    
    if (gameState.petals >= cost) {
        gameState.petals -= cost;
        
        if (upgradeType === 'clickPower') {
            gameState.clickPower++;
            gameState.clickPowerCount++;
        } else if (upgradeType === 'autoGrower') {
            gameState.autoGrowerCount++;
        } else if (upgradeType === 'pollinator') {
            gameState.pollinatorCount++;
        } else if (upgradeType === 'sunnyDays') {
            gameState.sunnyDaysCount++;
        } else if (upgradeType === 'rainbowGarden') {
            gameState.rainbowGardenCount++;
        } else if (upgradeType === 'flowerMultiplier') {
            gameState.flowerMultiplierCount++;
            gameState.multiplier *= 2;
        }
        
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughPetals();
    }
}

// Show Not Enough Petals Message
function showNotEnoughPetals() {
    const flower = flowerButton.querySelector('.flower-emoji');
    flower.style.opacity = '0.5';
    setTimeout(() => {
        flower.style.opacity = '1';
    }, 200);
}

// Calculate Petals Per Second
function calculateCPS() {
    const autoGrower = gameState.autoGrowerCount * upgradeProduction.autoGrower;
    const pollinator = gameState.pollinatorCount * upgradeProduction.pollinator;
    const sunnyDays = gameState.sunnyDaysCount * upgradeProduction.sunnyDays;
    const rainbowGarden = gameState.rainbowGardenCount * upgradeProduction.rainbowGarden;
    
    return (autoGrower + pollinator + sunnyDays + rainbowGarden) * gameState.multiplier;
}

// Auto Production Loop
function autoProduction() {
    const cps = calculateCPS();
    if (cps > 0) {
        gameState.petals += cps / 10; // Update 10 times per second
        updateDisplay();
    }
}

// Update Display
function updateDisplay() {
    petalsDisplay.textContent = Math.floor(gameState.petals);
    totalClicksDisplay.textContent = gameState.totalClicks;
    cpsDisplay.textContent = calculateCPS().toFixed(1);
    
    // Update upgrade counts
    document.getElementById('clickPowerCount').textContent = `Owned: ${gameState.clickPowerCount}`;
    document.getElementById('autoGrowerCount').textContent = `Owned: ${gameState.autoGrowerCount}`;
    document.getElementById('pollinatorCount').textContent = `Owned: ${gameState.pollinatorCount}`;
    document.getElementById('sunnyDaysCount').textContent = `Owned: ${gameState.sunnyDaysCount}`;
    document.getElementById('rainbowGardenCount').textContent = `Owned: ${gameState.rainbowGardenCount}`;
    document.getElementById('flowerMultiplierCount').textContent = `Owned: ${gameState.flowerMultiplierCount}`;
    
    // Update upgrade button states
    updateUpgradeButtons();
}

// Update Upgrade Buttons
function updateUpgradeButtons() {
    upgradeBtns.forEach(btn => {
        const upgradeType = btn.getAttribute('data-upgrade');
        const cost = upgradeCosts[upgradeType];
        const canAfford = gameState.petals >= cost;
        
        btn.disabled = !canAfford;
        btn.textContent = canAfford ? 'Buy' : 'Buy';
    });
}

// Update Playtime
function updatePlaytime() {
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    let timeStr = 'Time played: ';
    if (hours > 0) timeStr += `${hours}h `;
    if (minutes > 0) timeStr += `${minutes}m `;
    timeStr += `${seconds}s`;
    
    playtimeDisplay.textContent = timeStr;
}

// Reset Game
function resetGame() {
    if (confirm('Are you sure you want to reset your progress?')) {
        localStorage.removeItem('flowerClickerSave');
        location.reload();
    }
}

// Event Listeners
flowerButton.addEventListener('click', clickFlower);
resetBtn.addEventListener('click', resetGame);

upgradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const upgradeType = btn.getAttribute('data-upgrade');
        buyUpgrade(upgradeType);
    });
});

// Initialize Game
loadGame();
updateDisplay();

// Game Loops
setInterval(autoProduction, 100); // Auto production every 100ms
setInterval(updatePlaytime, 1000); // Update playtime every 1 second
setInterval(saveGame, 10000); // Auto save every 10 seconds