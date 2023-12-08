function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

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

    const bubble = document.createElement('img');
    bubble.src = './svgDrawings/miniBubble.svg';
    bubble.style = 'width: 20%; height: 20%; pointer-events: none; user-select: none';

    bubbleParent.appendChild(bubble);
    console.log(bubbleParent)
}

/**
 * Creates a closable popup that displays gamestats and suggests to replay
 * @param {number} finalScore finalScore to display on the popup
 * @param {*} mistakes array of mistakes that leaded to losing the game
 */
const popUpGameOverFactory = (finalScore, mistakes) => {
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
        <br/>
        You were wrong on those facts:
    </p>`;

    mistakes.forEach(mistake => {
        popup.innerHTML +=
        `<h2>
            ${mistake.text}
        </h2>
        <p>
            This fact was ${mistake.isTrue} and this proves it:
            <br/>
            ${mistake.explaination}
            <br/>
            Here is the repartition of people answers: True ${mistake.trueProportion}% / False ${mistake.falseProportion}%
        </p>`;
    });

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

    const easteregg2 = new Audio('./src/easter_egg2_sound.mp3');
    let easterEgg2Ready = false;

    setTimeout(function() {
        easterEgg2Ready = true;
    }, 3600000);

    let lives = 3;
    let score = 0;
    let lifeComponent;
    let scoreComponent;
    const mistakes = [];

    let fact;

    const noLivesRemainingCallback = () => {
        // defeat
        popUpGameOverFactory(score, mistakes);
        resetDragZones();
        lives = 3;
        updateLife(lifeComponent, lives);
        score = 0;
        updateScore(scoreComponent, score);
        
        while(mistakes.length>0) {
            mistakes.pop();
        }

        FetchFacts().then((values) => {
            fact = nextFact(values);
        })
    }

    const goodAnswerCallback = (fact) => {
        score++;
        updateScore(scoreComponent, score);

        PostAnswerOnFact(fact.id, fact.isTrue).then(() => {}).catch((err) => console.log(err));

        if(easterEgg2Ready || hardModeFound) {
            easteregg2.play();
            easterEgg2Ready = false;
        }
        if(score == 10) {
            // 10 points easter egg
            const audio = new Audio('./src/easter_egg1_sound.mp3');
            audio.play();
        } else if(score == 69) {
            // 69 points easter egg
            const sinjos = document.createElement('img');
            sinjos.src = './svgDrawings/monkey.svg';
            sinjos.style = 'width: 50%; height: 50%; position: absolute; top: 0; left: 0';
            sinjos.classList.add('across_the_screen');
            sinjos.onclick = () => {
                lives++;
            }

            document.getElementsByTagName("body")[0].appendChild(sinjos);

            setTimeout(function() {
                sinjos.remove();
            }, 2000);
        }
    }

    const penalityCallback = (fact) => {
        lives--;
        updateLife(lifeComponent, lives);
        mistakes.push(fact);
        PostAnswerOnFact(fact.id, !fact.isTrue).then(() => {}).catch((err) => console.log(err));
        if(lives <= 0) {
            noLivesRemainingCallback();
        }
    }

    FetchFacts().then((values) => {
        fact = nextFact(values);
        dragAndDropSetup(fact, values, goodAnswerCallback, penalityCallback);
    })
    
    lifeComponent = lifeSetup();
    scoreComponent = scoreSetup();
    
    startGame();
}

function startGame() {
    // Nothing for now
}

/**
 * @param {*} factList List of facts from API
 * @returns {{message: string, isTrue: boolean}} gives the next fact
 */
function nextFact(factList) {
    const bobFact = document.getElementById("bobFact");
    const fact = getRandomFact(factList);
    bobFact.innerText = fact.text;

    return fact;
}

/**
 * Adds answer to container if correct.
 * @param {{message: string, isTrue: boolean}} fact fact we are checking right now
 * @param {boolean} boolean answer you are giving
 * @param {(fact: {*}) => void} goodAnswerCallback Function to call when you get the answer right
 * @param {(fact: {*}) => void} penalityCallback Function to call when you get the answer wrong
 */
function addAnswer(fact, boolean, goodAnswerCallback, penalityCallback) {
    if(fact.isTrue != boolean) {
        penalityCallback(fact);
        return;
    }

    let componentName;

    if(boolean) {
        componentName = "trueDragZone";
    } else {
        componentName = "falseDragZone";
    }

    bubbleFactory(document.getElementById(componentName));
    goodAnswerCallback(fact);
}

/**
 * Creates an element to display lives remining
 * @returns {HTMLElement} gives the created element
 */
function lifeSetup() {
    const lifeComp = document.createElement('div');
    lifeComp.style = 'top: 0; user-select: none';
    lifeComp.innerText = '❤️❤️❤️';

    document.getElementById("bobContainer").appendChild(lifeComp);
    
    return lifeComp;
}

/**
 * Modifies the number of life to display
 * @param {HTMLElement} lifeComp elements that displays lives remining
 * @param {number} newLife new number of lives
 */
function updateLife(lifeComp, newLife) {
    switch (newLife) {
        case 3:
            lifeComp.innerText = '❤️❤️❤️';
        break;

        case 2:
            lifeComp.innerText = '❤️❤️';
        break;

        case 1:
            lifeComp.innerText = '❤️';
        break;
    
        default:
            lifeComp.innerText = '';
        break;
    }
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
 * @param {*} fact The fact we will drag
 * @param {*} facts The fact list from API
 * @param {(fact: {*}) => void} goodAnswerCallback Function to call when you get the answer right
 * @param {(fact: {*}) => void} penalityCallback Function to call when you get the answer wrong
 */
function dragAndDropSetup(fact, facts, goodAnswerCallback, penalityCallback) {
    function dropFactCallback(e) {
        switch (e.target.id) {
            case "trueDragZone":
                addAnswer(fact, true, goodAnswerCallback, penalityCallback);
                fact = nextFact(facts);
                break;
    
            case "falseDragZone":
                addAnswer(fact, false, goodAnswerCallback, penalityCallback);
                fact = nextFact(facts);
                break;
        
            default:
                console.log("dropped on " + e.target.id);
                break;
        }
    }

    document.getElementById("trueDragZone").addEventListener('drop', dropFactCallback);
    document.getElementById("trueDragZone").addEventListener('dragover', dragCancel);
    document.getElementById("falseDragZone").addEventListener('drop', dropFactCallback);
    document.getElementById("falseDragZone").addEventListener('dragover', dragCancel);
}

function dragCancel(e) {
    e.preventDefault();
}

function resetDragZones() {
    document.getElementById("trueDragZone").innerHTML = '';
    document.getElementById("falseDragZone").innerHTML = '';
}

main();