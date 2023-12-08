const hardmodeActivated = () => {
    const trueFrame = document.getElementById('trueFrame');
    trueFrame.classList.add("hardTrue");

    const falseFrame = document.getElementById('falseFrame');
    falseFrame.classList.add("hardFalse");

    const factFrame = document.getElementById('bobFrame');
    factFrame.classList.add("hardFact");

    const body = document.body;
    body.classList.add("hardBody");
} 
