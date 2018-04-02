// A01021621
// Alonso Iturbe

/*
Utilizando de referencia el manejo de colisiones del código Mozilla Collisions, crear un juego de Frogger.  Tiene que tener una interfaz de usuario para iniciar o reiniciar el juego, así como para desplegar mensajes cuando algún obstáculo choque con la rana.  No es necesario utilizar modelos 3D, puede ser con las geometrías de Threejs. Deben de haber al menos 2 secciones que cruzar, y cada sección debe de tener elementos que se estén moviendo. Una sección como la carretera, donde se evita que lo choquen, y otra como el lago, donde hay que pasar por encima de los troncos. Cuando la rana llegué al otro lado, el juego se reinicia.
*/

var container;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), INTERSECTED;
var radius = 100, theta = 0;

// Dimensiones de la ventana
var xMax = 0;
var yMax = 0;
var zMax = 20;
var zMax = 20;
var zMin = -500;

// frogger vars
var froggerSize = 10;
var froggerJumpSize = 10;
var frogger;
var froggerBBox;
var area = 0;
var onLog = false;

// sound effects
var hop, bgmusic, coin, splash, collision;

// carros
var carGroup1;
var car1, car2;
var car1BB, car2BB;
//var carBBox;

// Setup
function createScene(canvas) {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Agregar camara
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    
    // Setup inicial
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    // Luz a la escena
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    // Boilerplate
    console.log("Initial setup");
    console.log(window.innerWidth);
    console.log(window.innerHeight);
    xMax = window.innerWidth;
    yMax = window.innerHeight;
    
    // agregar a frogger
    var frogGeometry = new THREE.BoxBufferGeometry( froggerSize, froggerSize, 5 );
    frogger = new THREE.Mesh( frogGeometry, new THREE.MeshLambertMaterial({color: "green"}));
    frogger.position.set(0, -120, -200);
    //froggerBBox = new THREE.Box3().setFromObject(frogger); // en realidad ni se necesita aquí
    scene.add(frogger);

    // generar la escena en sí
    gameSetup();
    
    // cargar los sonidos de juego
    loadSounds();

    // listener de eventos de teclado
    document.addEventListener( 'keydown', onKeyDown, false );
    
    //raycaster = new THREE.Raycaster();
    
    // Sensibilidad de movimiento -> como lo ponemos del tamaño de la pantalla, cada pixel de la pantalla será una posición posible para el caster
    renderer.setPixelRatio( window.devicePixelRatio );
    
    // Literal a lo que suena, funciones que se mandan llamar cuando suceden ciertos eventos
    //document.addEventListener( 'mousemove', onDocumentMouseMove );
    //document.addEventListener('mousedown', onDocumentMouseDown);
    
    // Que se actualize el canvas confirme se haga un resize de la pantalla
    window.addEventListener( 'resize', onWindowResize);
}

// Setup de elementos del juego
function gameSetup() {

    // Auxiliares
    howManyCars = 5;
    howManyLogs = 3;
    carGroup1 = [];
    logGroup = [];
    carGroup2 = [];

    // Carros 1
    yInitialCars1 = -90;
    xInitialCars1 = 0;

    // Logs
    yInitialLogs = -20;
    xInitialLogs = 0;

    // Carros 2
    yInitialCars2 = 30;
    xInitialCars2 = 0;

    // geometrías
    var carGeometry = new THREE.BoxBufferGeometry( 20, 10, 5 );
    var logGeometry = new THREE.BoxBufferGeometry( 50, 10, 5 );

    // cars 1
    for (let a = 0; a < howManyCars; a++) {
        var newCar = new THREE.Mesh( carGeometry, new THREE.MeshLambertMaterial({color: "black"}));
        newCar.position.set(xInitialCars1, yInitialCars1, -201);
        carGroup1.push(newCar);
        scene.add(newCar);

        yInitialCars1 += 10;
        xInitialCars1 += 20;
    }
    
    // logs
    for (let a = 0; a < howManyLogs; a++) {
        var newLog = new THREE.Mesh( logGeometry, new THREE.MeshLambertMaterial({color: "brown"}));
        newLog.position.set(xInitialLogs, yInitialLogs, -201);
        logGroup.push(newLog);
        scene.add(newLog);

        yInitialLogs += 10;
        xInitialLogs += 20;
    }

    // cars 2
    for (let a = 0; a < howManyCars; a++) {
        var newCar = new THREE.Mesh( carGeometry, new THREE.MeshLambertMaterial({color: "black"}));
        newCar.position.set(xInitialCars2, yInitialCars2, -201);
        carGroup2.push(newCar);
        scene.add(newCar);

        yInitialCars2 += 10;
        xInitialCars2 += 20;
    }
    
}

