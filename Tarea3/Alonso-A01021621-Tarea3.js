// Alonso Iturbe
// A01021621

// Tarea 3 - Sistema Solar

/*
    ● DONE: Crear un sistema solar con los 8 planetas (y plutón), con sus respectivas lunas, el sol, y el campo de asteroides.
    ● DONE: Campo de asteroides
    ● TODO (EXTRA): Para los asteroides, y algunas lunas, investigar cómo funciona el obj loader, y cargar geometría de un obj.
    ● DONE: Los planetas, y sus respectivas órbitas, tienen que tener una escala similar a la real.
    ● DONE: Dibujar la órbita que siguen los planetas.
    ● DONE: Los planetas tienen que tener su propia rotación, además de que tienen que rotar alrededor del sol. Mismo caso para las respectivas lunas.
    ● TODO: Cada elemento tiene que tener materiales con texturas difusas, mapas de profundidad o de normales, y en caso de que encuentren, de specularidad.
        ○ Pueden encontrar varias texturas en: http://planetpixelemporium.com/mars.html
    ● DONE: El sol es el emisor de la luz: Investigar el uso de point lights en ThreeJs.
    ● DONE: Controlar la rotación y escala de la escena.
*/

// Variables globales
var renderer = null, 
scene = null, 
camera = null,
sceneGroup = null;

var duration = 5000; // ms
var currentTime = Date.now();

// PLANETS & MOONS
// Planets
var sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto;
var asteroidBelt;

// TODO: texturas, cantidad y posicionamiento de lunas

// Sol que generaremos a partir de la función createSun
var newSun;

sun = {
    name:"sun",
    scale:3.5,
    distance: 0,
    orbitSpeed:1,
    rotationSpeed:1,
    orbits : [],
    planets : []
}

mercury = {
    name:"mercury",
    scale:0.4,
    distance: 5,
    orbitSpeed:9,
    rotationSpeed:5,
    rings:0,
    moons : []
}

venus = {
    name:"venus",
    scale:1,
    distance: 10,
    orbitSpeed:8,
    rotationSpeed:1,
    rings:0,
    moons : []
}

// Earth Moons
var earthGroup;

var asteroid = {
    name:"moon",
    scale:0.3,
    distance: 1,
    xdistance: 1,
    ydistance: 1,
    zdistance: 1,
    orbitSpeed:1,
    rotationSpeed:5,
}

earth = {
    name:"earth",
    scale:1,
    distance: 15,
    orbitSpeed:7,
    rotationSpeed:1,
    hasMoons:true,
    rings:0,
    moons : [asteroid]
}

// MARS & MOONS
var phobos, deimos;

mars = {
    name:"mars",
    scale:0.5,
    distance: 20,
    orbitSpeed:6,
    rotationSpeed:6,
    rings:0,
    hasMoons: true,
    moons : [asteroid, asteroid]
}

// JUPITER & MOONS
jupiter = {
    name:"jupiter",
    scale:2.5,
    distance: 30,
    orbitSpeed:5,
    rotationSpeed:1,
    rings:0.05,
    moons : []
}

saturn = {
    name:"saturn",
    scale:1.5,
    distance: 35,
    orbitSpeed:4,
    rotationSpeed:1,
    rings:1,
    moons : []
}

uranus = {
    name:"uranus",
    scale:1.5,
    distance: 40,
    orbitSpeed:3,
    rotationSpeed:1,
    rings:0,
    moons : []
}

neptune = {
    name:"neptune",
    scale:1.5,
    distance: 45,
    orbitSpeed:2,
    rotationSpeed:1,
    rings:0,
    moons : []
}

pluto = {
    name:"pluto",
    scale:0.5,
    distance: 50,
    orbitSpeed:1,
    rotationSpeed:1,
    rings:0,
    moons : []
}

var asteroidBelt;

// Arreglo de planetas para fácil manejo
var planets;

// Sun planets
var sunGroup;

// Mars Moons
var marsGroup;

// Jupiter Moons
var jupiterGroup;
var io, europa, ganymede, callisto;

// Saturn Moons
var titan, enceladus, iapetus, mimas, hyperion;

// Uranus Moons
var miranda;

// Neptune Moons
var triton;

// Variable auxiliar para almacenar los planetas
var planetGroup;

