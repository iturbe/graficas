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
var min = -400;
var howManyCubes = 15;

var cubeArray = [];
var gameArray = [];

var xSpacing = 140;
var ySpacing = -200;

var timeoutAmount = 1000;

// puntaje confirmado del usuario
var currentScore = 0;

// puntaje temporal, reseteado cada turno
var tempScore = 0;

// contador para llevar control de cuantos cube spins llevamos
var counter = 0;
var x = 0;

// Setup
function createScene(canvas) {
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 );
    scene.add( light );
    
    var geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );

    console.log("Initial setup");
    console.log(window.innerWidth);
    console.log(window.innerHeight);
    xMax = window.innerWidth;
    yMax = window.innerHeight;

    // Generar 2000 cajas aleatorias
    for ( var i = 0; i < howManyCubes; i ++ ){
        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff}));
        
        // Generate random number between two numbers:
        // Math.floor(Math.random() * max) + min
        
        // originales
        // object.position.x = Math.random() * 800 - 400;
        // object.position.y = Math.random() * 800 - 400;
        // object.position.z = Math.random() * 800 - 400;

        // Cuadrícula
        xSpacing -= 80;
        if (i % 5 == 0) {
            ySpacing += 100;
            xSpacing = 140;
        }
        object.position.x = xSpacing;
        object.position.y = ySpacing;
        object.position.z = -200;

        // Tratando de que quepan todos en el viewport
        // object.position.x = Math.floor(Math.random() * xMax/3) + min;
        // object.position.y = Math.floor(Math.random() * yMax/3) + min;
        // object.position.z = Math.floor(Math.random() * zMax) + zMin;
        
        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;
        
        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;
        
        // agregar a la escena
        scene.add(object);

        // agregar al arreglo de objetos for reference
        cubeArray.push(object);
    }
    
    raycaster = new THREE.Raycaster();
    
    // Sensibilidad de movimiento -> como lo ponemos del tamaño de la pantalla, cada pixel de la pantalla será una posición posible para el caster
    renderer.setPixelRatio( window.devicePixelRatio );
    
    // Literal a lo que suena, funciones que se mandan llamar cuando suceden ciertos eventos
    document.addEventListener( 'mousemove', onDocumentMouseMove );
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    // Que se actualize el canvas confirme se haga un resize de la pantalla
    window.addEventListener( 'resize', onWindowResize);
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

    // IMPORTANT: conversión entre sistema de coordenadas de HTML y OpenGL
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

                // girarle los siguientes cubos al usuario
                spinEm();

                // resetear temp score
                tempScore = 0;
                console.log("tempscore reset to" + tempScore);

            } // todavía no llega a todos los que se tenían que clickear

        } else {
            window.alert("You lost! Score: " + currentScore);
            tempScore = 0;
        }
    }
}

// Boilerplate
function run(){
    requestAnimationFrame( run );
    render();

    // Actualizar animaciones de cubitos
    KF.update();
}

// Bolierplate
function render(){
    renderer.render( scene, camera );
}

// Setup de elementos del juego
function gameSetup() {
    
    // // Llenar arreglo de juego
    // Cada posición del arreglo es la iteración en la cual se iluminará el cubo
    //Math.floor(Math.random() * 6) + 1  
    for (let index = 0; index < howManyCubes; index++) {
        gameArray.push(Math.floor(Math.random() * howManyCubes) + 0);
    }

    console.log(gameArray);
}

// DEPRECATED
function play(iteration) {
    for (let index = 0; index < iteration; index++) {
        // iluminar cada cubito después de cierto timeout
        setTimeout(function(){
            cubeArray[gameArray[index]].material.emissive.setHex( 0xff0000 );
            }, timeoutAmount);
        
    }
}

// iluminar el primer cubo para que el jugador sepa que onda
function firstTurn(){
    
    setTimeout(function(){

        spinCubePositive(cubeArray[gameArray[0]]);
        
    }, timeoutAmount);

}

// hace setup para la animación de girar el cubo
function spinAnimation(targetCube){

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
    var duration = 0.5; // medio segundo de rotación
    
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

    animator.init({ 
        interps:
            [
                { 
                    keys:keyArray, 
                    values:rotationArray,
                    target:targetCube.rotation
                },
            ],
        loop: false,
        duration:duration * 1000,
        easing:TWEEN.Easing.Linear.None,
    });
}

// hace setup para la animación de mover el cubo
function resizeAnimation(targetCube){

    console.log(targetCube.position);
    
    // generar el animador
    animator = new KF.KeyFrameAnimator;

    var duration = 0.5; // medio segundo de rotación

    // z-value de la posición es el que hay que modificar
    var currentPosition = targetCube.position;

    var myValues = []

    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-200});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-190});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-180});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-190});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-200});

    console.log(myValues);

    animator.init({ 
        interps:
            [
                { 
                    keys:[0, 0.25, 0.5, 0.75, 1], 
                    values:myValues,
                    target:targetCube.position
                },
            ],
        loop: false,
        duration:duration * 1000,
        easing:TWEEN.Easing.Elastic.InOut,
    });
}

// hace setup para la animación de girar el cubo
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
}

// hace setup para la animación de girar el cubo
function spinResizeAnimationNegative(targetCube){

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
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-210});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-220});
    myValues.push({x:currentPosition.x, y:currentPosition.y, z:-210});
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
}

// efectúa la animación en sí del cubo
function playAnimations(){
    //console.log(cube);
    animator.start();
}

// gira el cubo especificado hacia el usuario
function spinCubePositive(targetCube){
    // spinAnimation(targetCube);
    // resizeAnimation(targetCube);
    spinResizeAnimationPositive(targetCube);
    playAnimations(targetCube);
}

// gira el cubo especificado NO hacia el usuario (es para cuando hace click)
function spinCubeNegative(targetCube){
    // spinAnimation(targetCube);
    // resizeAnimation(targetCube);
    spinResizeAnimationNegative(targetCube);
    playAnimations(targetCube);
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