// updates the position of cars, logs and frogger (if he's on a log)
function updatePositions() {

    // cars
    for (let a = 0; a < carGroup1.length; a++) {
        if (a % 2 === 0) { // alternate between left and right-direction updates
            if (carGroup1[a].position.x < -200) { // edge
                carGroup1[a].position.x = 200;
            }
            carGroup1[a].position.x -= 1;
        } else {
            if (carGroup1[a].position.x > 200) { // edge
                carGroup1[a].position.x = -200;
            }
            carGroup1[a].position.x += 1;
        }
    }

    // logs
    for (let a = 0; a < logGroup.length; a++) {
        if (a % 2 === 0) {
            if (logGroup[a].position.x < -200) { // edge
                logGroup[a].position.x = 200;
            }
            logGroup[a].position.x -= 2;
        } else {
            if (logGroup[a].position.x > 200) { // edge
                logGroup[a].position.x = -200;
            }
            logGroup[a].position.x += 2;
        }
    }

    // cars 2
    for (let a = 0; a < carGroup2.length; a++) {
        if (a % 2 === 0) { // alternate between left and right-direction updates
            if (carGroup2[a].position.x < -200) { // edge
                carGroup2[a].position.x = 200;
            }
            carGroup2[a].position.x -= 4;
        } else {
            if (carGroup2[a].position.x > 200) { // edge
                carGroup2[a].position.x = -200;
            }
            carGroup2[a].position.x += 4;
        }
    }

    // frogger, if he's on a log
}

function checkCollisions() {

    // update area variable according to frogger's position

    // loop through all the active objects in the scene, checking for collisions...

    // global "area" variable will identify which case to enter 
    // make sure to update area within render according to frogger's coordinates!

    // area = 1 -> check for car collisions -> end game if true
    // area = 2 -> check for log collisions -> end game if false
    // if within area 2, will also need to update frogger's position according to whether he's on a log or not...
    // bool "onlog" -> update position at the same speed as the logs... manual animations will work best in this scenario
    // area = 3 -> check for car collisions -> end game if true

    //console.log(carGroup1.length);

    // get frogger's position
    xPos = frogger.position.x;
    yPos = frogger.position.y;
    zPos = frogger.position.z;

    if (yPos > -100) {
        area = 1;
        if (yPos > -30) {
            area = 2;
            if (yPos > 20) {
                area = 3;
                if (yPos > 70) {
                    area = 4;
                }
            }
        }
    }

    // display
    document.getElementById("displayScore").innerHTML = "("+xPos+","+yPos+","+zPos+") - Area "+area;

    // Cars 1
    for (let a = 0; a < carGroup1.length; a++) {

        // bounding boxes need constant object assigning in order for them to work!
        froggerBBox = new THREE.Box3().setFromObject(frogger);

        // establecer bounding box del coche
        var carBBox = new THREE.Box3().setFromObject(carGroup1[a]);

        // compute intersection size
        xInt = froggerBBox.intersect(carBBox).getSize().x;
        yInt = froggerBBox.intersect(carBBox).getSize().y;
        zInt = froggerBBox.intersect(carBBox).getSize().z;

        // check for collisions and not just touchpoints
        if (xInt > 0 && yInt > 0 && zInt > 0) {
            console.log("Collision detected: Cars 1, car #"+a);
        } else {
            //console.log("No collisions detected");
        }
    }

    // Logs
    for (let a = 0; a < logGroup.length; a++) {

        // bounding boxes need constant object assigning in order for them to work!
        froggerBBox = new THREE.Box3().setFromObject(frogger);

        // establecer bounding box del log
        var logBBox = new THREE.Box3().setFromObject(logGroup[a]);

        // compute intersection size
        xInt = froggerBBox.intersect(logBBox).getSize().x;
        yInt = froggerBBox.intersect(logBBox).getSize().y;
        zInt = froggerBBox.intersect(logBBox).getSize().z;

        // check for collisions and not just touchpoints
        if (xInt > 0 && yInt > 0 && zInt > 0) {
            console.log("Collision detected: Logs, log #"+a);
            onLog = true;
        } else {
            //console.log("No collisions detected");
            onLog = false;
        }
    }

    // Cars 2
    for (let a = 0; a < carGroup2.length; a++) {

        // bounding boxes need constant object assigning in order for them to work!
        froggerBBox = new THREE.Box3().setFromObject(frogger);

        // establecer bounding box del coche
        var carBBox = new THREE.Box3().setFromObject(carGroup2[a]);

        // compute intersection size
        xInt = froggerBBox.intersect(carBBox).getSize().x;
        yInt = froggerBBox.intersect(carBBox).getSize().y;
        zInt = froggerBBox.intersect(carBBox).getSize().z;

        // check for collisions and not just touchpoints
        if (xInt > 0 && yInt > 0 && zInt > 0) {
            console.log("Collision detected: Cars 2, car #"+a);
        } else {
            //console.log("No collisions detected");
        }
    }
}