// Función para generar las animaciones
function animate(){
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
    var movement = now * 0.001;

    // Actualizar rotación del sol
    newSun.rotation.y += angle * newSun.rotationSpeed * 0.5;

    // Actualizar rotación del campo de asteroides
    asteroidBelt.rotation.y += angle;

    // Actualizar cada planeta
    for (let index = 0; index < planets.length; index++) {

        // Actualizar órbita
        newSun.orbits[index].rotation.y += angle * newSun.planets[index].orbitSpeed * 1/16;
        
        // Actualizar rotación
        planets[index].rotation.y += angle * planets[index].rotationSpeed;

        // Rotar orbitas de lunas de cada planeta
        if (planets[index].moons.length > 0) {

            // Rotar órbita de lunas
            planets[index].moonOrbit.rotation.y += angle;

            // Rotar las lunas en sí
            for (let moonIndex = 0; moonIndex < planets[index].moons.length; moonIndex++) {
                planets[index].moons[moonIndex].rotation.y += angle * planets[index].moons[moonIndex].rotationSpeed;
            }
        }
    }
    
}

function run() {
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();
            
}

// Esta funcion genera el campo de asteroides
function createAsteroidBelt(){

    // Cargar textura de asteroide
    var asteroidTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/asteroid.jpg")});

    // Grupo para contener todos los asteroides
    var asteroidBelt = new THREE.Group();

    // Agregar a la escena
    planetGroup.add(asteroidBelt);

    // Crear 20 asteroides
    var howManyAsteroids = 50;
    var angle = 0;

    for (let a = 0; a < howManyAsteroids; a++) {

        // Generar asteroide
        var asteroid = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), asteroidTexture);

        // Agregar al container
        asteroidBelt.add(asteroid);

        // Rotar el contenedor
        angle = (360/howManyAsteroids) * (Math.PI/180) * a;
        
        // Posicionar equitativamente distribuido en el perímetro
        asteroid.position.set(Math.cos(angle)*25, 0, Math.sin(angle)*25);
    }
    
    return asteroidBelt;
}

// Esta funcion genera el planeta que se le pasa como parámetro
function createSpecificObjectPlanet(planet){

    // Cargar textura
    var planetTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+planet.name+"map.jpg")});

    // Generar planeta
    //Los atributos de SphereGeometry son scale, (algo que ver con ser esfera), (algo que ver con ser esfera)
    var newPlanet = new THREE.Mesh(new THREE.SphereGeometry(planet.scale, 20, 20), planetTexture);

    // Dibujar órbita
    // TorusGeometry(radius, tube, radialSegments, tubularSegments, arc)
    var orbita = new THREE.TorusGeometry(planet.distance, 0.005, 100, 100);
    var material = new THREE.MeshBasicMaterial( { color: "lightgray" } );
    var torus = new THREE.Mesh(orbita, material);
    torus.rotation.x = Math.PI / 2;
    torus.position.set(0, 0, 0);
    planetGroup.add(torus);

    // Crear anillos
    if (planet.rings > 0) {
        // Crear orbita de lunas
        var ringContainer = new THREE.Group();

        // Asignar orbita de lunas al planeta
        newPlanet.add(ringContainer);

        // Hacer anillos
        var ringMaterial = new THREE.MeshBasicMaterial({color:0xB5987A , side:THREE.DoubleSide});
        //RingGeometry(innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength)

        var ring = new THREE.Mesh(new THREE.RingGeometry(planet.scale + 0.1, planet.scale + planet.rings, 35), ringMaterial);
        //ring.rotation.x = 50;
        ring.rotation.set(45, 0, 0);
        ringContainer.add(ring);
    }

    // Creación de lunas en caso de ser necesario
    if (planet.hasMoons) {
        
        // Crear orbita de lunas
        var moonOrbit = new THREE.Group();

        // Inclinar órbita de lunas
        moonOrbit.rotation.set(45, 0, 0);

        // Asignar orbita de lunas al planeta
        newPlanet.add(moonOrbit);

        // Iterar para crear todas las lunas necesarias
        for (let index = 0; index < planet.moons.length; index++) {

            // Cargar textura
            var moonTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+planet.moons[index].name+"map.jpg")});

            // Generar la luna
            var newMoon = new THREE.Mesh(new THREE.SphereGeometry(planet.moons[index].scale, 20, 20), moonTexture);

            // var xPosition = planet.scale + planet.moons[index].xdistance;
            // var yPosition = planet.scale + planet.moons[index].ydistance;
            // var zPosition = planet.scale + planet.moons[index].zdistance;

            // TODO: Que las lunas se puedan randomizar sin encimarse

            var xPosition = planet.scale + Math.random();
            var yPosition = Math.random();
            var zPosition = Math.random();

            console.log(xPosition + " " + yPosition + " " + zPosition);
            
            // Establecer posición
            newMoon.position.set(xPosition, yPosition, zPosition);

            // Asignar lunas a la órbita
            moonOrbit.add(newMoon);
            
            // Agregar órbita al objeto de órbita del planeta para poder actualizarlo
            newPlanet.moonOrbit = moonOrbit;

            // Combinar objetos de luna
            planet.moons[index] = addProperties(newMoon, planet.moons[index]);
        }
    }
    
    // Retornar el combinado
    return addProperties(newPlanet, planet);
}

