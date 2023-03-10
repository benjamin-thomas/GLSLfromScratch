/*
    live-server --no-browser .
 */

const vShader = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.3, 1.0);
}
`;

const fShader = `
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;

void main() {
    vec2 v = u_mouse/u_resolution;
    //vec3 color = vec3(u_mouse.x/u_resolution.x, 0.0, u_mouse.y/u_resolution.y);
    //vec3 color = vec3(v, 0.0).rbg;
    //vec3 color = vec3(sin(u_time) / 2.0 + 0.5, 0.0, cos(u_time) / 2.0 + 0.5);
    vec3 color = vec3(sin(u_time*3.0) / 2.0 + 0.5, u_mouse.x/u_resolution.x, cos(u_time*3.0) / 2.0 + 0.5);
    gl_FragColor = vec4(color, 1.0);
}
`;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const geometry = new THREE.PlaneGeometry(2, 2);
const uniforms = {
    u_time: {value: 0.0},
    u_mouse: {value: {x: 0.0, y: 0.0}},
    u_resolution: {value: {x: 0.0, y: 0.0}},
    u_color: {value: new THREE.Color(0xFF0000)},
};
const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vShader,
    fragmentShader: fShader,
});
const plane = new THREE.Mesh(geometry, material);

scene.add(plane);
camera.position.z = 1;

onWindowResize();
if ('ontouchstart' in window) {
    document.addEventListener('touchmove', move);
} else {
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', move);
}

animate();

function move(evt) {
    uniforms.u_mouse.value.x = (evt.touches) ? evt.touches[0].clientX : evt.clientX;
    uniforms.u_mouse.value.y = (evt.touches) ? evt.touches[0].clientY : evt.clientY;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    uniforms.u_time.value = clock.getElapsedTime();
}

function onWindowResize(event) {
    const aspectRatio = window.innerWidth / window.innerHeight;
    let width, height;
    if (aspectRatio >= 1) {
        width = 1;
        height = (window.innerHeight / window.innerWidth) * width;
    } else {
        width = aspectRatio;
        height = 1;
    }
    camera.left = -width;
    camera.right = width;
    camera.top = height;
    camera.bottom = -height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (uniforms.u_resolution !== undefined) {
        uniforms.u_resolution.value.x = window.innerWidth;
        uniforms.u_resolution.value.y = window.innerHeight;
    }
}
