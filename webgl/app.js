import Model from './model.js';
import Particle from './Particle.js';
import Shader from './shader.js';
import Matrix from './maths.js';
import { Maths, Vector3, Camera } from './maths.js';
import Detector from '/Detektor.js';
import XMLParser from '/XMLParser.js';

///////////////////////////////////////////////////////////////////////
// Graph
// provide data in the DOT language
var dotgraph = '1->2';
var DOTstring = 'dinetwork { }';
var parsedData = vis.network.convertDot(DOTstring);

var data = {
    nodes: parsedData.nodes,
    edges: parsedData.edges
}

var options = parsedData.options;

options.nodes = {
    color: 'black'
}

// create a network
var container = document.getElementById('graph');
var network = new vis.Network(container, data, options);


var camera = new Camera(0, 0, 10, new Vector3(0, 0, 0), new Vector3(0, 0, 0));

var tracks = [];
var particles = [];

var gunPosition = new Vector3(100, 0, 0);
var gunDirection = new Vector3(1, 0, 0);
var particleEnergy = 1.0;

var res = [];
var models = [];
var number_of_particles = 1;
var pointer;
var detectors = [];
var detector_buttons = [];
var detector_ids = [];
var charts = [];
var id = 0;

var x = null;
var y = null;

var oldX = null;
var oldY = null;

var move = false;
var down = false;


var disabled_style = {
    "display": 'none'
};

var detector_style = {
    "display": 'block'
};
var keyDown = ` ${0}`;

document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mouseup', onMouseUp);
document.addEventListener('keydown', logKey);
document.addEventListener('keyup', resetKey);

function hexToRgb(hex) {
    hex = hex.substr(1);
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return new Vector3(r / 255, g / 255, b / 255);
}
function clearData(chart) {
    chart.data.labels = [];
    chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
    });
    chart.update();
}
//clear run
document.getElementById("clear").addEventListener('click', function () {
    tracks = [];
    for(var i = 0;i<charts.length;i++){
        clearData(charts[i]);
    }
    pointer.position.x = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < detectors.length; i++) {
        detectors[i].deposit = 0;
        document.getElementById('dep' + parseFloat(detector_ids[detectors.length - 1 - i])).innerHTML = 'Deposit: ' + detectors[i].deposit + ' MeV';
    }
});
//export setup
document.getElementById('export-setup').addEventListener('click', function () {
    var xml = '<run>\n';
    for (var i = 0; i < detectors.length; i++) {
        xml += '\t<detector>\n\t\t<position>\n\t\t\t' + detectors[i].model.position.x + ',' + detectors[i].model.position.y + ',' + detectors[i].model.position.z + '\n\t\t</position>\n';
        xml += '\t\t<rotation>\n\t\t\t' + (detectors[i].model.rotation.x * (180.0 / Math.PI)) + ',' + (detectors[i].model.rotation.y * (180.0 / Math.PI)) + ',' + (detectors[i].model.rotation.z * (180.0 / Math.PI)) + '\n\t\t</rotation>\n';
        xml += '\t\t<scale>\n\t\t\t' + detectors[i].model.scale.x + ',' + detectors[i].model.scale.y + ',' + detectors[i].model.scale.z + '\n\t\t</scale>\n';
        xml += '\t\t<material>\n\t\t\t' + detectors[i].material + '\n\t\t</material>\n';
        xml += '\t\t<color>\n\t\t\t' + detectors[i].model.color.x + ',' + detectors[i].model.color.y + ',' + detectors[i].model.color.z + '\n\t\t</color>\n';

        xml += '\t\t<vertices>\n\t\t\t';
        for (var j = 0; j < detectors[i].model.vertices.length - 1; j++) {
            xml += detectors[i].model.vertices[j] + ',';
        }
        xml += detectors[i].model.vertices[detectors[i].model.vertices.length - 1] + '\n\t\t</vertices>\n';
        xml += '\t\t<normals>\n\t\t\t';
        for (var j = 0; j < detectors[i].model.normals.length - 1; j++) {
            xml += detectors[i].model.normals[j] + ',';
        }
        xml += detectors[i].model.normals[detectors[i].model.normals.length - 1] + '\n\t\t</normals>\n';
        xml += '\t</detector>\n';
    }
    xml += '\t<gun>\n\t\t<position>\n\t\t\t' + gunPosition.x + "," + gunPosition.y + "," + gunPosition.z + '\n\t\t</position>\n';
    xml += '\t\t<direction>\n\t\t\t' + gunDirection.x + "," + gunDirection.y + "," + gunDirection.z + '\n\t\t</direction>\n';
    xml += '\t\t<energy>\n\t\t\t' + particleEnergy + '\n\t\t</energy>\n\t</gun>\n';
    xml += '</run>';

    XMLParser.export(xml);
});

var isopen = false;

function getParticleByID(id) {
    for (var i = 0; i < particles.length; i++) {
        if (id == particles[i].id) return particles[i];
    }
}



var gun_button = document.getElementById('gun_button');
var gun_button_position = 260;

gun_button.addEventListener('click', function () {
    isopen = !isopen;
    if (isopen) {
        $("#gproperties").css({
            "width": "20%",
            "display": "block",
            "position": "fixed",
            "height": "200px",
            "bottom": "41",
            "padding": "5px",
            "border": "1px solid black"

        });

    } else {
        $("#gproperties").css(disabled_style);
    }
});
function resetKey(e) {
    keyDown = ` ${0}`;
}
function logKey(e) {
    keyDown = ` ${e.code}`;
}
function onMouseUp(e) {
    down = false;

}
function onMouseDown(e) {
    down = true;
}
function onMouseUpdate(e) {
    move = true;
    oldX = x;
    oldY = y;
    x = e.pageX;
    y = e.pageY;
}
function getMouseX() {
    return x;
}
function getMouseXd() {
    return oldX - x;
}
function getMouseYd() {
    return oldY - y;
}
function getMouseY() {
    return y;
}
var parser;

