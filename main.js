
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';

// CAMERA RENDERER AND SCENE //
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000020);
const aspectRatio = window.innerWidth / window.innerHeight; // Adjust aspect ratio
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);
const cameraRight = new THREE.PerspectiveCamera(95, aspectRatio / 2, 0.1, 1000 );
const cameraLeft = new THREE.PerspectiveCamera(95, aspectRatio / 2, 0.1, 1000 );
camera.position.set(20, 20, 0);
cameraLeft.lookAt(0, 0, 0);

//RENDERERS
const renderer = new THREE.WebGLRenderer({ // Renderer for full screen
    canvas: document.querySelector('#c1')
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);
renderer.autoClear = false;

const renderer2 = new THREE.WebGLRenderer({ // Renderer for split screen
    canvas: document.querySelector('#c2')
})
renderer2.setPixelRatio(window.devicePixelRatio);
renderer2.setSize(window.innerWidth / 2, window.innerHeight); // Set width to half of window width
renderer2.render(scene, cameraLeft);

// TORUS THINGY (VERY IOMPORTNATNT)
// const geometry = new THREE.TorusGeometry(10, 3, 16, 100)
// const material = new THREE.MeshStandardMaterial({color:0xFFFFFF, wireframe:true});
// const torus = new THREE.Mesh(geometry, material);
// scene.add(torus);

//MOON AND STARS
function addStar(){
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial({color: 0xffffff})
    const star = new THREE.Mesh( geometry, material);
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread( 1000 ));
    
    star.position.set(x, y, z);
    scene.add(star)
}

Array(800).fill().forEach(addStar)

// let moon;
// const moonLoader = new GLTFLoader();
// moonLoader.load(
//     'moon/scene.gltf',
//     function(gltf) {
//         moon = gltf.scene;
//         moon.scale.set(250,250,250);
//         scene.add(moon);
//         moon.position.set(250, 250, 250);
//     },
//     function(xhr) {
//         console.log((xhr.loaded / xhr.total * 100) + '%loaded');
//     },
//     function (error) {
//         console.error(error);
//     }
// )

// HELPERS
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const gridHelper = new THREE.GridHelper(1000, 500, 100,  0xAA00ff);
const axesHelper = new THREE.AxesHelper(50); // Length of axes
const rightHelper = new THREE.CameraHelper(cameraRight);
const leftHelper = new THREE.CameraHelper(cameraLeft);
// scene.add(axesHelper);
// scene.add(gridHelper);

// VIEW UTILS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let lastKeyPressTime = {};
let lastKeyUpTime = {};

let keyDown = {
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowUp': false,
    'ArrowDown': false,
    'w': false,
    'a': false,
    's': false,
    'd': false,
    ' ': false,
    'c': false,
    'o': false,
    'p': false,
    'i': false,
    'e': false,
    'g': false,
    'b': false,
    '1': false,
    '2': false,
    '3': false,
    '4': false
};

let doubleKeyPress = {
    'ArrowLeft': false,
    'ArrowRight': false,
    'a': false,
    'd': false
};

// Event listener for key presses and releases

document.addEventListener('keydown', (event) => {
    if (keyDown.hasOwnProperty(event.key)) {
        keyDown[event.key] = true;

        // Check for double presses of specific keys
        if (doubleKeyPress.hasOwnProperty(event.key)) {
            if (lastKeyPressTime[event.key] && Date.now() - lastKeyPressTime[event.key] < 200 && Date.now() - lastKeyUpTime[event.key] < 200) {
                // Double press action for ArrowRight and 'd'
                // console.log(`Double press detected for ${event.key}`);
                doubleKeyPress[event.key] = true; // Set to true to indicate a double press
            } else {
                doubleKeyPress[event.key] = false; // Reset for next detection
            }
            lastKeyPressTime[event.key] = Date.now(); // Update the last press time
        }
    }
});

var scorePoints = document.getElementsByClassName("parallelogram");

document.addEventListener('keyup', (event) => {
    if (keyDown.hasOwnProperty(event.key)) {
        keyDown[event.key] = false;
        lastKeyUpTime[event.key] = Date.now();
        doubleKeyPress[event.key] = false;
    }
});

function cameraDebug()
{
    console.log("\n\ncamera.position.x =  " + camera.position.x);
    console.log("camera.position.y =  " + camera.position.y);
    console.log("camera.position.z =  " + camera.position.z);
    console.log("camera.rotation.x =  " + camera.rotation.x);
    console.log("camera.rotation.y =  " + camera.rotation.y);
    console.log("camera.rotation.z =  " + camera.rotation.z);
}