// cargar todos los sonidos de juego
function loadSounds() {
    
    // HOP
    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );
    // create a global audio source
    hop = new THREE.Audio( listener );
    // load a sound and set it as the Audio object's buffer
    var audioLoader1 = new THREE.AudioLoader();
    audioLoader1.load( 'sounds/hop.wav', function( buffer ) {
        hop.setBuffer( buffer );
        hop.setLoop( false );
        hop.setVolume( 0.5 );
        //hop.play();
    });

    // BACKGROUND MUSIC
    var listener2 = new THREE.AudioListener();
    camera.add( listener2 );
    bgmusic = new THREE.Audio( listener2 );
    var audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load( 'sounds/background.mp3', function( buffer ) {
        bgmusic.setBuffer( buffer );
        bgmusic.setLoop( true );
        bgmusic.setVolume( 0.5 );
        //bgmusic.play();
    });

    // INSERT COIN
    var listener3 = new THREE.AudioListener();
    camera.add( listener3 );
    coin = new THREE.Audio( listener3 );
    var audioLoader3 = new THREE.AudioLoader();
    audioLoader3.load( 'sounds/background.mp3', function( buffer ) {
        coin.setBuffer( buffer );
        coin.setLoop( true );
        coin.setVolume( 0.5 );
        //coin.play();
    });

    // WATER SPLASH
    var listener4 = new THREE.AudioListener();
    camera.add( listener4 );
    splash = new THREE.Audio( listener4 );
    var audioLoader4 = new THREE.AudioLoader();
    audioLoader4.load( 'sounds/background.mp3', function( buffer ) {
        splash.setBuffer( buffer );
        splash.setLoop( true );
        splash.setVolume( 0.5 );
        //splash.play();
    });

    // CAR COLLISION
    var listener5 = new THREE.AudioListener();
    camera.add( listener5 );
    collision = new THREE.Audio( listener5 );
    var audioLoader5 = new THREE.AudioLoader();
    audioLoader5.load( 'sounds/background.mp3', function( buffer ) {
        collision.setBuffer( buffer );
        collision.setLoop( true );
        collision.setVolume( 0.5 );
        //collision.play();
    });
}

// listener para eventos relacionados a las teclas
function onKeyDown ( event ){

    //hop.play(); // sonido de salto 

    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            //moveForward = true;
            frogger.position.y += froggerJumpSize;
            break;

        case 37: // left
        case 65: // a
            //moveLeft = true;
            frogger.position.x -= froggerJumpSize;
            break;

        case 40: // down
        case 83: // s
            //moveBackward = true;
            frogger.position.y -= froggerJumpSize;
            break;

        case 39: // right
        case 68: // d
            //moveRight = true;
            frogger.position.x += froggerJumpSize;
            break;

        // case 32: // space
        //     if ( canJump === true ) velocity.y += 350;
        //     canJump = false;
        //     break;

    }

}

// Boilerplate
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

    // console.log("Window was resized, values updated")
    // console.log(window.innerWidth);
    // console.log(window.innerHeight);
    // xMax = window.innerWidth;
    // yMax = window.innerHeight;
}

