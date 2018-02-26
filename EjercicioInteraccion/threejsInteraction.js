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
var userAnswers = [];

var xSpacing = 140;
var ySpacing = -200;

var timeoutAmount = 1000;

function createScene(canvas) 
{
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

// Cachar evento de movimiento de mouse
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

function onDocumentMouseDown(event){
    event.preventDefault();

}

// Boilerplate
function run(){
    requestAnimationFrame( run );
    render();
}

// Bolierplate
function render(){
    renderer.render( scene, camera );
}

function gameSetup() {
    
    // // Llenar arreglo de juego
    // Cada posición del arreglo es la iteración en la cual se iluminará el cubo
    //Math.floor(Math.random() * 6) + 1  
    for (let index = 0; index < howManyCubes; index++) {
        gameArray.push(Math.floor(Math.random() * howManyCubes) + 0);
    }

    console.log(gameArray);

    //console.log("hello!");
}

function play(iteration) {
    for (let index = 0; index < iteration; index++) {
        // iluminar cada cubito después de cierto timeout
        setTimeout(function(){
            cubeArray[gameArray[index]].material.emissive.setHex( 0xff0000 );
            }, timeoutAmount);
        
    }
}

var counter = 0;
function proxyFunction() {
    if (counter < 10) {
        cubeArray[gameArray[counter]].position.z = cubeArray[gameArray[counter]].position.z - 20;
        counter++;
    }
}

function moveBack() {
    setInterval(proxyFunction, timeoutAmount);
}