//ARENA CLASS
class Arena extends THREE.Mesh {
    constructor(centerPosition, width, height, depth)
    {

        // Create geometry for the arena
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const textureLoader = new THREE.TextureLoader();
        // const texture = textureLoader.load('purplebox.jpeg');
        const arenaColor = 0x000000;
        // Create material
        const material = new THREE.MeshPhongMaterial({color: 0x101030, wireframe:false});
        // Call super constructor to set up mesh
        super(geometry, material);
        
        // Set position of the arena
        this.position.copy(centerPosition);
        
        // Calculate left corner position based on the center and dimensions
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const halfDepth = depth / 2;

        const leftCornerX = this.position.x - halfWidth;
        const bottomCornerY = this.position.y - halfHeight;
        const nearCornerZ = this.position.z - halfDepth;

        // Calculate and store coordinates of every corner
        this.leftCorner = new THREE.Vector3(leftCornerX, bottomCornerY, nearCornerZ);
        this.rightCorner = new THREE.Vector3(leftCornerX + width, bottomCornerY, nearCornerZ);
        this.topCorner = new THREE.Vector3(leftCornerX, bottomCornerY + height, nearCornerZ);
        this.farCorner = new THREE.Vector3(leftCornerX, bottomCornerY, nearCornerZ + depth);
        this.length = width;
        this.height = height;
        this.width = depth;
        this.paddleRight = new Paddle(this, false);
        this.paddleLeft = new Paddle(this, true);
        this.ball = new Ball(this);
        this.bot = new Bot(this, this.paddleRight, this.paddleLeft);
        this.isActive = true;
        this.horizontalBlur = new ShaderPass(HorizontalBlurShader);
        this.verticalBlur = new ShaderPass(VerticalBlurShader);
        this.horizontalBlur.uniforms['tDiffuse'].value = null; // Set the input texture to null
        this.verticalBlur.uniforms['tDiffuse'].value = null; // Set the input texture to null
        this.horizontalBlur.renderToScreen = true; // Render to a texture
        this.verticalBlur.renderToScreen = true; // Render to the screen
        this.horizontalBlur.uniforms.h.value = 0;
        this.verticalBlur.uniforms.v.value = 0;
        this.isBlurred = false;
        this.isBeingBlurred = false;
        this.isBeingReset = false;
        this.game = new Game(this);
        this.maxSpeed = this.width / 40;
        this.isSplitScreen = false;
        this.test = 0.9;
    }
    addPoint(side) {
        if (side === 'left') {
            scorePoints.item(this.game.leftScore).style.backgroundColor = "#ff0000cc";
            this.game.leftScore++;
        }
        else {
            scorePoints.item(this.game.rightScore + 3).style.backgroundColor = "#ff0000cc";
            this.game.rightScore++;
        }
    }
    resetScoreDisplay() {
        for (let i = 0; i < scorePoints.length; i++) {
            scorePoints.item(i).style.backgroundColor = "#0008ff51";
        }
    }
    monitorArena()
    {
        this.paddleLeft.light.position.copy(this.paddleLeft.position);
        this.paddleRight.light.position.copy(this.paddleRight.position);
        this.paddleLeft.particles.updateParticles();
        this.paddleRight.particles.updateParticles();
        this.ball.particles.updateParticles();
        if (this.ball.isRolling)
            this.ball.monitorMovement();
        this.ball.light.position.copy(this.ball.position);
        this.ball.light.position.y += this.height;
        if (this.ball.isRolling)
            this.ball.rotation.y += 0.1;
        if (this.isActive)
            this.paddleLeft.animatePaddle(doubleKeyPress['a'], doubleKeyPress['d'], keyDown['a'], keyDown['d'], this, keyDown['w']);
        if (!this.bot.isPlaying)
            this.paddleRight.animatePaddle(doubleKeyPress['ArrowRight'], doubleKeyPress['ArrowLeft'], keyDown['ArrowRight'], keyDown['ArrowLeft'], this, keyDown['ArrowUp']);
        if (keyDown[' '] && this.game.isPlaying && !this.ball.isRolling)
        {
            this.ball.speedX = 0;
            this.ball.speedZ = this.ball.initialSpeed;
            this.ball.isgoingRight = true;
            this.ball.isgoingLeft = false;
            this.ball.isRolling = true;
            // this.bot.isPlaying = true;
        }
        if (keyDown['1'])
            this.changeTheme(new Theme1());
        if (keyDown['2'])
            this.changeTheme(new Theme2());
        if (keyDown['3'])
            this.changeTheme(new Theme3());
        if (keyDown['4'])  
            this.changeTheme(new Theme4());
        if (keyDown['b'])
        {
            if (!this.isBeingBlurred)
            {
                this.isBeingBlurred = true;
                this.blurScreen();
            }
        }
        if (keyDown['c'])
        {
            this.paddleLeft.light.power += 0.1;
            this.paddleRight.light.power += 0.1;
            this.bot.isPlaying = !this.bot.isPlaying;
        }
        if (keyDown['e'])
        {
            // cameraLeft.position.copy(this.position);
            cameraLeft.position.y += this.length * 3;
            cameraLeft.position.z -= this.length * 3;
            cameraLeft.position.x += this.length * 3;
            cameraLeft.lookAt(this.position);
            swapToSplitScreen();
            this.setSplitCameraPositions(camera, cameraLeft);
            this.game.isPlaying = true;
            this.isSplitScreen = true;
        }
        if (keyDown['p'])
        {
            swapToFullScreen();
            this.setTopView(camera);
        }
        if(keyDown['o'])
            this.paddleRight.changeBlenderModel('godzilla/scene.gltf');
        if (this.game.leftScore >= this.game.maxScore || this.game.rightScore >= this.game.maxScore)
        {
            this.game.isPlaying = false;
            this.game.isOver = true;
        }
        if (this.bot.isPlaying)
            this.bot.play();
        if (this.ball.collisionWithLeftPaddle(this.paddleLeft))
            this.ball.goToRight(this.paddleLeft);
        if (this.ball.collisionWithRightPaddle(this.paddleRight))
            this.ball.goToLeft(this.paddleRight);
        if (this.ball.rightScore(this.paddleLeft) && !this.isBeingReset)
        {
            this.addPoint('right');
            if (this.game.leftScore < this.game.maxScore && this.game.rightScore < this.game.maxScore)
                this.resetPoint();
        }
        if (this.ball.leftScore(this.paddleRight) && !this.isBeingReset)
        {
            this.addPoint('left');
            if (this.game.leftScore < this.game.maxScore && this.game.rightScore < this.game.maxScore)
                this.resetPoint();
        }
        if (this.game.rightScore >= this.game.maxScore && !this.isBeingReset)
        {
            this.isBeingReset = true;
            this.resetPositions(this.paddleLeft, this.paddleRight, false, glitchLeft);
        }
        else if (this.game.leftScore >= this.game.maxScore && !this.isBeingReset)
        {
            this.isBeingReset = true;
            this.resetPositions(this.paddleRight, this.paddleLeft, true, glitchRight);
        }
    }
    setSplitCameraPositions(_cameraRight, _cameraLeft)
    {
        const duration = 1500;
        let targetY = this.position.y + this.height * 3;
        let targetZ = this.position.z + this.width * 0.85;
        let targetX = this.position.x;
        // Create tweens for each property
        const leftTween = new TWEEN.Tween(_cameraLeft.position)
            .to({ y: targetY, z: targetZ, x:targetX }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                _cameraLeft.lookAt(this.position);
            })
        targetY = this.position.y + this.height * 3;
        targetZ = this.position.z - this.width * 0.85;
        targetX = this.position.x;
        // Create tweens for each property
        const rightTween = new TWEEN.Tween(_cameraRight.position)
        .to({ y: targetY, z: targetZ, x: targetX }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            _cameraRight.lookAt(this.position);
        })
        leftTween.start();
        rightTween.start();
    }
    blurScreen()
    {
        const duration = 1500;
        let target;
        if (!this.isBlurred)
            target = 0.002;
        else
            target = 0;
        new TWEEN.Tween(this.horizontalBlur.uniforms.h)
        .to({value: target}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            this.isBlurred = !this.isBlurred;
            this.isBeingBlurred = false;
        })
        .start();

        new TWEEN.Tween(this.verticalBlur.uniforms.v)
        .to({value: target}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)

        .start();
    }
    setTopView(camera)
    {
        let targetY = this.position.y + this.height + this.width;
        let targetX = this.position.x;
        let targetZ = this.position.z;
        const duration = 1500;
        new TWEEN.Tween(camera.position)
        .to({x: targetX, y: targetY, z: targetZ}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

        targetX = Math.PI / -2;
        targetY = 0;
        targetZ = Math.PI / -2;
        new TWEEN.Tween(camera.rotation)
        .to({z: targetZ, x: targetX, y: targetY}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            this.isSplitScreen = false;
        })
        .start();
    }
    resetPoint()
    {
        this.ball.isgoingRight = true;
        this.ball.isgoingLeft = false;
        this.ball.speedZ = 0;
        this.ball.speedX = 0;
        this.ball.isRolling = false;
        this.ball.bounceCount = 0;
        this.ball.material.color.set(this.ball.initialColor);
        this.ball.particles.explodeParticles(this.ball.position, this.ball.initialColor);
        this.ball.position.copy(this.ball.startingPoint);
    }
    resetPositions(loserPaddle, winnerPaddle, leftScored, whichGlitch)
    {
        let duration = 1150;

        loserPaddle.light.power = 0;
        winnerPaddle.light.power = 0;
        this.ball.light.power = 0;
        let tmpCamera;
        if (leftScored)
            tmpCamera = cameraLeft;
        else
            tmpCamera = camera;

        // BALL UP
        let ballUp = new TWEEN.Tween(this.ball.position)
        .to({y: (this.ball.position.y + this.paddleLeft.height * 5), z: winnerPaddle.position.z}, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            this.ball.rotation.y += 0.1;
            this.ball.rotation.z += 0.1;
        });

        // BALL TO CAMERA
        let ballToCamera = new TWEEN.Tween(this.ball.position)
        .to({x: tmpCamera.position.x, y: tmpCamera.position.y, z: tmpCamera.position.z}, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            glitch(whichGlitch);
        });

        // PADDLE RESETS
        let leftReset = new TWEEN.Tween(this.paddleLeft.position)
        .to({x: this.position.x}, duration)
        .easing(TWEEN.Easing.Quadratic.Out);
        let rightReset = new TWEEN.Tween(this.paddleRight.position)
        .to({x: this.position.x}, duration)
        .easing(TWEEN.Easing.Quadratic.Out);

        // BALL RESETS
        let targetY = this.ball.startingPoint.y + this.length / 2;
        const firstTween = new TWEEN.Tween(this.ball.position)
        .to({x: this.ball.startingPoint.x, y: targetY, z: this.ball.startingPoint.z}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)

        const secondTween = new TWEEN.Tween(this.ball.position)
        .to({y: this.ball.startingPoint.y}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            this.resetScoreDisplay();
            loserPaddle.light.power = loserPaddle.defaultLight;
           winnerPaddle.light.power = winnerPaddle.defaultLight;
           this.ball.isgoingRight = true;
           this.ball.isgoingLeft = false;
           this.ball.light.power = this.ball.startingPower;
           this.ball.bounceCount = 0;
           this.ball.material.color.set(this.ball.initialColor);
           this.isBeingReset = false;
           if (this.game.isOver)
           {
                this.game.isPlaying = false;
                this.game.isOver = false;
                this.game.leftScore = 0;
                this.game.rightScore = 0;
                swapToFullScreen();
                this.setTopView(camera);
           }

        });
        const powerPaddleLight = new TWEEN.Tween(loserPaddle.light)
        .to({power: loserPaddle.defaultLight}, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            winnerPaddle.light.power = loserPaddle.light.power;
        });
        const powerBallLight = new TWEEN.Tween(this.ball.light)
        .to({power: this.ball.startingPower}, duration)
        .easing(TWEEN.Easing.Quadratic.Out);

        ballUp.chain(ballToCamera);
        ballToCamera.chain(leftReset, rightReset, firstTween);
        firstTween.chain(secondTween, powerPaddleLight, powerBallLight);
        ballUp.start();
        this.ball.isRolling = false;
        this.ball.speedZ = 0;
        this.ball.speedX = 0;
    }
    changeTheme(theme)
    {
        this.material.color.set(theme.arenaColor);
        this.paddleLeft.material.color.set(theme.paddleColor);
        this.paddleRight.material.color.set(theme.paddleColor);
        this.paddleLeft.superChargingColor = theme.paddleSuperchargingColor;
        this.paddleRight.superChargingColor = theme.paddleSuperchargingColor;
        this.paddleLeft.dashingColor = theme.paddleDashingColor;
        this.paddleRight.dashingColor = theme.paddleDashingColor;
        this.paddleLeft.defaultColor = theme.paddleColor;
        this.paddleRight.defaultColor = theme.paddleColor;
        this.ball.material.color.set(theme.ballInitialColor);
        this.ball.finalColor = theme.ballFinalColor;
        this.ball.initialColor = theme.ballInitialColor;
        scene.background = new THREE.Color(theme.backgroundColor);
    }
}