// Esta funcion genera el sol
function createSun(sun){

    // Cargar textura
    //var sunTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+sun.name+"map.jpg"), emissive: "yellow", emissivemap:"images/"+sun.name+"map.jpg", emissiveIntensity:5});

    var sunTexture = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("images/"+sun.name+"map.jpg")});

    // Generar sol
    var newSun = new THREE.Mesh(new THREE.SphereGeometry(sun.scale, 20, 20), sunTexture);

    // Generar planetas y órbitas
    for (let index = 0; index < sun.planets.length; index++) {
        //console.log("2");
        //console.log(sun.planets[index]);
        
        // Crear planeta
        var myPlanet = createSpecificObjectPlanet(sun.planets[index]);

        // Agregar al grupo
        planetGroup.add(myPlanet);

        // Posicionar a la distancia adecuada
        myPlanet.position.set(myPlanet.distance, 0, 0);

        // Crear orbita del planeta
        var planetOrbit = new THREE.Group();

        // Asignar planeta a la órbita
        planetOrbit.add(myPlanet);

        // Asignar orbita de planeta al sol
        newSun.add(planetOrbit);
        
        // Agregar órbita al arreglo de órbitas
        sun.orbits.push(planetOrbit);

        // Actualizar planeta en arreglo
        sun.planets[index] = myPlanet;
    }

    // Agregar mis propiedades al 3D Object
    var finalSun = addProperties(newSun, sun)
    
    // Especificar posición
    finalSun.position.set(0, 0, 0);

    // Agregar al grupo de planetas
    planetGroup.add(finalSun);
    
    // Retornar el combinado
    return finalSun;
}

// Combinar atributos de dos objetos
function addProperties(threeObject, myObject){
     
    // Agregar todas las propiedades de mi objeto a el ThreeJS Object
    for (var prop in myObject) {
        if (myObject.hasOwnProperty(prop)) {
            // Push each value from "myObject" into "threeObject"
            threeObject[prop] = myObject[prop];
        }
    }
    // Retornar el combinado
    return threeObject;
}

// Esta función genera la escena
function createScene(canvas){    
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Contenedor de planetas
    planetGroup = new THREE.Object3D();
    planetGroup.position.set(0,0,0);
    scene.add(planetGroup);
    
    // PLANETAS ANTIGUOS AQUÍ
    sun.planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto]
    //console.log(sun.planets);
    
    // Generar el sol
    newSun = createSun(sun);

    // Asignar los planetas a un arreglo para fácil manejo
    planets = newSun.planets;

    // Crear campo de asteroides
    asteroidBelt = createAsteroidBelt();

    
    //scene.add(asteroidBelt);
    //planets.push(asteroidBelt);

    // Setup del background
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );
    var bgURL = "images/space.jpg";
    var spaceTexture = new THREE.TextureLoader().load(bgURL);
    scene.background = spaceTexture;
    //scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);

    // Create a group to hold all the objects
    sceneGroup = new THREE.Object3D;
    
    // Add a directional light to show off the objects
    var light = new THREE.DirectionalLight( 0xffffff, 1.5);
    //var light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    //sceneGroup.add(light);

    //DONE: arreglar la luz del sol
    // Crear luz de sol
    //color, intensity, distance, decay 
    var sunlight = new THREE.PointLight("white", 1.5, 0, 2);
    sunlight.position.set(0, 0, 0);
    sceneGroup.add(sunlight);

    // Generar esfera enorme que engloba toda nuestra escena para generar el efecto de girar la perspectiva
    var backgroundTexture = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("images/stars.jpg")});
    var viewSphere = new THREE.Mesh(new THREE.SphereGeometry(100, 20, 20), backgroundTexture);
    viewSphere.material.side = THREE.DoubleSide; // hacer que se vea desde adentro
    sceneGroup.add(viewSphere);

    // Agregar el grupo de planetas al sceneGroup para que también se vea afectado por los mouse/scale shifts
    planetGroup.position.set(0, 0, 0);
    sceneGroup.add(planetGroup);

    // Now add the group to our scene
    scene.add(sceneGroup);
}

// Rotar la escena con el mouse
function rotateScene(deltax, deltay){
    sceneGroup.rotation.y += deltax / 100;
    sceneGroup.rotation.x += deltay / 100;
    $("#rotation").html("rotation:" + sceneGroup.rotation.x.toFixed(2) + "," + sceneGroup.rotation.y.toFixed(2) + ",0");
}

// Función que escala la escena con el slider
function scaleScene(scale){
    sceneGroup.scale.set(scale, scale, scale);
    $("#scale").html("scale: " + scale);
}