// Cachar evento de movimiento de mouse -> se usa para highlightear las selecciones
function onDocumentMouseMove(event){
    
    // Prevenir que el manejador de eventos utilice el evento default
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // Posicionar camara
    raycaster.setFromCamera( mouse, camera );

    // obtener intersecciones
    var intersects = raycaster.intersectObjects( scene.children );

    // intersects es un arreglo de objetos

    // checar intersecciones
    if ( intersects.length > 0 ) // hay más de una intersección
    {
        if ( INTERSECTED != intersects[ 0 ].object ) // no hace mucho sentido si lo piensas en la primera vez, pero es para checar que sigas teniendo el actual y no estar recalculando
        {
            // únicamente relevante para el primer caso, antes de que exista la primera intersección
            if ( INTERSECTED ){
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }
            
            // ahora si, settear la intersección
            INTERSECTED = intersects[ 0 ].object;

            // Actualizar el material para que se vea como highlight
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else // sólo hay un elemento
    { 
        // igual, checar si hay intersección y si no, borrar
        if ( INTERSECTED ){

            // sólo hay una intersección con el raycast
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        } else {

            // no hay overlap con nada, quitar hex
            INTERSECTED = null;
        }
    }
}

// Cachar evento de click de mouse
function onDocumentMouseDown(event){

    console.log("user clicked, cs: " + currentScore + ", ts: " + tempScore);
    
    // Prevenir que el manejador de eventos utilice el evento default
    event.preventDefault();

    // primero, checar si se hizo click sobre un cubo
    if (INTERSECTED != null) {
        
        // animar el cubo clickeado
        spinCubeNegative(INTERSECTED);

        // checar si hizo click en EL cubo que tenía que hacer click en este momento
        if (INTERSECTED == cubeArray[gameArray[tempScore]]) { 
                
            // incrementar puntaje
            tempScore++;
            console.log("tempscore increased to" + tempScore);

            // checar si ya completó todos los que se tenían que clickear hasta el momento
            if (tempScore > currentScore) {
                
                // incrementar currentScore
                currentScore++;
                console.log("currentscore increased to" + tempScore);
                document.getElementById("displayScore").innerHTML = "Current score: " + currentScore;

                // checar éxito
                if (currentScore == 10) {
                    // el usuario ha ganado
                    window.alert("Congratulations! You won!");
                    tempScore = 0;
                    location.reload();
                }

                // girarle los siguientes cubos al usuario
                spinEm();

                // resetear temp score
                tempScore = 0;
                console.log("tempscore reset to" + tempScore);

            } // todavía no llega a todos los que se tenían que clickear

        } else {
            window.alert("You lost! Score: " + currentScore);
            tempScore = 0;
            location.reload();
        }
    }
}

// Boilerplate
function run(){
    requestAnimationFrame( run );
    render();

    // Actualizar animaciones de cubitos
    KF.update();

    // checar colisiones
    //checkCollisions();

    //console.log("We updating");
}

// Bolierplate
function render(){
    renderer.render( scene, camera );
    //console.log("We updating");
    updatePositions();
    checkCollisions();
}

// iluminar el primer cubo para que el jugador sepa que onda
function firstTurn(){
    
    setTimeout(function(){

        spinCubePositive(cubeArray[gameArray[0]]);
        
    }, timeoutAmount);

}

// hace setup para la animación de girar el cubo <- CHECAR SI CON ANIMATOR START AL FINAL ES SUFICIENTE
function spinResizeAnimationPositive(targetCube){

    //console.log(targetCube);
    
    // generar el animador
    animator = new KF.KeyFrameAnimator;

    var radius = 5; // radio del círculo sobre el cual queremos que se mueva el monstruo
    var slices = 360; // cuántas subdivisiones se harán
    var positionsArray = [];
    var rotationArray = [];
    var temp = "";
    var keyArray = []
    var angle = 0;
    var duration = 0.5; // un segundo de animación
    
    // Generar valores de círculo
    for (var a = 0; a <= slices; a++) {
        
        // cada posición se calcula basado en el ángulo subsecuente del círculo unitario
        angle = ((2 * Math.PI)/slices) * a;

        // Generar un string con los valores
        temp = "{\"x\":" + Math.cos(angle)*radius + ",\"y\":0,\"z\":" + Math.sin(angle)*radius + '}';
        
        // parsear y meter al arreglo
        positionsArray.push(JSON.parse(temp))
        
        // generar valor de la llave y meterla al arreglo también
        keyArray.push(a/slices);

        // Generar string con el valor
        temp = "{\"y\":" + angle + '}';

        // obtener ángulo de rotación y meterlo al arreglo de ángulos
        rotationArray.push(JSON.parse(temp));
    }

    // z-value de la posición es el que hay que modificar
    var currentPosition = targetCube.position;

    var myValues = []

    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-200});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-190});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-180});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-190});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-200});

    animator.init({ 
        interps:
            [
                { 
                    keys:keyArray, 
                    values:rotationArray,
                    target:targetCube.rotation
                },
                { 
                    keys:[0, 0.25, 0.5, 0.75, 1], 
                    values:myValues,
                    target:targetCube.position
                },
            ],
        loop: false,
        duration:duration * 1000,
        easing:TWEEN.Easing.Linear.None,
    });

    animator.start();
}

// efectúa la animación en sí del cubo
function playAnimations(){
    animator.start();
}

// proxy para girar el cubo
function spinCubePositive(targetCube){
    spinResizeAnimationPositive(targetCube);
    playAnimations();
}

// recorre gameArray, girando cada cubo para que el usuario vea la secuencia
function spinEm() {
    
    // reset
    counter = 0;

    var intervalID = setInterval(function () {
        
        // girar cubo específico
        spinCubePositive(cubeArray[gameArray[x]]);
        
        if (++x === currentScore+1) { 
            window.clearInterval(intervalID); // detener iteración
            x = 0; // resetear
        }
    }, timeoutAmount + (x*timeoutAmount)); // incrementar el timeout amount para que no se overlapeen las animaciones
}