// PADDLE CLASS

class Paddle extends THREE.Group {
    constructor(arena, left) {
        super();

        // Calculate paddle dimensions based on arena size
        const paddleWidth = arena.width * 0.1; // 20% of arena width
        const paddleHeight = arena.length * 0.05; // 5% of arena height
        const paddleDepth = paddleHeight * 0.25; // 2% of arena depth

       // Create geometry for the paddle
       const geometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);

       // Create material
       this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

       // Create paddle mesh
       this.paddleMesh = new THREE.Mesh(geometry, this.material);

       // Add paddle mesh to the group
       this.add(this.paddleMesh);

        // Store the model name
        if (left)
            this.modelName = 'spaceShip/scene.gltf';
        else
            this.modelName = 'spaceShip/scene.gltf';
        this.model;
        // Load Blender model
        const loader = new GLTFLoader();
        loader.load(
            this.modelName,
            (gltf) => {
                this.model = gltf.scene;
                // Position the this.model relative to the paddle
                if (!left) {
                    this.model.position.set(0, 0, 2); // Adjust position as needed
                    this.model.rotation.y = Math.PI;
                }
                else
                    this.model.position.set(0, 0, -2); // Adjust position as needed
                if (left)
                    this.model.scale.set(0.2, 0.2, 0.2); // Adjust scale as needed
                else
                    this.model.scale.set(0.2, 0.2, 0.2); // Adjust scale as needed
                // Add the this.model to the group
                this.add(this.model);
                
                // Now you can access the position of paddle.paddleMesh
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );

        // Set position of the paddle mesh
        this.paddleMesh.position.set(0, 0, 0);

        // Set position of the group (including both paddle mesh and model)
        const arenaTopY = arena.position.y + arena.height / 2;
        this.position.set(
            arena.position.x,
            arenaTopY + paddleHeight / 2, // Adjust for paddle height
            arena.position.z + arena.width / 2
        );
        if (left)
            this.position.z -= arena.width;

        this.width = paddleWidth;
        this.height = paddleHeight;
        this.depth = paddleDepth;
        // Store arena reference
        this.arena = arena;
        this.scene = scene;

        // Add other properties and methods as needed
        this.particles = new Particle(this.scene, 100, left, this, false);
        this.light = new THREE.PointLight(0x4B4FC5);
        scene.add(this.light);
        this.defaultLight = this.arena.width * this.arena.length / 7.5;
        this.light.power = this.defaultLight;
        this.defaultColor = this.material.color.clone();
        this.superChargingColor = new THREE.Color(0xff6e6e);
        this.dashingColor = new THREE.Color(0xf4ff69);
        this.light.castShadow = true;
        this.isPowered = false;
        this.isDashing = false;
        this.defaultFlippingSpeed = 10;
        this.flippingSpeed = 0.5;
    }
    async changeBlenderModel(modelName)
    {
        this.scene.remove(this.model);
        const loader = new GLTFLoader();
        loader.load(
            modelName,
            (gltf) => {
                this.model = gltf.scene;
                // Position the this.model relative to the paddle
                this.model.position.set(0, 0, 2); // Adjust position as needed
                this.model.rotation.y = Math.PI;
                this.model.scale.set(0.15, 0.15, 0.15); // Adjust scale as needed
                this.add(this.model);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
            }
        );
    }
    animatePaddle(doubleKeyPressRight, doubleKeyPressLeft, keyRight, keyLeft, arena, keyPower)
    {
        if (doubleKeyPressRight && !this.isDashing)
        {
            this.isDashing = true;
            this.dash(arena.width * 16, false);
            doubleKeyPressRight = false;
        }
        if (doubleKeyPressLeft && !this.isDashing)
        {
            this.isDashing = true;
            this.dash(arena.width * -16, true);
            doubleKeyPressLeft = false;
        }
        // Detect normal paddle movement
        if (keyRight && this.position.x + 0.008 <= arena.rightCorner.x)
        {
            this.position.x += 0.016 * arena.length;
            if (arena.ball.isSupercharging && (this.position.z * arena.ball.position.z > 0))
                arena.ball.position.x += 0.016 * arena.length;
        }
        if (keyLeft && this.position.x - 0.008 >= arena.leftCorner.x)
        {
            this.position.x -= 0.016 * arena.length;
            if (arena.ball.isSupercharging && (this.position.z * arena.ball.position.z > 0))
                arena.ball.position.x -= 0.016 * arena.length;
        }
        if (keyPower)
        {
            this.material.color.set(this.superChargingColor);
            this.isPowered = true;
        }
        if (this.arena.ball.isSupercharging && this.position.z * this.arena.ball.position.z > 0)
            this.model.rotation.z += this.flippingSpeed;
    }
    dash(range, isLeft)
    {
        let targetX;
        this.material.color.set(this.dashingColor);
        if (!isLeft)
        {
            targetX = this.position.x + range * 0.016;
            if (targetX > this.arena.rightCorner.x)
                targetX = this.arena.rightCorner.x;
        }
        else
        {
            targetX = this.position.x + range * 0.016;
            if (targetX < this.arena.leftCorner.x)
                targetX = this.arena.leftCorner.x;
        }
        if (this.arena.ball.isSupercharging && (this.position.z * this.arena.ball.position.z > 0))
        {
            new TWEEN.Tween(this.arena.ball.position)
            .to({x: targetX}, 250)
            .easing(TWEEN.Easing.Linear.None)
            .start();
        }
        new TWEEN.Tween(this.position)
        .to({x: targetX}, 250)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            setTimeout(() => {
                this.isDashing = false;
                if (this.isPowered)
                    this.material.color.set(this.superChargingColor);
                else
                    this.material.color.set(this.defaultColor);
            }, 50);
                
        })
        .start();
        // make the spaceship flip while dashing
        let targetRotation;
        if (this.model.rotation.z == 0)
            targetRotation = Math.PI * 2;
        else
            targetRotation = 0;
        new TWEEN.Tween(this.model.rotation)
        .to({z: targetRotation}, 250)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
    }
}

