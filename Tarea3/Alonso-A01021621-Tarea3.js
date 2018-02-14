// Alonso Iturbe
// A01021621

// Tarea 3 - Sistema Solar

/*
    ● DONE: Crear un sistema solar con los 8 planetas (y plutón), con sus respectivas lunas, el sol, y el campo de asteroides.
    ● TODO: Para los asteroides, y algunas lunas, investigar cómo funciona el obj loader, y cargar geometría de un obj.
    ● TODO: Los planetas, y sus respectivas órbitas, tienen que tener una escala similar a la real.
    ● TODO: Dibujar la órbita que siguen los planetas.
    ● TODO: Los planetas tienen que tener su propia rotación, además de que tienen que rotar alrededor del sol. Mismo caso para las respectivas lunas.
    ● TODO: Cada elemento tiene que tener materiales con texturas difusas, mapas de profundidad o de normales, y en caso de que encuentren, de specularidad.
        ○ Pueden encontrar varias texturas en: http://planetpixelemporium.com/mars.html
    ● TODO: El sol es el emisor de la luz: Investigar el uso de point lights en ThreeJs.
    ● DONE: Controlar la rotación y escala de la escena.
*/

var textcolor = "green";

// Variables globales
var renderer = null, 
scene = null, 
camera = null,
sceneGroup = null,
cube = null,
sphereGroup = null,
sphere = null,
cone = null;


var duration = 5000; // ms
var currentTime = Date.now();

// PLANETS & MOONS
// Planets
var sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto;

// TODO: texturas de lunas y valores adecuados

sun = {
    name:"sun",
    scale:1,
    distance: -9,
    orbitSpeed:1,
    rotationSpeed:1,
}

mercury = {
    name:"mercury",
    scale:1,
    distance: -6,
    orbitSpeed:1,
    rotationSpeed:5,
    hasMoons:false,
    numberOfMoons:0
}

venus = {
    name:"venus",
    scale:1,
    distance: -3,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:0
}

// Earth Moons
var earthGroup;

var moon = {
    name:"moon",
    scale:0.3,
    position: 1,
    distance: 1,
    orbitSpeed:1,
    rotationSpeed:5,
    isMoon:true,
}

earth = {
    name:"earth",
    scale:1,
    distance: 0,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:true,
    numberOfMoons:1,
    moons : [moon]
}

// MARS & MOONS
var phobos, deimos;

phobos = {
    name:"phobos",
    scale:0.3,
    position: 1,
    distance: 1,
    orbitSpeed:1,
    rotationSpeed:5,
    isMoon:true,
}

deimos = {
    name:"deimos",
    scale:0.3,
    position: 1,
    distance: 1,
    orbitSpeed:1,
    rotationSpeed:5,
    isMoon:true,
}

mars = {
    name:"mars",
    scale:1,
    distance: 3,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:2,
    moons : {phobos, deimos}
}

// JUPITER & MOONS
jupiter = {
    name:"jupiter",
    scale:1,
    distance: 6,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:0
}

saturn = {
    name:"saturn",
    scale:1,
    distance: 9,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:0
}

uranus = {
    name:"uranus",
    scale:1,
    distance: 12,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:0
}

neptune = {
    name:"neptune",
    scale:1,
    distance: 15,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:0
}

pluto = {
    name:"pluto",
    scale:1,
    distance: 18,
    orbitSpeed:1,
    rotationSpeed:1,
    hasMoons:false,
    numberOfMoons:0
}

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

//var planetGroup, testPlanet;

// Aquí se encuentran definidas las animaciones (orbitas y rotaciones del planeta azul y su luna)
function animate(){
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;
    var movement = now * 0.001;

    // Rotar los planetas de acuerdo con su velocidad
    for (let index = 0; index < planets.length; index++) {
        planets[index].rotation.y += angle * planets[index].rotationSpeed;

        // Rotar orbitas de lunas de cada planeta
        if (planets[index].hasMoons) {

            // Rotar órbita
            planets[index].moonOrbit.rotation.y += angle;

            // Rotar luna en sí
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

// Esta funcion genera el planeta azul de la derecha y sus lunas
function createPlanet(){
    
    // Cargar UV Colors texture (una manera de cargar textura)
    var mapUrl = "images/ash_uvgrid01.jpg";
    var textureMap = new THREE.TextureLoader().load(mapUrl);
    var UVMaterial = new THREE.MeshPhongMaterial({ map: textureMap });

    // Companion Cube texture (Otra manera de cargar textura)
    var companionCubeTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/companionCube.png")});

    // Cargar turquoise texture
    var turquoiseTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/turquoise-texture.jpg")});

    // Cargar test texture
    var testTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/test1.png")});
    
    // Esfera con luna
    //Los atributos de SphereGeometry son scale, (algo que ver con ser esfera), (algo que ver con ser esfera)
    testPlanet = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), UVMaterial);
    moonOrbit = new THREE.Group();
    // Luna de esfera
    moon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), companionCubeTexture);
    moon.position.set(1.5, 0, 0);

    // no está en el scene
    planet_3 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 20), testTexture);
    planet_3.position.set(-3, 0, 0);

    // Agregar el planeta al grupo
    planetGroup.add(testPlanet);

    // Asignar orbita de lunas al planeta
    testPlanet.add(moonOrbit);

    // Asignar lunas a la órbita
    moonOrbit.add(moon);
    moonOrbit.add(planet_3);
    
}

