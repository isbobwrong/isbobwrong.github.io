const balls = document.getElementsByClassName('eyeBall')

const left = document.getElementById('left-eye');
var rectLeft = left.getBoundingClientRect()

const right = document.getElementById('right-eye');
var rectRight = right.getBoundingClientRect()

const eyeCenterY = rectLeft.top+(rectLeft.height/2);
const eyesCenterX = [
    rectLeft.left+(rectLeft.width/2),
    rectRight.left+(rectRight.width/2)
]

document.addEventListener('mousemove', (event) =>{

    let mousex = event.clientX;
    let mousey = event.clientY;


    if (mousey < eyeCenterY ){
        mousey =( mousey * 50 / eyeCenterY)  + '%'
    }else {
        mousey = 50 + (((mousey - eyeCenterY) * 50 / (window.innerHeight - eyeCenterY)) ) + '%'
    }

    for(let i = 0; i < 2; i++){
        balls[i].style.top = mousey ;

        const eyeCenterX = eyesCenterX[i];

        let mousexPercent = '';

        if (event.clientY < eyeCenterY ){
            mousexPercent =( mousex* 50 / eyeCenterX)  + '%'
        }else {
            mousexPercent = 50 + (((mousex - eyeCenterX) * 50 / (window.innerWidth - eyeCenterX)) ) + '%'
        }
        
        balls[i].style.left = mousexPercent;
        balls[i].style.transform = 'translate(-' + mousexPercent + ',-' + mousey +')'
    }
})