class Ball extends THREE.Mesh {
    constructor(arena)
    {
        // BALL CREATION
        const size = arena.width * 0.025;
        const geometry = new THREE.SphereGeometry(size, 16, 8);
        const textureLoader = new THREE.TextureLoader();
        // const texture = textureLoader.load('ball.jpg');
        const material = new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false});
        super(geometry, material);
        this.light = new THREE.PointLight(0xffffff);
        scene.add(this.light);
        this.startingPower = 20;
        this.light.power = this.startingPower;
        this.light.castShadow = true;
        // ATRIBUTES
        this.scene = scene;
        this.radius = arena.width * 0.025;
        this.startingPoint = new THREE.Vector3(arena.position.x, arena.position.y + arena.height / 2 + this.radius, arena.position.z);
        this.position.copy(this.startingPoint);
        this.isRolling = false;
        this.speedX = 0;
        this.speedY = 0;
        this.isgoingLeft = false;
        this.isgoingRight = false;
        this.initialColor = this.material.color.clone();
        this.finalColor = new THREE.Color(0xFFFFFF);
        this.zLimit1 = arena.position.z + arena.width / 2;
        this.zLimit2 = arena.position.z - arena.width / 2;
        this.arena = arena;
        this.initialSpeed = this.arena.width / 200;
        this.isSupercharging;
        this.bounceCount = 0;
        this.justCollisioned = false;
        this.particles = new Particle(this.scene, 100000, false, this, true);

    }
    leftScore(paddle)
    {
        return (this.position.z > paddle.position.z + paddle.width);
    }
    rightScore(paddle)
    {
        return (this.position.z < paddle.position.z - paddle.width);
    }
    collisionWithBorder(paddle1, paddle2)
    {
        return (this.position.z >= paddle1.position.z || this.position.z <= paddle2.position.z);
    }
    checkCollisionBoxSphere(box, sphere) {
        // Get the bounding box of the box object
        let boxBox = new THREE.Box3().setFromObject(box.paddleMesh);
    
        // Get the bounding sphere of the sphere object
        let sphereSphere = new THREE.Sphere();
        sphere.geometry.computeBoundingSphere();
        sphereSphere.copy(sphere.geometry.boundingSphere);
        sphereSphere.applyMatrix4(sphere.matrixWorld);
    
        // Check for intersection between the box and sphere bounding volumes
        return boxBox.intersectsSphere(sphereSphere);
    }
    collisionWithLeftPaddle(paddle)
    {
        if (this.checkCollisionBoxSphere(paddle, this) && this.isgoingLeft && Math.abs(this.speedZ) > 0)
        {
            paddle.particles.explodeParticles(paddle.position, paddle.material.color);
            this.justCollisioned = true;
            this.isgoingLeft = !this.isgoingLeft;
            this.isgoingRight = !this.isgoingRight;
            this.bounceCount++;
            if (this.bounceCount <= 10) {
                // Calculate the interpolation factor
                const factor = this.bounceCount / 20;
                // Perform linear interpolation
                // this.material.color.lerpColors(this.initialColor, this.finalColor, factor);
            }
            // make the spaceship do a backflip
            if (!paddle.isPowered)
            {
                let targetRotation;
                if (paddle.model.rotation.y == 0)
                    targetRotation = Math.PI * 2;
                else
                    targetRotation = 0;
                new TWEEN.Tween(paddle.model.rotation)
                .to({y: targetRotation}, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            }
            return true;
        }
        return false;
    }
    collisionWithRightPaddle(paddle)
    {
        if (this.checkCollisionBoxSphere(paddle, this) && this.isgoingRight && this.speedZ > 0)
        {
            paddle.particles.explodeParticles(paddle.position, paddle.material.color);
            this.justCollisioned = true;
            this.isgoingRight = !this.isgoingRight;
            this.isgoingLeft = !this.isgoingLeft;
            this.bounceCount++;
            if (this.bounceCount <= 10) {
                // Calculate the interpolation factor
                const factor = this.bounceCount / 20;
                // Perform linear interpolation
                // this.material.color.lerpColors(this.initialColor, this.finalColor, factor);
            }
            // make the spaceship do a backflip
            if (!paddle.isPowered)
            {
                let targetRotation;
                if (paddle.model.rotation.y == Math.PI)
                    targetRotation = Math.PI * 3;
                else
                    targetRotation = Math.PI;
                new TWEEN.Tween(paddle.model.rotation)
                .to({y: targetRotation}, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            }
            return true;
        }
        return false;
    }
    goToLeft(paddle)
    {
        if (!paddle.isPowered)
        {
            let distanceFromCenter = (this.position.x - paddle.position.x) / paddle.width;
            if (distanceFromCenter * (this.position.x - paddle.paddleMesh.position.x) > 0)
                this.speedX = distanceFromCenter * 0.015 * this.arena.width;
            else
                this.speedX += distanceFromCenter * 0.015 * this.arena.width;
            if (Math.abs(this.speedZ) <= this.arena.width / 40)
                this.speedZ *= -1.08;
            else
                this.speedZ *= -1;
        }
        else
        {
            this.isSupercharging = true;
            const tmpSpeed = this.speedZ;
            this.speedZ = 0;
            this.speedX = 0;
            setTimeout(() => {
                if (Math.abs(this.tmpSpeed) * 1.5 >= this.arena.maxSpeed)
                    this.speedZ = tmpSpeed * -1;
                else
                    this.speedZ = tmpSpeed * -1.5;
                if (Math.abs(this.speedZ) > this.arena.maxSpeed)
                {
                    if (this.speedZ * this.arena.maxSpeed < 0)
                        this.speedZ = this.arena.maxSpeed * -1;
                    else
                        this.speedZ = this.arena.maxSpeed;
                }
                this.speedX = (this.position.x - paddle.position.x) / paddle.width * 0.015 * this.arena.width;
                this.isSupercharging = false;
                const rotationReset = paddle.model.rotation.z + (Math.PI - paddle.model.rotation.z % Math.PI);
                new TWEEN.Tween(paddle.model.rotation)
                .to({z: rotationReset}, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
                paddle.isPowered = false;
                paddle.material.color.set(paddle.defaultColor);
            }, 2500);
        }
    }
    goToRight(paddle)
    {
        if (!paddle.isPowered)
        {
            let distanceFromCenter = (this.position.x - paddle.position.x) / paddle.width;
            if (distanceFromCenter * (this.position.x - paddle.position.x) > 0)
                this.speedX = distanceFromCenter * 0.015 * this.arena.width;
            else
                this.speedX += distanceFromCenter * 0.015 * this.arena.width;
            if (Math.abs(this.speedZ) <= this.arena.maxSpeed)
                this.speedZ *= -1.08;
            else
                this.speedZ *= -1;
        }
        else
        {
            this.isSupercharging = true;
            const tmpSpeed = this.speedZ;
            this.speedZ = 0;
            this.speedX = 0;
            setTimeout(() => {
                if (Math.abs(this.tmpSpeed) * 1.5 >= this.arena.maxSpeed)
                    this.speedZ = tmpSpeed * -1;
                else
                    this.speedZ = tmpSpeed * -1.5;
                if (Math.abs(this.speedZ) > this.arena.maxSpeed)
                {
                    if (this.speedZ * this.arena.maxSpeed < 0)
                        this.speedZ = this.arena.maxSpeed * -1;
                    else
                        this.speedZ = this.arena.maxSpeed;
                }
                this.speedX = (this.position.x - paddle.position.x) / paddle.width * 0.015 * this.arena.width;
                this.isSupercharging = false;
                const rotationReset = paddle.model.rotation.z + (Math.PI - paddle.model.rotation.z % Math.PI);
                new TWEEN.Tween(paddle.model.rotation)
                .to({z: rotationReset}, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
                paddle.isPowered = false;
                paddle.material.color.set(paddle.defaultColor);
            }, 2500);
        }
    }
    monitorMovement()
    {
        if (this.position.x + this.speedX <= this.arena.position.x - this.arena.length / 2)
            this.speedX *= -1;
        if (this.position.x + this.speedX >= this.arena.position.x + this.arena.length / 2)
            this.speedX *= -1;
        this.position.z += this.speedZ;
        this.position.x += this.speedX;
        if (this.speedZ > 0)
            this.rotation.x += 0.1;
    }
}

class Bot {
    constructor(arena, ownPaddle, enemyPaddle)
    {
        this.arena = arena;
        this.ownPaddle = ownPaddle;
        this.enemyPaddle = enemyPaddle;
        this.isPlaying = false;
    }
    play()
    {
        let paddleBorderRight = this.ownPaddle.position.x + this.ownPaddle.width / 2;
        let paddleBorderLeft = this.ownPaddle.position.x - this.ownPaddle.width / 2;
        let distanceFromBorderRight = this.arena.ball.position.x - paddleBorderRight;
        let distanceFromBorderLeft = this.arena.ball.position.x - paddleBorderLeft;
        let targetX;
        if (distanceFromBorderRight < distanceFromBorderLeft)
            targetX = this.arena.ball.position.x + this.ownPaddle.width / 2;
        else
            targetX = this.arena.ball.position.x - this.ownPaddle.width / 2;
        if (this.ownPaddle.position.x < targetX)
            this.ownPaddle.position.x += 0.016 * this.arena.length;
        if (this.ownPaddle.position.x > targetX)
            this.ownPaddle.position.x -= 0.016 * this.arena.length;
    }
}

class Game {
    constructor(arena) {
        this.leftScore = 0;
        this.rightScore = 0;
        this.maxScore = 3;
        this.isPlaying = false;
        this.isOver = false;
        this.arena = arena;
        this.loserPaddle;
        this.winnerPaddle;
    }
}

class Particle {
    constructor(scene, particleCount, left, paddle, isBall) {
        this.scene = scene;
        this.particleCount = particleCount;
        this.paddle = paddle;

        // Create particle geometry
        this.geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.particleCount * 3);
        this.colors = new Float32Array(this.particleCount * 3);
        // Add initial position and color for each particle
        for (let i = 0; i < this.particleCount; i++) {
            this.positions[i * 3] = 1;
            this.positions[i * 3 + 1] = 1;
            this.positions[i * 3 + 2] = 1;

            this.colors[i * 3] = 1;
            this.colors[i * 3 + 1] = 1;
            this.colors[i * 3 + 2] = 1;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

        // Create particle material
        this.material = new THREE.PointsMaterial({
            size: 0.1, // Adjust size as needed
            vertexColors: THREE.VertexColors // Enable vertex colors
        });

        // Create particle system
        this.particleSystem = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.particleSystem);
        this.isBall = isBall;
        this.offsetZ;
        if (!left)
            this.offsetZ = 2;
        else
            this.offsetZ = -2;
        this.isActive = false;
        // Initialize particle velocities (for example, random initial velocities)
        this.velocities = [];
        if (!isBall)
        {
            if (!left)
            {
                for (let i = 0; i < this.particleCount; i++) {
                    let velocity = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2,
                        (Math.random()) * 1
                    );
                    this.velocities.push(velocity);
                }
            }
            else
            {
                for (let i = 0; i < this.particleCount; i++) {
                    let velocity = new THREE.Vector3(
                        (Math.random() - 0.5) * 0.2,
                        (Math.random() - 0.5) * 0.2,
                        (Math.random()) * -1
                    );
                    this.velocities.push(velocity);
                }
            }
        }
        else
        {
            for (let i = 0; i < this.particleCount; i++) {
                let velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 0
                );
                this.velocities.push(velocity);
            }
        }
    }
    explodeParticles(position, color) {
        this.isActive = true;
        for (let i = 0; i < this.particleCount; i++) {
            let index = i * 3;
            this.positions[index] = position.x;
            this.positions[index + 1] = position.y;
            this.positions[index + 2] = position.z + this.offsetZ;

            // Color (white in this example)
            this.colors[index] = color.r;
            this.colors[index + 1] = color.g;
            this.colors[index + 2] = color.b;
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }
    updateParticles() {
        if (this.isActive)
        {
            for (let i = 0; i < this.particleCount; i++) {
                let index = i * 3;
                this.positions[index] += this.velocities[i].x;
                this.positions[index + 1] += this.velocities[i].y;
                this.positions[index + 2] += this.velocities[i].z;
                if (!this.isBall)
                {
                    if (Math.abs(this.positions[index + 2]) - Math.abs(this.paddle.position.z) >= this.paddle.arena.length)
                    {
                        this.positions[index + 2] = this.paddle.position.z + this.offsetZ;
                        this.positions[index + 1] = this.paddle.position.y;
                        this.positions[index] = this.paddle.position.x;
                    }
                }
            }
            this.geometry.attributes.position.needsUpdate = true;
        }
    }
}

class Theme {
    constructor() {
        this.arenaColor = '#00FF00'; // Green
        this.paddleColor = '#BBBBBB'; // Red
        this.paddleDashingColor = '#0000FF'; // Blue
        this.paddleSuperchargingColor = '#FFFF00'; // Yellow
        this.ballInitialColor = '#FF00FF'; // Magenta
        this.ballFinalColor = '#FFFFFF'; // Cyan
        this.backgroundColor = '#000000'; // Black
    }
}

class Theme1 extends Theme {
    constructor() {
        super(); // Call the parent class constructor
        this.arenaColor = '#FF0000'; // Red
        this.paddleColor = '#00FF00'; // Green
        this.paddleDashingColor = '#0000FF'; // Blue
        this.paddleSuperchargingColor = '#FFFF00'; // Yellow
        this.ballInitialColor = '#FF00FF'; // Magenta
        this.ballFinalColor = '#00FFFF'; // Cyan
        this.backgroundColor = '#000000'; // Black
    }
}

// Subclass theme2
class Theme2 extends Theme {
    constructor() {
        super(); // Call the parent class constructor
        this.arenaColor = '#00FF00'; // Green
        this.paddleColor = '#000000'; // Red
        this.paddleDashingColor = '#0000FF'; // Blue
        this.paddleSuperchargingColor = '#FFFF00'; // Yellow
        this.ballInitialColor = '#FFFFFF'; // Magenta
        this.ballFinalColor = '#FFFFFF'; // Cyan
        this.backgroundColor = '#000000'; // Black
    }
}

// Subclass theme3
class Theme3 extends Theme {
    constructor() {
        super(); // Call the parent class constructor
        this.arenaColor = '#0000FF'; // Blue
        this.paddleColor = '#FF0000'; // Red
        this.paddleDashingColor = '#00FF00'; // Green
        this.paddleSuperchargingColor = '#FFFF00'; // Yellow
        this.ballInitialColor = '#FF00FF'; // Magenta
        this.ballFinalColor = '#00FFFF'; // Cyan
        this.backgroundColor = '#000000'; // Black
    }
}

// Subclass theme4
class Theme4 extends Theme {
    constructor() {
        super(); // Call the parent class constructor
        this.arenaColor = '#FFFF00'; // Yellow
        this.paddleColor = '#FF0000'; // Red
        this.paddleDashingColor = '#00FF00'; // Green
        this.paddleSuperchargingColor = '#0000FF'; // Blue
        this.ballInitialColor = '#FF00FF'; // Magenta
        this.ballFinalColor = '#00FFFF'; // Cyan
        this.backgroundColor = '#000000'; // Black
    }
}

function swapToSplitScreen() {
        const targetWidth = window.innerWidth / 2;
        const duration = 500; // Animation duration in milliseconds
        new TWEEN.Tween(renderer.domElement)
            .to({ width: targetWidth }, duration) // Set width directly on renderer's canvas element
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                renderer.setSize(renderer.domElement.width, window.innerHeight);
            })
            .start();

        const aspectRatio = (window.innerWidth / window.innerHeight) / 2;
        new TWEEN.Tween(camera)
            .to({ aspect: aspectRatio, fov: 95 }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                camera.updateProjectionMatrix();
            })
            .start();
}