// Esta funcion genera el planeta que se le pasa como parámetro
function createSpecificObjectPlanet(planet){

    // Cargar textura
    var planetTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+planet.name+"map.jpg")});

    // Generar planeta
    //Los atributos de SphereGeometry son scale, (algo que ver con ser esfera), (algo que ver con ser esfera)
    var newPlanet = new THREE.Mesh(new THREE.SphereGeometry(planet.scale, 20, 20), planetTexture);

    console.log("Creating " + planet.name);

    // Especificar posición
    newPlanet.position.set(planet.distance, 0, 0);

    // Agregar al grupo
    planetGroup.add(newPlanet);

    // Creación de lunas en caso de ser necesario
    if (planet.hasMoons) {
        
        // Crear orbita de lunas
        var moonOrbit = new THREE.Group();

        // Asignar orbita de lunas al planeta
        newPlanet.add(moonOrbit);

        // Iterar para crear todas las lunas necesarias
        for (let index = 0; index < planet.moons.length; index++) {

            // Cargar textura
            var moonTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+planet.moons[index].name+"map.jpg")});
            
            var newMoon = new THREE.Mesh(new THREE.SphereGeometry(planet.moons[index].scale, 20, 20), moonTexture);
            newMoon.position.set(planet.moons[index].position, planet.moons[index].position, 0);

            // Asignar lunas a la órbita
            moonOrbit.add(newMoon);

            newPlanet.moonOrbit = moonOrbit;

            // Combinar objetos de luna
            planet.moons[index] = combine(planet.moons[index], newMoon);
        }
    }
    
    // Retornar el combinado
    return combine(planet, newPlanet);
}

/*
// Esta funcion genera el sol
function createSun(sun){

    // Cargar textura
    var sunTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+sun.name+"map.jpg")});

    // Generar planeta
    //Los atributos de SphereGeometry son scale, (algo que ver con ser esfera), (algo que ver con ser esfera)
    var newPlanet = new THREE.Mesh(new THREE.SphereGeometry(sun.scale, 20, 20), sunTexture);

    console.log("Creating " + sun.name);

    // Especificar posición
    newPlanet.position.set(sun.distance, 0, 0);

    // Agregar al grupo
    planetGroup.add(newPlanet);

    // Generar órbitas de planetas
    for (planet in sun.planets) {
        
        // Crear orbita de planetas
        var planetOrbit = new THREE.Group();

        // Asignar orbita de al sol
        newPlanet.add(planetOrbit);

        planet.position.set(planet.distance, 0, 0);

        // Asignar planets a la órbita
        planetOrbit.add(planet);

        sun.orbits = 

    }

    // Creación de lunas en caso de ser necesario
    if (sun.hasMoons) {

        // Iterar para crear todas las lunas necesarias
        for (let index = 0; index < sun.moons.length; index++) {

            // Cargar textura
            var moonTexture = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load("images/"+sun.moons[index].name+"map.jpg")});
            
            var newMoon = new THREE.Mesh(new THREE.SphereGeometry(sun.moons[index].scale, 20, 20), moonTexture);
            newMoon.position.set(sun.moons[index].position, sun.moons[index].position, 0);


            newPlanet.moonOrbit = planetOrbit;

            // Combinar objetos de luna
            sun.moons[index] = combine(sun.moons[index], newMoon);
        }
    }
    
    // Retornar el combinado
    return combine(sun, newPlanet);
}
*/

// Combinar atributos de dos objetos
function combine(obj1, obj2){
   
   // Create new object in order to combine object properties
   var extended = {};
   
   // Iterar el primer objeto
   for (var prop in obj1) {
       if (obj1.hasOwnProperty(prop)) {
           // Push each value from `obj` into `extended`
           extended[prop] = obj1[prop];
        }
    }
    
    // Iterar el segundo objeto
    for (var prop in obj2) {
        if (obj2.hasOwnProperty(prop)) {
            // Push each value from `obj` into `extended`
            extended[prop] = obj2[prop];
        }
    }
    
    // Retornar el combinado
    return extended;
}

// Esta función genera el grupo de figuras de la izquierda
function createScene(canvas){    

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Contenedor de planetas de la derecha
    planetGroup = new THREE.Object3D();
    planetGroup.position.set(0,0,0);
    scene.add(planetGroup);

    // Generar planetas
    mercury = createSpecificObjectPlanet(mercury);
    venus = createSpecificObjectPlanet(venus);
    earth = createSpecificObjectPlanet(earth);
    mars = createSpecificObjectPlanet(mars);
    jupiter = createSpecificObjectPlanet(jupiter);
    saturn = createSpecificObjectPlanet(saturn);
    uranus = createSpecificObjectPlanet(uranus);
    neptune = createSpecificObjectPlanet(neptune);
    pluto = createSpecificObjectPlanet(pluto);
    
    sun.planets = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto]
    sun = createSpecificObjectPlanet(sun);

    // Meter a array para poder iterar todas las rotaciones
    planets = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto];

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
    sceneGroup.add(light);

    //TODO: arreglar la luz del sol
    // Crear luz de sol
    //color, intensity, distance, decay 
    var sunlight = new THREE.PointLight( 0xFFFF00, 1, 0, 2 );
    sunlight.position.set(sun.position.x, sun.position.y, sun.position.z);
    console.log(sun.position.x, sun.position.y, sun.position.z)
    sceneGroup.add(sunlight);
    
    // Agregar el grupo de planetas al sceneGroup para que también se vea afectado por los mouse/scale shifts
    planetGroup.position.set(0, 0, 0);
    sceneGroup.add(planetGroup);

    // Now add the group to our scene
    scene.add( sceneGroup );
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