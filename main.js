
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
    'g': false,
    'b': false
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
        // const material = new THREE.MeshStandardMaterial({ color: 0x8800dd, wireframe: false});
        const material = new THREE.MeshStandardMaterial({color: 0x101030});
        
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
        this.pointsRight = 0;
        this.pointsLeft = 0;
        this.paddleRight = new Paddle(this, false);
        this.paddleLeft = new Paddle(this, true);
        this.ball = new Ball(this);
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
        this.maxSpeed = this.width / 40;
    }
    monitorArena()
    {
        this.paddleLeft.light.position.copy(this.paddleLeft.position);
        this.paddleRight.light.position.copy(this.paddleRight.position);
        if (this.ball.isRolling)
            this.ball.monitorMovement();
        this.ball.light.position.copy(this.ball.position);
        this.ball.light.position.y += this.height;
        if (this.ball.isRolling)
            this.ball.rotation.y += 0.1;
        if (this.isActive)
        {
            this.paddleRight.animatePaddle(doubleKeyPress['ArrowRight'], doubleKeyPress['ArrowLeft'], keyDown['ArrowRight'], keyDown['ArrowLeft'], this, keyDown['ArrowUp']);
            this.paddleLeft.animatePaddle(doubleKeyPress['a'], doubleKeyPress['d'], keyDown['a'], keyDown['d'], this, keyDown['w']);
        }
        if (keyDown[' '])
        {
            this.ball.speedX = 0;
            this.ball.speedZ = this.ball.initialSpeed;
            this.ball.isgoingRight = true;
            this.ball.isgoingLeft = false;
            this.ball.isRolling = true;
        }
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
        }
        if (keyDown['i'])
        {
            cameraLeft.position.copy(this.position);
            cameraLeft.position.y += this.length * 3;
            cameraLeft.position.z -= this.length * 3;
            cameraLeft.position.x += this.length * 3;
            cameraLeft.lookAt(this.position);
            swapToSplitScreen();
            this.setSplitCameraPositions(camera, cameraLeft);
        }
        if (keyDown['p'])
        {
            swapToFullScreen();
            this.setTopView(camera);
        }
        if (this.ball.collisionWithLeftPaddle(this.paddleLeft))
            this.ball.goToRight(this.paddleLeft);
        if (this.ball.collisionWithRightPaddle(this.paddleRight))
            this.ball.goToLeft(this.paddleRight);
        if (this.ball.rightScore(this.paddleLeft) && !this.isBeingReset)
        {
            this.isBeingReset = true;
            this.resetPositions(this.paddleLeft, this.paddleRight, false, glitchLeft);
        }
        if (this.ball.leftScore(this.paddleRight) && !this.isBeingReset)
        {
            this.isBeingReset = true;
            this.resetPositions(this.paddleRight, this.paddleLeft, true, glitchRight);
        }
    }
    setSplitCameraPositions(_cameraRight, _cameraLeft)
    {
        let targetY = this.position.y + this.height * 3;
        let targetZ = this.position.z + this.width * 0.85;
        let targetX = this.position.x;
        const duration = 1500;
        // Create tweens for each property
        new TWEEN.Tween(_cameraLeft.position)
            .to({ y: targetY, z: targetZ, x:targetX }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // LookAt tween
        new TWEEN.Tween(_cameraLeft)
            .to({}, duration) // Dummy tween, to ensure that onUpdate is called
            .onUpdate(() => {
                _cameraLeft.lookAt(this.position);
            })
            .start();

        targetY = this.position.y + this.height * 3;
        targetZ = this.position.z - this.width * 0.85;
        targetX = this.position.x;
        // Create tweens for each property
        new TWEEN.Tween(_cameraRight.position)
        .to({ y: targetY, z: targetZ, x: targetX }, duration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

        // LookAt tween
        new TWEEN.Tween(_cameraRight)
            .to({}, duration) // Dummy tween, to ensure that onUpdate is called
            .onUpdate(() => {
                _cameraRight.lookAt(this.position);
            })
            .start();
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
        const duration = 3500;
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
        .start();
    }
    resetPositions(loserPaddle, winnerPaddle, leftScored, whichGlitch)
    {
        let duration = 1150;

        loserPaddle.light.power = 0;
        loserPaddle.light.color = new THREE.Color(1, 0, 0);
        winnerPaddle.light.power = 0;
        winnerPaddle.light.color = new THREE.Color(0, 1, 0);
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
            loserPaddle.light.power = loserPaddle.defaultLight;
           winnerPaddle.light.power = winnerPaddle.defaultLight;
           loserPaddle.light.color = new THREE.Color(0.2, 0.2, 0.8);
           winnerPaddle.light.color = new THREE.Color(0.2, 0.2, 0.8);
           this.ball.isgoingRight = true;
           this.ball.isgoingLeft = false;
           this.ball.light.power = this.ball.startingPower;
           this.ball.bounceCount = 0;
           this.ball.material.color.set(this.ball.initialColor);
           this.isBeingReset = false;
        });
        ballUp.chain(ballToCamera);
        ballToCamera.chain(leftReset, rightReset, firstTween);
        firstTween.chain(secondTween);
        ballUp.start();
        this.ball.isRolling = false;
        this.ball.speedZ = 0;
        this.ball.speedX = 0;
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
                } else {
                    this.model.position.set(0, 0, -2); // Adjust position as needed
                }
                this.model.scale.set(0.2, 0.2, 0.2); // Adjust scale as needed
                // Add the this.model to the group
                this.add(this.model);
        
                // Now you can access the position of paddle.paddleMesh
                console.log("paddle.x: " + this.paddleMesh.position.x);
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

        // Add other properties and methods as needed
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
        if (this.arena.ball.isSupercharging)
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
            targetRotation = Math.PI;
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
        this.radius = arena.width * 0.025;
        this.startingPoint = new THREE.Vector3(arena.position.x, arena.position.y + arena.height / 2 + this.radius, arena.position.z);
        this.position.copy(this.startingPoint);
        this.isRolling = false;
        this.speedX = 0;
        this.speedY = 0;
        this.isgoingLeft = false;
        this.isgoingRight = true;
        this.initialColor = this.material.color.clone();
        this.finalColor = new THREE.Color(0xFFFFFF);
        this.zLimit1 = arena.position.z + arena.width / 2;
        this.zLimit2 = arena.position.z - arena.width / 2;
        this.arena = arena;
        this.initialSpeed = this.arena.width / 200;
        this.isSupercharging;
        this.bounceCount = 0;
        this.justCollisioned = false;
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
        if (this.checkCollisionBoxSphere(paddle, this) && this.isgoingLeft)
        {
            console.log("Collision with left paddle");
            this.justCollisioned = true;
            this.isgoingLeft = !this.isgoingLeft;
            this.isgoingRight = !this.isgoingRight;
            this.bounceCount++;
            if (this.bounceCount <= 10) {
                // Calculate the interpolation factor
                const factor = this.bounceCount / 20;
                // Perform linear interpolation
                this.material.color.lerpColors(this.initialColor, this.finalColor, factor);
            }
            return true;
        }
        return false;
    }
    collisionWithRightPaddle(paddle)
    {
        if (this.checkCollisionBoxSphere(paddle, this) && this.isgoingRight)
        {
            console.log("Collision with right paddle");
            this.justCollisioned = true;
            this.isgoingRight = !this.isgoingRight;
            this.isgoingLeft = !this.isgoingLeft;
            this.bounceCount++;
            if (this.bounceCount <= 10) {
                // Calculate the interpolation factor
                const factor = this.bounceCount / 20;
                // Perform linear interpolation
                this.material.color.lerpColors(this.initialColor, this.finalColor, factor);
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
                paddle.isPowered = false;
                paddle.material.color.set(0xffffff);
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
                paddle.isPowered = false;
                paddle.material.color.set(0xffffff);
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

// dotScreen
// const effect1 = new ShaderPass( DotScreenShader );
// 				effect1.uniforms[ 'scale' ].value = 256;
// 				composer1.addPass( effect1 );


function animate()
{
    requestAnimationFrame( animate );
    // controls.update();
    TWEEN.update();
    arena1.monitorArena();
    monitorScreen();
    // cameraDebug();
    // renderer.render(scene, camera);
    composer1.render();
    composer2.render();
    // renderer1.render(scene, cameraRight);
    // renderer2.render(scene, cameraLeft);
}
animate();