function swapToFullScreen()
{
    const targetWidth = window.innerWidth;
    const duration = 500; // Animation duration in milliseconds
    new TWEEN.Tween(renderer.domElement)
        .to({ width: targetWidth }, duration) // Set width directly on renderer's canvas element
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            renderer.setSize(renderer.domElement.width, window.innerHeight);
        })
        .start();

        const aspectRatio = (window.innerWidth / window.innerHeight);
        new TWEEN.Tween(camera)
        .to({ aspect: aspectRatio, fov: 75 }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            camera.updateProjectionMatrix();
        })
        .start();
}

function monitorScreen()
{
    if (keyDown['o'])
        swapToSplitScreen();
}

const centerPosition = new THREE.Vector3(0, 0, 0);
const arena1 = new Arena(centerPosition, 20, 4, 34);
scene.add(arena1, arena1.paddleRight, arena1.paddleLeft, arena1.ball);

let renderPass1 = new RenderPass(scene, camera);
const composer1 = new EffectComposer( renderer );
let glitchLeft = new GlitchPass(64);
glitchLeft.renderToScreen = true;
composer1.addPass(renderPass1);
composer1.addPass(glitchLeft);

let renderPass2 = new RenderPass(scene, cameraLeft);
const composer2 = new EffectComposer( renderer2 );
let glitchRight = new GlitchPass(64);
glitchRight.renderToScreen = true;
composer2.addPass(renderPass2);
composer2.addPass(glitchRight);

glitchRight.enabled = false;
glitchLeft.enabled = false;

function glitch(glitchEffect)
{
    glitchEffect.enabled = true;
    glitchEffect.goWild = true;
    setTimeout(function() {
        glitchEffect.enabled = false;
        glitchEffect.goWild = false;
    }, 500);
}

// Bloom Pass
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0.5;
bloomPass.strength = 1;
bloomPass.radius = 0.5;
composer1.addPass(bloomPass);
composer2.addPass(bloomPass);


composer1.addPass(arena1.horizontalBlur);
composer1.addPass(arena1.verticalBlur);
composer2.addPass(arena1.horizontalBlur);
composer2.addPass(arena1.verticalBlur);

// // dotScreen
// const effect1 = new ShaderPass( DotScreenShader );
// 				effect1.uniforms[ 'scale' ].value = 256;
// 				composer1.addPass( effect1 );


function animate()
{
    requestAnimationFrame( animate );
    // controls.update();
    TWEEN.update();
    arena1.monitorArena();
    composer1.render();
    composer2.render();
}
animate();