var InitDemo = function () {

    var canvas = document.getElementById('surface');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    var gl = canvas.getContext('webgl2');
    if (!gl) {
        console.log('WebGl not supported!');
    }

    gl.clearColor(.3, .3, .3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)


    //draw x axis
    var xAxis = new Model([1, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1], gl);
    xAxis.color = new Vector3(1, 0, 0);
    models.push(xAxis);
    //draw y axis
    var yAxis = new Model([0, 1, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1], gl);
    yAxis.color = new Vector3(0, 1, 0);
    models.push(yAxis);
    //draw z axis
    var zAxis = new Model([0, 0, 1, 0, 0, 0], [1, 1, 1, 1, 1, 1], gl);
    zAxis.color = new Vector3(0, 0, 1);
    models.push(zAxis);

    //box
    var first = new Model([1, 0.9999999403953552, -1, -1.0000001192092896, -0.9999998211860657
        , -1, -0.9999996423721313, 1.0000003576278687, -1, -0.9999999403953552, 1, 1, 0.9999993443489075
        , -1.0000005960464478, 1, 1.0000004768371582, 0.999999463558197, 1, 1.0000004768371582, 0.999999463558197,
        1, 1, -1, -1, 1, 0.9999999403953552, -1, 0.9999993443489075, -1.0000005960464478, 1, -1.0000001192092896, -0.9999998211860657
        , -1, 1, -1, -1, -1.0000001192092896, -0.9999998211860657, -1, -0.9999999403953552, 1, 1, -0.9999996423721313, 1.0000003576278687,
        -1, 1, 0.9999999403953552, -1, -0.9999999403953552, 1, 1, 1.0000004768371582, 0.999999463558197, 1, 1, 0.9999999403953552, -1, 1, -1, -1
        , -1.0000001192092896, -0.9999998211860657, -1, -0.9999999403953552, 1, 1, -1.0000003576278687, -0.9999996423721313, 1, 0.9999993443489075
        , -1.0000005960464478, 1, 1.0000004768371582, 0.999999463558197, 1, 0.9999993443489075, -1.0000005960464478, 1, 1, -1, -1, 0.9999993443489075
        , -1.0000005960464478, 1, -1.0000003576278687, -0.9999996423721313, 1, -1.0000001192092896, -0.9999998211860657, -1,
        -1.0000001192092896, -0.9999998211860657, -1,
        -1.0000003576278687, -0.9999996423721313, 1, -0.9999999403953552, 1, 1
        , 1, 0.9999999403953552, -1, -0.9999996423721313, 1.0000003576278687, -1
        , -0.9999999403953552, 1, 1], [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, -2.384185791015625e-7, 1, 0, -2.384185791015625e-7, 1, 0, -2.384185791015625e-7, -8.940696716308594e-8, -1, -4.76837158203125e-7, -8.940696716308594e-8, -1, -4.76837158203125e-7, -8.940696716308594e-8, -1, -4.76837158203125e-7, -1, 2.3841855067985307e-7, -1.4901156930591242e-7, -1, 2.3841855067985307e-7, -1.4901156930591242e-7, -1, 2.3841855067985307e-7, -1.4901156930591242e-7, 2.6822084464583895e-7, 1, 2.3841852225814364e-7, 2.6822084464583895e-7, 1, 2.3841852225814364e-7, 2.6822084464583895e-7, 1, 2.3841852225814364e-7, -2.980232594040899e-8, 0, -1, -2.980232594040899e-8, 0, -1, -2.980232594040899e-8, 0, -1, 5.96046660916727e-8, 0, 1, 5.96046660916727e-8, 0, 1, 5.96046660916727e-8, 0, 1, 1, -5.960464477539062e-7, 3.2782537573439186e-7, 1, -5.960464477539062e-7, 3.2782537573439186e-7, 1, -5.960464477539062e-7, 3.2782537573439186e-7, -4.768372150465439e-7, -1, 1.1920927533992653e-7, -4.768372150465439e-7, -1, 1.1920927533992653e-7, -4.768372150465439e-7, -1, 1.1920927533992653e-7, -1, 2.3841863594498136e-7, -1.1920931797249068e-7, -1, 2.3841863594498136e-7, -1.1920931797249068e-7, -1, 2.3841863594498136e-7, -1.1920931797249068e-7, 2.0861631355728605e-7, 1, 8.940701690107744e-8, 2.0861631355728605e-7, 1, 8.940701690107744e-8, 2.0861631355728605e-7, 1, 8.940701690107744e-8], gl);

    document.getElementById('myfileinput').addEventListener('input', read);
    document.addEventListener('wheel', updateWheel);
    function updateWheel(e) {
        if (e.deltaY != 0) {
            if (getMouseX() < canvas.width * .8 && getMouseX() > canvas.width * .2) {
                camera.d += (camera.d / e.deltaY) * 10;
            }

        }
    }
    var cons = document.getElementById('console');
    cons.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            var r = cons.value;
            cons.value = '';
            parseScript(r);
        }
    });
    var variables = [];
    var functions = [];
    var number_of_runs = 0;
    function isString(s) {
        if (s[0] == '"' && s[s.length - 1] == '"' || s[0] == "'" && s[s.length - 1] == "'") return true;
        return false;
    }
    function getVariable(n) {
        for (var k = 0; k < variables.length; k++) {
            if (variables[k].key == n) return variables[k];
        }
        return null;
    }
    function deleteVariable(n) {
        for (var k = 0; k < variables.length; k++) {
            if (variables[k] == n) {
                variables.splice(k, 1);
                return;
            }
        }
    }
    //parse language sript
    function parseScript(s) {

        tracks = [];
        pointer.position.x = Number.MAX_SAFE_INTEGER;
        for (var i = 0; i < detectors.length; i++) {
            detectors[i].deposit = 0;
            document.getElementById('dep' + parseFloat(detector_ids[detectors.length - 1 - i])).innerHTML = 'Deposit: ' + detectors[i].deposit + ' MeV';
        }

        s = s.replace(/(\r\n|\n|\r|\t| )/gm, ""); //ignore tabs newlines etc.

        var lines = s.split(';');
        for (var i = 0; i < lines.length; i++) {

            var words = lines[i].split('=');

            if (words.length > 1) {

                if (isString(words[1])) {
                    var old = getVariable(words[0]);
                    if (old == null) {
                        variables.push({ key: words[0], type: "string", value: words[1].replace(/["']/g, "") });
                    } else {
                        old.value = words[1].replace(/["']/g, "");
                    }

                }
                if (words[1] == 'Detector') {
                    variables.push({ key: words[0], type: "detector", value: id });
                    var tmp_m = new Model(first.vertices, first.normals, gl);
                    tmp_m.drawLines = false;
                    detectors.push(new Detector(tmp_m));

                    addButton();
                }
            }
            var gun_functions = lines[i].split('(');
            if (gun_functions.length > 1) {
                var function_param = '';
                var inc = false;
                for (var j = 0; j < lines[i].length; j++) {
                    if (lines[i][j] == ')') inc = false;
                    if (inc) function_param += lines[i][j];
                    if (lines[i][j] == '(') inc = true;

                }
                if (gun_functions[0] == 'print') {
                    if (isString(function_param)) {
                        function_param = function_param.replace(/["']/g, "");
                        document.getElementById('console').value = function_param;
                    } else {
                        function_param = function_param.replace(/["']/g, "");
                        document.getElementById('console').value = getVariable(function_param).value;;

                    }
                }
                if (gun_functions[0] == 'delete') {
                    var selected = getVariable(function_param).value;
                    if (selected == -1) return;
                    var dl = -1;
                    for (var k = 0; k < detector_ids.length; k++) {
                        if (selected == detector_ids[k]) dl = k;
                    }
                    if (dl == -1) return;
                    detectors.splice(dl, 1);
                    detector_buttons.splice(dl, 1);
                    detector_ids.splice(dl, 1);
                    charts.splice(dl, 1);
                    document.getElementById('div' + parseFloat(selected)).remove();
                    deleteVariable(getVariable(function_param));
                }
                if (gun_functions[0] == 'setGunEnergy') {
                    document.getElementById('energy').value = parseFloat(function_param);
                }
                if (gun_functions[0] == 'setGunPosition') {
                    document.getElementById('gunx').value = parseFloat(function_param.split(',')[0]);
                    document.getElementById('guny').value = parseFloat(function_param.split(',')[1]);
                    document.getElementById('gunz').value = parseFloat(function_param.split(',')[2]);
                }
                if (gun_functions[0] == 'setGunDirection') {
                    document.getElementById('gundirx').value = parseFloat(function_param.split(',')[0]);
                    document.getElementById('gundiry').value = parseFloat(function_param.split(',')[1]);
                    document.getElementById('gundirz').value = parseFloat(function_param.split(',')[2]);
                }
                if (gun_functions[0] == 'run') {
                    number_of_runs = parseFloat(function_param);
                }

            }


            var function_words = lines[i].split('.');
            if (function_words.length > 1) {
                var index = -1;
                index = parseFloat(getVariable(function_words[0]).value);
                var function_param = '';
                var inc = false;
                for (var j = 0; j < function_words[1].length; j++) {
                    if (function_words[1][j] == ')') inc = false;
                    if (inc) function_param += function_words[1][j];
                    if (function_words[1][j] == '(') inc = true;

                }
                var func = function_words[1].split('(');
                if (func[0] == "setPosition") {
                    if (function_param.split(',').length < 3) alert('Not enough parameters' + '\nline: ' + i);
                    document.getElementById('detectorx' + parseFloat(index)).value = parseFloat(function_param.split(',')[0]);
                    document.getElementById('detectory' + parseFloat(index)).value = parseFloat(function_param.split(',')[1]);
                    document.getElementById('detectorz' + parseFloat(index)).value = parseFloat(function_param.split(',')[2]);
                }
                if (func[0] == "setRotation") {
                    if (function_param.split(',').length < 3) alert('Not enough parameters' + '\nline: ' + i);
                    document.getElementById('rox' + parseFloat(index)).value = parseFloat(function_param.split(',')[0]);
                    document.getElementById('roty' + parseFloat(index)).value = parseFloat(function_param.split(',')[1]);
                    document.getElementById('rotz' + parseFloat(index)).value = parseFloat(function_param.split(',')[2]);
                }
                if (func[0] == "setScale") {
                    if (function_param.split(',').length < 3) alert('Not enough parameters' + '\nline: ' + i);
                    document.getElementById('rox' + parseFloat(index)).value = parseFloat(function_param.split(',')[0]);
                    document.getElementById('roty' + parseFloat(index)).value = parseFloat(function_param.split(',')[1]);
                    document.getElementById('rotz' + parseFloat(index)).value = parseFloat(function_param.split(',')[2]);
                }
                if (func[0] == "setMaterial") {
                    switch (function_param) {
                        case "'Lead'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Pb';
                            break;
                        case "'Caesium'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Cs';
                            break;
                        case "'Manganese'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Mn';
                            break;
                        case "'Sodium'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Na';
                            break;
                        case "'Helium'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_He';
                            break;
                        case "'Silicon'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Si';
                            break;
                        case "'Litium'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Li';
                            break;
                        case "'Hidrogen'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_H';
                            break;
                        case "'Iron'":
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Fe';
                            break;
                        default:
                            document.getElementById('materials' + parseFloat(index)).value = 'G4_Pb';
                            break;
                    }
                }
            }

        }
    }
    document.getElementById('loadScript').addEventListener('input', function (e) {
        var fileInput = document.getElementById("loadScript");
        var files = fileInput.files;
        var file;
        for (var i = 0; i < files.length; i++) {
            file = files[i];

            id = 0;
            for (var j = 0; j < detector_ids.length; j++) {
                document.getElementById('div' + parseFloat(detector_ids[j])).remove();
            }
            detector_ids = [];
            detectors = [];
            detector_buttons = [];
            charts = [];
            variables = [];
            var r = new FileReader();
            e.target.value = null;
            r.onload = function (e) {
                parseScript(e.target.result);
            }
            r.readAsText(file);
        }

    });
    //parse XML
    document.getElementById('parse').addEventListener('input', function (e) {
        var fileInput = document.getElementById("parse");
        var files = fileInput.files;
        var file;
        for (var i = 0; i < files.length; i++) {
            file = files[i];
            var r = new FileReader();

            id = 0;
            for (var j = 0; j < detector_ids.length; j++) {
                document.getElementById('div' + parseFloat(detector_ids[j])).remove();
            }
            detector_ids = [];
            detectors = [];
            detector_buttons = [];

            e.target.value = null;
            r.onload = function (e) {
                parser = new XMLParser(e.target.result);
                var d_s = parser.loadAttribute('detector');
                for (var j = 0; j < d_s.length; j++) {
                    parser = new XMLParser(d_s[j]);
                    //Vertices
                    var t_s = parser.loadAttribute('vertices')[0];
                    var t_v = t_s.split(',');
                    var t_vf = [];
                    for (var k = 0; k < t_v.length; k++) {
                        t_vf.push(parseFloat(t_v[k]));
                    }
                    //Normals
                    t_s = parser.loadAttribute('normals')[0];
                    var t_n = t_s.split(',');
                    var t_nf = [];
                    for (var k = 0; k < t_n.length; k++) {
                        t_nf.push(parseFloat(t_n[k]));
                    }
                    //Color
                    t_s = parser.loadAttribute('color')[0];
                    var t_c = t_s.split(',');
                    var t_cf = [];
                    for (var k = 0; k < t_c.length; k++) {
                        t_cf.push(parseFloat(t_c[k]));
                    }
                    //Material
                    t_s = parser.loadAttribute('material')[0];
                    var mat = t_s.replace(/(\r\n|\n|\r|\t)/gm, "");

                    //Position
                    t_s = parser.loadAttribute('position')[0];
                    var t_p = t_s.split(',');
                    var t_pf = [];
                    for (var k = 0; k < t_p.length; k++) {
                        t_pf.push(parseFloat(t_p[k]));
                    }
                    //Rotation
                    t_s = parser.loadAttribute('rotation')[0];
                    var t_r = t_s.split(',');
                    var t_rf = [];
                    for (var k = 0; k < t_r.length; k++) {
                        t_rf.push(parseFloat(t_r[k]));
                    }
                    //Scale
                    t_s = parser.loadAttribute('scale')[0];
                    var t_sc = t_s.split(',');
                    var t_scf = [];
                    for (var k = 0; k < t_sc.length; k++) {
                        t_scf.push(parseFloat(t_sc[k]));
                    }

                    var t_m = new Model(t_vf, t_nf, gl);
                    t_m.position.x = t_pf[0];
                    t_m.position.y = t_pf[1];
                    t_m.position.z = t_pf[2];
                    t_m.color.x = t_cf[0];
                    t_m.color.y = t_cf[1];
                    t_m.color.z = t_cf[2];
                    t_m.drawLines = false;
                    var t_d = new Detector(t_m);
                    t_d.material = mat;
                    detectors.push(t_d);

                    addButton();
                    document.getElementById('detectorx' + parseFloat(j)).value = t_pf[0];
                    document.getElementById('detectory' + parseFloat(j)).value = t_pf[1];
                    document.getElementById('detectorz' + parseFloat(j)).value = t_pf[2];

                    document.getElementById('rotx' + parseFloat(j)).value = t_rf[0];
                    document.getElementById('roty' + parseFloat(j)).value = t_rf[1];
                    document.getElementById('rotz' + parseFloat(j)).value = t_rf[2];

                    document.getElementById('scalex' + parseFloat(j)).value = t_scf[0];
                    document.getElementById('scaley' + parseFloat(j)).value = t_scf[1];
                    document.getElementById('scalez' + parseFloat(j)).value = t_scf[2];

                    document.getElementById('materials' + parseFloat(j)).value = mat;
                }
                parser = new XMLParser(e.target.result);
                var v_s = parser.loadAttribute('gun');
                parser = new XMLParser(v_s[0]);
                var t_s = parser.loadAttribute('position')[0];
                var t_p = t_s.split(',');
                var t_pf = [];
                for (var k = 0; k < t_p.length; k++) {
                    t_pf.push(parseFloat(t_p[k]));
                }
                document.getElementById('gunx').value = t_pf[0];
                document.getElementById('guny').value = t_pf[1];
                document.getElementById('gunz').value = t_pf[2];

                t_s = parser.loadAttribute('direction')[0];
                t_p = t_s.split(',');
                t_pf = [];
                for (var k = 0; k < t_p.length; k++) {
                    t_pf.push(parseFloat(t_p[k]));
                }
                document.getElementById('gundirx').value = t_pf[0];
                document.getElementById('gundiry').value = t_pf[1];
                document.getElementById('gundirz').value = t_pf[2];

                t_s = parser.loadAttribute('energy')[0];
                t_s.replace(/(\r\n|\n|\r|\t)/gm, "");
                document.getElementById('energy').value = parseFloat(t_s);
            };

            r.readAsText(file);
        }
    });
    document.getElementById('run').addEventListener('click', run);
    document.getElementById('run').addEventListener('click', function () { number_of_runs = parseFloat(document.getElementById('nofp').value); });

    function run(e) {
        var ws = new WebSocket("ws://134.255.16.39:5001");

        //number_of_runs = parseFloat(document.getElementById('nofp').value);
        ws.onopen = function (event) {
            var message_data = [];

            // particle gun stuff
            message_data.push(1); //number of particles

            message_data.push(gunPosition.x.toString());
            message_data.push(gunPosition.y.toString());
            message_data.push(gunPosition.z.toString());

            message_data.push(gunDirection.x.toString());
            message_data.push(gunDirection.y.toString());
            message_data.push(gunDirection.z.toString());

            message_data.push(particleEnergy.toString());

            // detector stuff
            var number_of_detectors = detectors.length;

            message_data.push(number_of_detectors);

            for (var i = 0; i < number_of_detectors; i++) {

                message_data.push(detectors[i].material);

                message_data.push(detectors[i].model.position.x);
                message_data.push(detectors[i].model.position.y);
                message_data.push(detectors[i].model.position.z);

                message_data.push(detectors[i].model.rotation.x);
                message_data.push(detectors[i].model.rotation.y);
                message_data.push(detectors[i].model.rotation.z);

                message_data.push(detectors[i].model.scale.x);
                message_data.push(detectors[i].model.scale.y);
                message_data.push(detectors[i].model.scale.z);

                message_data.push(detectors[i].model.vertices.length);
                for (var j = 0; j < detectors[i].model.vertices.length; j++) {
                    message_data.push(detectors[i].model.vertices[j]);
                }
            }
            message_data.push('end');

            ws.send(message_data);
        };
        ws.onmessage = function (event) {

            var message = event.data;

            var floats = message.split(' ');
            var index = 0;
            var j = 0;
            function toNode(p, l) {
                if (p == 'gamma') return '"' + l + '"';
                if (p == 'e-') return '"' + l + '"';
                if (p == 'e+') return '"' + l + '"';
            }
            particles = [];
            dotgraph = '';
            while (index < floats.length - 1 - detectors.length - 1) {
                var track_data = [];
                var numberOfSteps = parseInt(floats[index]);
                if (numberOfSteps == 0) break;
                var definition = floats[index + 1];
                for (var i = 0; i < numberOfSteps; i++) {
                    var particle = new Particle();
                    particle.position.x = parseFloat(floats[index + i * 6 + 2]) * .1;
                    particle.position.y = parseFloat(floats[index + i * 6 + 3]) * .1;
                    particle.position.z = parseFloat(floats[index + i * 6 + 4]) * .1;
                    if (i == 0) {
                        for (var k = 0; k < particles.length; k++) {
                            if (particles[k].position.x == particle.position.x && particles[k].position.y == particle.position.y && particles[k].position.z == particle.position.z) {
                                dotgraph += toNode(particles[k].definition, k) + '->' + toNode(definition, j) + ';';
                            }
                        }
                    }
                    track_data.push(parseFloat(floats[index + i * 6 + 2]) * .1);
                    track_data.push(parseFloat(floats[index + i * 6 + 3]) * .1);
                    track_data.push(parseFloat(floats[index + i * 6 + 4]) * .1);

                    particle.definition = definition;
                    particle.track_id = parseInt(floats[index + i * 6 + 5]);
                    particle.parent_id = parseInt(floats[index + i * 6 + 6]);
                    particle.totalEnergy = parseFloat(floats[index + i * 6 + 7]);

                    particle.id = j;

                    if (i == numberOfSteps - 1) {
                        dotgraph += toNode(definition, j);
                    } else {
                        dotgraph += toNode(definition, j) + '->';
                    }
                    j++;

                    particles.push(particle);
                }
                dotgraph += ';';
                index += numberOfSteps * 6 + 2;

                var t_norm = [];
                for (var k = 0; k < track_data.length; k++) {
                    t_norm.push(1);
                }
                var tm = new Model(track_data, t_norm, gl);
                if (definition == "e-") tm.color = new Vector3(1, 0, 1);
                if (definition == "gamma") tm.color = new Vector3(1, 1, 1);
                if (definition == "e+") tm.color = new Vector3(1, 1, 0);
                tm.drawLines = true;
                tracks.push(tm);
            }
            function addData(chart, label, data) {
                chart.data.labels.push(label);
                chart.data.datasets.forEach((dataset) => {
                    dataset.data.push(data);
                });
                chart.update();
            }

            
            for (var i = 0; i < detectors.length; i++) {
                detectors[i].deposit += parseFloat(floats[floats.length - i - 2]);

                var number = Math.round((parseFloat(floats[floats.length - i - 2]) + Number.EPSILON) * 10) / 10;

                var index = detectors[i].getIndex(number);
                if (index == -1) {
                    detectors[i].hits.push(number);
                    detectors[i].numberOfHits.push(1);
                } else {
                    detectors[i].numberOfHits[index]++;
                }
                detectors[i].sort();
                clearData(charts[i]);

                for (var k = 0; k < detectors[i].hits.length; k++) {
                    if (detectors[i].hits[k] > 0 && detectors[i].hits[k] != particleEnergy) addData(charts[i], '' + detectors[i].hits[k] + 'MeV', detectors[i].numberOfHits[k]);
                }
                document.getElementById('dep' + parseFloat(detector_ids[detectors.length - 1 - i])).innerHTML = 'Deposit: ' + detectors[i].deposit + ' MeV';
            }
            for (var i = 0; i < j; i++) {
                if (particles[i].definition == 'e-') dotgraph += '"' + i + '" [shape=circle, style=filled, fillcolor=blue]\n ';
                if (particles[i].definition == 'e+') dotgraph += '"' + i + '" [shape=circle, style=filled, fillcolor=red]\n ';
                if (particles[i].definition == 'gamma') dotgraph += '"' + i + '" [shape=circle, style=filled, fillcolor=white]\n ';

            }

            DOTstring = 'graph g {' + dotgraph;

            DOTstring += '}';
            parsedData = vis.network.convertDot(DOTstring);

            data = {
                nodes: parsedData.nodes,
                edges: parsedData.edges
            }

            options = parsedData.options;
            // you can extend the options like a normal JSON variable:
            options.nodes = {
                color: 'black'
            }

            // create a network
            network = new vis.Network(container, data, options); // turn off physics
            network.on("stabilizationIterationsDone", function () {
                network.setOptions({
                    nodes: { physics: false },
                    edges: { physics: false },
                    "layout": {
                        "hierarchical": {
                            "direction": "LR",
                            "sortMethod": "directed",
                            "nodeSpacing": 200,
                            "treeSpacing": 400
                        }
                    },
                    physics: {
                        forceAtlas2Based: {
                            gravitationalConstant: -26,
                            centralGravity: 0.005,
                            springLength: 230,
                            springConstant: 0.18,
                            avoidOverlap: 1.5
                        },
                        maxVelocity: 146,
                        solver: 'forceAtlas2Based',
                        timestep: 0.35,
                        stabilization: {
                            enabled: true,
                            iterations: 1000,
                            updateInterval: 25
                        }
                    }
                });
            });
            network.on('click', function (properties) { //onclick event
                var ids = properties.nodes;
                var tmp_particle = getParticleByID(ids);
                pointer.position = tmp_particle.position;
                var data_field = document.getElementById("particle_data");
                data_field.innerHTML = '<p>Definition: ' + tmp_particle.definition + '</p>' + '</p><p>position:</p><p>x: ' + tmp_particle.position.x + ' cm y: ' +
                    tmp_particle.position.y + ' cm z: ' + tmp_particle.position.z + ' cm </p>' +
                    '<p>Energy: ' + tmp_particle.totalEnergy + ' MeV</p>';
            });
        };
    }
    function read(e) {
        function readInt(data, i) {
            var chars = new Uint8Array([data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2), data.charCodeAt(i + 3)]);

            return new Int32Array(chars.buffer)[0];
        }
        function readFloat(data, i) {
            var chars = new Uint8Array([data.charCodeAt(i), data.charCodeAt(i + 1), data.charCodeAt(i + 2), data.charCodeAt(i + 3)]);

            return new Float32Array(chars.buffer)[0];
        }
        var fileInput = document.getElementById("myfileinput");
        var files = fileInput.files;

        var file;
        for (var i = 0; i < files.length; i++) {
            file = files[i];
            e.target.value = null;
            var r = new FileReader();

            r.onload = function () {
                var data = r.result;
                res = [];
                var normals = [];
                var size = readInt(data, 80);
                for (var k = 0; k < size; k++) {
                    for (var j = 0; j < 9; j++) {
                        res.push(readFloat(data, 96 + j * 4 + k * 50));
                    }
                }
                for (var k = 0; k < size; k++) {
                    for (var j = 0; j < 3; j++) {
                        normals.push(readFloat(data, 84 + j * 4 + k * 50));
                    }
                    for (var j = 0; j < 3; j++) {
                        normals.push(readFloat(data, 84 + j * 4 + k * 50));
                    }
                    for (var j = 0; j < 3; j++) {
                        normals.push(readFloat(data, 84 + j * 4 + k * 50));
                    }
                }
                var mod = new Model(res, normals, gl);
                mod.drawLines = false;
                //models.push(mod);
                detectors.push(new Detector(mod));
                addButton();
            };
            r.readAsBinaryString(file);

        }

    }


    var shader = new Shader(gl);

    var then = 0;

    var mat = Maths.createTransformationMatrix(0, 0, 0, 0, 0, 0, .1, .1, .1);



    first.drawLines = false;
    detectors.push(new Detector(new Model(first.vertices, first.normals, gl)));
    detectors[0].model.drawLines = false;
    addButton();

   
    models.push(new Model(first.vertices, first.normals, gl));

    models[3].drawLines = false;
    models[3].scale.x = .1;
    models[3].scale.y = .1;
    models[3].scale.z = .1;
    models[3].color = new Vector3(0, 1, 0);

    pointer = new Model(first.vertices, first.normals, gl);
    pointer.position.x = Number.MAX_SAFE_INTEGER;
    pointer.drawLines = false;
    pointer.color = new Vector3(1, 0, 0);

    var projection = Maths.createProjectionMatrix(70.0, .001, 1000.0, canvas.width, canvas.height);

    var view = Maths.createViewMatrix(camera);

    function updateElements() {
        for (var i = 0; i < detectors.length; i++) {
            if (detector_ids == []) break;
            detectors[i].material = document.getElementById("materials" + parseFloat(detector_ids[i])).options[document.getElementById("materials" + parseFloat(detector_ids[i])).selectedIndex].value;

            detectors[i].model.position.x = document.getElementById('detectorx' + parseFloat(detector_ids[i])).value;
            detectors[i].model.position.y = document.getElementById('detectory' + parseFloat(detector_ids[i])).value;
            detectors[i].model.position.z = document.getElementById('detectorz' + parseFloat(detector_ids[i])).value;
            detectors[i].model.rotation.x = document.getElementById('rotx' + parseFloat(detector_ids[i])).value / (180.0 / Math.PI);
            detectors[i].model.rotation.y = document.getElementById('roty' + parseFloat(detector_ids[i])).value / (180.0 / Math.PI);
            detectors[i].model.rotation.z = document.getElementById('rotz' + parseFloat(detector_ids[i])).value / (180.0 / Math.PI);

            detectors[i].model.scale.x = document.getElementById('scalex' + parseFloat(detector_ids[i])).value;
            detectors[i].model.scale.y = document.getElementById('scaley' + parseFloat(detector_ids[i])).value;
            detectors[i].model.scale.z = document.getElementById('scalez' + parseFloat(detector_ids[i])).value;

            if (selected == detector_ids[i]) {
                detectors[i].model.outline = true;
            } else {
                detectors[i].model.outline = false;
            }
        }
        // pointer size
        pointer.scale.x = camera.d / 1000.0;
        pointer.scale.y = camera.d / 1000.0;
        pointer.scale.z = camera.d / 1000.0;
    }
    function render(now) {
        updateElements();
        if (number_of_runs > 1) {
            console.log('Number of runs: ' + number_of_runs);
            run();
        }
        number_of_runs--;
        gunPosition.x = document.getElementById('gunx').value;
        gunPosition.y = document.getElementById('guny').value;
        gunPosition.z = document.getElementById('gunz').value;

        gunDirection.x = document.getElementById('gundirx').value;
        gunDirection.y = document.getElementById('gundiry').value;
        gunDirection.z = document.getElementById('gundirz').value;

        models[3].rotation.y = 0 + (3.14 * gunDirection.x) * 57;
        models[3].rotation.x = 0 + (3.14 * gunDirection.y) * 57;
        models[3].rotation.z = 0 + (3.14 * gunDirection.z) * 57;


        particleEnergy = document.getElementById('energy').value;

        models[3].position = gunPosition;

        

        if (down && move) {
            if (keyDown === ` ${'ControlLeft'}`) {
                camera.a.y -= .01 * (getMouseYd() * .01 * camera.d * ((89.0 - Math.abs(camera.y)) / 89.0));

                camera.a.x -= .01 * (Math.cos(camera.x / (180 / Math.PI)) * getMouseXd() * .01 * camera.d * ((89.0 - Math.abs(camera.y)) / 89.0));
                camera.a.z += .01 * (Math.sin(camera.x / (180 / Math.PI)) * getMouseXd() * .01 * camera.d * ((89.0 - Math.abs(camera.y)) / 89.0));

                camera.a.x -= .01 * (Math.cos(camera.x / (180 / Math.PI)) * getMouseXd() * .01 * camera.d +
                    Math.sin(camera.x / (180 / Math.PI)) * getMouseYd() * .01 * camera.d);

                camera.a.z -= .01 * (Math.cos(camera.x / (180 / Math.PI)) * getMouseYd() * .01 * camera.d +
                    Math.sin(camera.x / (180 / Math.PI)) * -getMouseXd() * .01 * camera.d);



            } else {
                camera.x += getMouseXd() / 2;
                camera.y += getMouseYd() / 2;
            }

        }
        camera = updateCamera(camera);

        view = Maths.createViewMatrix(camera);

        now *= 0.001;
        const deltaTime = now - then;
        then = now;
        gl.clearColor(.3, .3, .3, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        /*gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, t.getTexture);*/

        shader.bind();
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        for (var i = 0; i < detectors.length; i++) {
            if (detector_ids[i] == selected) continue;
            
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.bindVertexArray(detectors[i].model.vao);
            mat = Maths.createTransformationMatrix(detectors[i].model.position.x, detectors[i].model.position.y, detectors[i].model.position.z,
                detectors[i].model.rotation.x, detectors[i].model.rotation.y, detectors[i].model.rotation.z, detectors[i].model.scale.x, detectors[i].model.scale.y,
                detectors[i].model.scale.z);
            shader.setUniform3f("color", detectors[i].model.color.x, detectors[i].model.color.y, detectors[i].model.color.z);
            shader.setUniform1i("sampler", 0);
            shader.setUniform4fv("view", view);
            shader.setUniform4fv("projection", projection);
            shader.setUniform4fv("transformation", mat);
            detectors[i].model.draw();
            gl.disableVertexAttribArray(0);
            gl.disableVertexAttribArray(1);
        }
        for (var i = models.length - 1; i >= 0; i--) {
            gl.disable(gl.DEPTH_TEST);
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.bindVertexArray(models[i].vao);
            mat = Maths.createTransformationMatrix(models[i].position.x, models[i].position.y, models[i].position.z,
                models[i].rotation.x, models[i].rotation.y, models[i].rotation.z, models[i].scale.x, models[i].scale.y, models[i].scale.z);
            shader.setUniform3f("color", models[i].color.x, models[i].color.y, models[i].color.z);
            shader.setUniform1i("sampler", 0);
            shader.setUniform4fv("view", view);
            shader.setUniform4fv("projection", projection);
            shader.setUniform4fv("transformation", mat);
            models[i].draw();
            gl.disableVertexAttribArray(0);
            gl.disableVertexAttribArray(1);
        }
        for (var i = 0; i < detectors.length; i++) {
            gl.disable(gl.DEPTH_TEST);
            if (detector_ids[i] != selected) continue;
            if (detectors[i].model.outline) {
                gl.enableVertexAttribArray(0);
                gl.enableVertexAttribArray(1);
                gl.bindVertexArray(detectors[i].model.vao);
                mat = Maths.createTransformationMatrix(detectors[i].model.position.x, detectors[i].model.position.y, detectors[i].model.position.z,
                    detectors[i].model.rotation.x, detectors[i].model.rotation.y, detectors[i].model.rotation.z, detectors[i].model.scale.x * 1.01, detectors[i].model.scale.y * 1.01,
                    detectors[i].model.scale.z * 1.01);
                shader.setUniform3f("color", 1, .4, 0);
                shader.setUniform1i("sampler", 0);
                shader.setUniform4fv("view", view);
                shader.setUniform4fv("projection", projection);
                shader.setUniform4fv("transformation", mat);
                detectors[i].model.draw();
                gl.disableVertexAttribArray(0);
                gl.disableVertexAttribArray(1);
            }
            gl.enable(gl.DEPTH_TEST);
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.bindVertexArray(detectors[i].model.vao);
            mat = Maths.createTransformationMatrix(detectors[i].model.position.x, detectors[i].model.position.y, detectors[i].model.position.z,
                detectors[i].model.rotation.x, detectors[i].model.rotation.y, detectors[i].model.rotation.z, detectors[i].model.scale.x, detectors[i].model.scale.y,
                detectors[i].model.scale.z);
            shader.setUniform3f("color", detectors[i].model.color.x, detectors[i].model.color.y, detectors[i].model.color.z);
            shader.setUniform1i("sampler", 0);
            shader.setUniform4fv("view", view);
            shader.setUniform4fv("projection", projection);
            shader.setUniform4fv("transformation", mat);
            detectors[i].model.draw();
            gl.disableVertexAttribArray(0);
            gl.disableVertexAttribArray(1);
        }
        
        for (var i = 0; i < tracks.length; i++) {
            gl.disable(gl.DEPTH_TEST);
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.bindVertexArray(tracks[i].vao);
            mat = Maths.createTransformationMatrix(0, 0, 0, 0, 0, 0, 1, 1, 1);
            shader.setUniform3f("color", tracks[i].color.x, tracks[i].color.y, tracks[i].color.z);
            shader.setUniform1i("sampler", 0);
            shader.setUniform4fv("view", view);
            shader.setUniform4fv("projection", projection);
            shader.setUniform4fv("transformation", mat);
            tracks[i].draw();
            gl.disableVertexAttribArray(0);
            gl.disableVertexAttribArray(1);
        }

        // draw particle pointer
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.bindVertexArray(pointer.vao);
        mat = Maths.createTransformationMatrix(pointer.position.x, pointer.position.y, pointer.position.z,
            pointer.rotation.x, pointer.rotation.y, pointer.rotation.z, pointer.scale.x, pointer.scale.y, pointer.scale.z);
        shader.setUniform3f("color", pointer.color.x, pointer.color.y, pointer.color.z);
        shader.setUniform1i("sampler", 0);
        shader.setUniform4fv("view", view);
        shader.setUniform4fv("projection", projection);
        shader.setUniform4fv("transformation", mat);
        pointer.draw();
        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);

        shader.unBind();
        move = false;
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);


};
var selected = -1;
function addButton() {
    var div = document.createElement("div");
    div.classList.add('dropdown');

    div.id = 'div' + parseFloat(id);
    var btn = document.createElement('BUTTON');

    btn.innerHTML = "Detector" + id;
    btn.id = 'button' + id;

    div.innerHTML = '<article id="properties' + id + '">' +
        'position: <br>' +
        'x: <input class="field" type="number" value="0" id="detectorx' + id + '"> cm ' +
        'y: <input class="field" type="number" value="0" id="detectory' + id + '"> cm ' +
        'z: <input class="field" type="number" value="0" id="detectorz' + id + '"> cm <br>' +


        'rotation: <br>' +
        'x: <input class="field" type="number" value="0" id="rotx' + id + '">' +
        'y: <input class="field" type="number" value="0" id="roty' + id + '">' +
        'z: <input class="field" type="number" value="0" id="rotz' + id + '"><br>' +

        'scale: <br>' +
        'x: <input class="field" type="number" value="1" id="scalex' + id + '">' +
        'y: <input class="field" type="number" value="1" id="scaley' + id + '">' +
        'z: <input class="field" type="number" value="1" id="scalez' + id + '"><br>' +

        'material: <br>' +

        '<select id="materials' + id + '">' +
        '<option value="G4_Pb" selected>Lead</option>' +
        '<option value="G4_Fe">Iron</option>' +
        '<option value="G4_Na">Sodium</option>' +
        '<option value="G4_H">Hidrogen</option>' +
        '<option value="G4_He">Helium</option>' +
        '<option value="G4_Li">Litium</option>' +
        '<option value="G4_Si">Silicon</option>' +
        '<option value="G4_Mn">Manganese</option>' +
        '<option value="G4_Cs">Caesium</option>' +
        '</select><br>' +
        '<p id="dep' + id + '">EnergyDeposited: </p>' +
        'Color: <br>' +
        '<input type="color" id="color' + id + '"></input><br>' +
        '<button id="delete' + id + '">Delete</button>' +
        '<canvas id="chart' + id + '"></canvas>' +
        '</article>';

    div.appendChild(btn);
    document.getElementById('holder').appendChild(div);
    document.getElementById('delete' + parseFloat(id)).addEventListener('click', function () {
        if (selected == -1) return;
        var dl = -1;
        for (var k = 0; k < detector_ids.length; k++) {
            if (selected == detector_ids[k]) dl = k;
        }
        if (dl == -1) return;
        detectors.splice(dl, 1);
        detector_buttons.splice(dl, 1);
        detector_ids.splice(dl, 1);
        charts.splice(dl, 1);
        document.getElementById('div' + parseFloat(selected)).remove();
    });
    var cl = document.getElementById('color' + id);
    cl.addEventListener('input', function () {
        var k = -1;
        for (var j = 0; j < detector_ids.length; j++) {
            if (detector_ids[j] == selected) k = j;
        }
        detectors[k].model.color = hexToRgb(cl.value);
    });

    detector_buttons.push(btn);
    detector_ids.push(id);
    $("#properties" + parseFloat(id)).css(disabled_style);
    $("#" + 'button' + id).css({
        "background-color": "white",
        "border": "1px black solid", "width": "100%"
    });

    btn.addEventListener('click', function () {
        var k = 0;
        for (var i = 0; i < detector_buttons.length; i++) {
            if (btn == detector_buttons[i]) {
                selected = detector_ids[i];
                k = i;
            } else {
                detectors[i].active = false;
                $("#properties" + parseFloat(i)).css(disabled_style);
            }
        }
        detectors[k].active = !detectors[k].active;

        if (detectors[k].active) {
            $("#properties" + parseFloat(selected)).css({
                "width": "100%",
                "display": "block",
                "padding": "5px",
                "border-bottom": "1px solid black",
                "border-left": "1px solid black",
                "border-right": "1px solid black"
            });
            $("#delete" + parseFloat(selected)).css({ "background-color": "red", "color": "white" });
        } else {
            $("#properties" + parseFloat(selected)).css(disabled_style);
            selected = -1;
        }

    });
    var ctx = document.getElementById('chart' + id).getContext('2d');
    $('#chart' + id).css({ "position": "relative" });
    charts.push(new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: [],
            datasets: [{
                label: 'counts',
                backgroundColor: 'rgb(0, 99, 132)',
                borderColor: 'rgb(0, 99, 132)',
                data: []
            }]
        },

        // Configuration options go here
        options: { responsive: true }
    }));
    id++;
}
function updateCamera(camera) {
    if (camera.y > 89.0) {
        camera.y = 89.0;
    }
    if (camera.y < -89.0) {
        camera.y = -89.0;
    }

    camera.p.x = (camera.d * -Math.sin(camera.x * Math.PI / 180.0)
        * Math.cos(camera.y * Math.PI / 180.0) + camera.a.x);
    camera.p.y = (camera.d * -Math.sin(camera.y * Math.PI / 180.0)
        + camera.a.y);
    camera.p.z = (-camera.d * Math.cos(camera.x * Math.PI / 180.0)
        * Math.cos(camera.y * Math.PI / 180.0) + camera.a.z);

    return camera;
}

InitDemo();
