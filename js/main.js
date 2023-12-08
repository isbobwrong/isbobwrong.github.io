function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const facts = [
    {text: "toto est gros", isTrue: true}, {text: "toto est mince", isTrue: false}, {text: "toto est raciste", isTrue: true}, {text: "toto est petit", isTrue: true}, {text: "toto est tolérent", isTrue: false}, {text: "toto est intolérent au lactose", isTrue: true}
];

const konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
var current = 0;

var hardModeFound = false;

const keyHandler = function (event) {
	// If the key isn't in the pattern, reset
	if (konamiPattern.indexOf(event.key) < 0 || event.key !== konamiPattern[current]) {
		current = 0;
		return;
	}

    current ++;

    // We can only find the secret once
	if (konamiPattern.length === current && !hardModeFound) {
		current = 0;
        hardModeFound = true;
        window.alert("You like danger, don't you ?");
        hardmodeActivated();
	}
};

/**
 * Creates a new bubble and appends it to the given parent
 * @param {HTMLElement} bubbleParent Parent element for our new bubble
 */
const bubbleFactory = (bubbleParent) => {
    const bubble = document.createElement("div");
    bubble.innerText = "correct";
    bubble.style = 'pointer-events: none; user-select: none';
    bubbleParent.appendChild(bubble);
}

/**
 * Creates a closable popup that displays gamestats and suggests to replay
 * @param {number} finalScore finalScore to display on the popup
 */
const popUpGameOverFactory = (finalScore) => {
    const background = document.createElement("div");
    background.classList.add("popup_background");

    const closePopup = () => {
        background.remove();
    }

    background.onclick = closePopup;

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.onclick = (e) => {
        e.stopPropagation();
    }

    popup.innerHTML = `<h1>
        GAME OVER !
    </h1>
    <p>
        You got a score of ${finalScore}, well done !
    </p>`;

    const buttonPlayAgain = document.createElement('button');
    buttonPlayAgain.onclick = closePopup;
    buttonPlayAgain.innerText = "Play again";

    popup.appendChild(buttonPlayAgain);

    document.getElementsByTagName("body")[0].appendChild(background);
    background.appendChild(popup);
}

/**
 * Helps you to get a random fact from the given fact list
 * @param {{message: string, isTrue: boolean}[]} factTab 
 * @returns {{message: string, isTrue: boolean}} random fact from the given tab
 */
function getRandomFact(factTab) {
    return factTab[getRandomInt(factTab.length)];
}

function main() {
    document.addEventListener('keydown', keyHandler, false);

    let lives = 3;
    let fact = nextFact();
    let lifeComponent;
    let scoreComponent;
    let score = 0;

    const noLivesRemainingCallback = () => {
        // defeat
        popUpGameOverFactory(score);
        resetContainers();
        lives = 3;
        updateLife(lifeComponent, lives);
        score = 0;
        updateScore(scoreComponent, score);

        startGame();
    }

    const goodAnswerCallback = () => {
        score++;
        updateScore(scoreComponent, score);
    }

    const penalityCallback = () => {
        lives--;
        updateLife(lifeComponent, lives);
        if(lives <= 0) {
            noLivesRemainingCallback();
        }
    }

    dragAndDropSetup(fact, goodAnswerCallback, penalityCallback);

    lifeComponent = lifeSetup();
    scoreComponent = scoreSetup();

    startGame();
}

/**
 * Function that is called at the start of every game
 */
function startGame() {
    // Nothing for now
}

/**
 * @returns {{message: string, isTrue: boolean}} gives the next fact
 */
function nextFact() {
    const bobFact = document.getElementById("bobFact");
    const fact = getRandomFact(facts);
    bobFact.innerText = fact.text;

    return fact;
}

/**
 * Adds answer to container if correct.
 * @param {{message: string, isTrue: boolean}} fact fact we are checking right now
 * @param {boolean} boolean answer you are giving
 * @param {() => void} goodAnswerCallback Function to call when you get the answer right
 * @param {() => void} penalityCallback Function to call when you get the answer wrong
 */
function addAnswer(fact, boolean, goodAnswerCallback, penalityCallback) {
    if(fact.isTrue != boolean) {
        penalityCallback();
        return;
    }

    let componentName;

    if(boolean) {
        componentName = "trueContainer";
    } else {
        componentName = "falseContainer";
    }

    bubbleFactory(document.getElementById(componentName));
    goodAnswerCallback();
}

/**
 * Creates an element to display lives remining
 * @returns {HTMLElement} gives the created element
 */
function lifeSetup() {
    const lifeComp = document.createElement('div');
    lifeComp.style = 'color: white';
    lifeComp.innerText = 'Lifes : 3';

    document.getElementById("bob").appendChild(lifeComp);
    
    return lifeComp;
}

/**
 * Modifies the number of life to display
 * @param {HTMLElement} lifeComp elements that displays lives remining
 * @param {number} newLife new number of lives
 */
function updateLife(lifeComp, newLife) {
    lifeComp.innerText = 'Lifes : ' + newLife;
}

/**
 * Creates an element to display current score
 * @returns {HTMLElement} gives the created element
 */
function scoreSetup() {
    const scoreComp = document.createElement('div');
    scoreComp.style = 'position: absolute; top: 2%; right: 2%;';
    scoreComp.innerText = 'Score: 0';

    document.getElementsByTagName("body")[0].appendChild(scoreComp);
    
    return scoreComp;
}

/**
 * Modifies the score to display
 * @param {HTMLElement} scoreComp elements that displays current score
 * @param {number} newScore new score
 */
function updateScore(scoreComp, newScore) {
    scoreComp.innerText = 'Score: ' + newScore;
}

/**
 * setuping listeners for drag and drop of the fact
 * @param {{message: string, isTrue: boolean}} fact The fact we will drag
 * @param {() => void} goodAnswerCallback Function to call when you get the answer right
 * @param {() => void} penalityCallback Function to call when you get the answer wrong
 */
function dragAndDropSetup(fact, goodAnswerCallback, penalityCallback) {
    function dropFactCallback(e) {
        switch (e.target.id) {
            case "trueContainer":
                addAnswer(fact, true, goodAnswerCallback, penalityCallback);
                fact = nextFact();
                break;
    
            case "falseContainer":
                addAnswer(fact, false, goodAnswerCallback, penalityCallback);
                fact = nextFact();
                break;
        
            default:
                console.log("dropped on " + e.target.id);
                break;
        }
    }

    document.getElementById("trueContainer").addEventListener('drop', dropFactCallback);
    document.getElementById("trueContainer").addEventListener('dragover', dragCancel);
    document.getElementById("falseContainer").addEventListener('drop', dropFactCallback);
    document.getElementById("falseContainer").addEventListener('dragover', dragCancel);
}

function dragCancel(e) {
    e.preventDefault();
}

function resetContainers() {
    document.getElementById("trueContainer").innerHTML = '';
    document.getElementById("falseContainer").innerHTML = '';
}

main();