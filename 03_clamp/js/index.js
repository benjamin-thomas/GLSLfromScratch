/*
    live-server --no-browser .

    Using the vscode plugins:
      - "glsl-literal", by boyswan
      - "GLSL Lint", by DanielToplak <-- disabled as it does not handle pre-injected identifiers, nor disabling linting selectively.
 */

function glsl(strings) {
    return strings.join();
}

const vShader = glsl`
varying vec3 v_position;
void main() {
    v_position = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.3, 1.0);
}
`;

const fShader = glsl`
uniform vec2 u_resolution;
varying vec3 v_position;

void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution;
    vec3 color = vec3(0.0);
    color.r = clamp(v_position.x, 0.0, 1.0);
    color.g = clamp(v_position.y, 0.0, 1.0);
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
    u_time: { value: 0.0 },
    u_mouse: { value: { x: 0.0, y: 0.0 } },
    u_resolution: { value: { x: 0.0, y: 0.0 } },
    u_color: { value: new THREE.Color(0xFF0000) },
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
