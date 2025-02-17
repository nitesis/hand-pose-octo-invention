let model;
let video;
let predictions = [];
let rectangles = [];
let pose = "none";

async function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // Lade das Handpose-Modell
    model = await handpose.load('my_model/model.json');
    detect();

    // Erzeuge zufällige Rechtecke
    for (let i = 0; i < 20; i++) {
        rectangles.push({
            x: random(width),
            y: random(height),
            w: random(20, 50),
            h: random(20, 50),
            speed: random(2, 5)
        });
    }
}

async function detect() {
    if (video.elt.readyState === 4) {  // Prüfe, ob das Video bereit ist
        predictions = await model.estimateHands(video.elt);
    }
    requestAnimationFrame(detect);  // Ständige Aktualisierung
}
function draw() {
    video.loadPixels();  // Aktualisiere das Videobild
    image(video, 0, 0);  // Zeige das Video

    if (predictions.length > 0) {
        let hand = predictions[0];

        if (hand.landmarks.length > 0) {
            let pose = getPose(hand.landmarks);  // Bestimme die Pose (1 oder 2)

            // if (pose === "one") {
            //     background(0, 0, 255);  // Blau bei Pose "one"
            // } else if (pose === "two") {
            //     background(255, 0, 0);  // Rot bei Pose "two"
            // }
        }
    }
    moveRectangles();
    drawRectangles();
}

function moveRectangles() {
    for (let rect of rectangles) {
        if (pose === "one") {
            // Rechtecke bleiben stehen
        } else if (pose === "two") {
            // Bewegung von der Mitte zu den Rändern
            rect.x += rect.x > width / 2 ? rect.speed : -rect.speed;
        } else {
            // Standard: zufliegende Bewegung
            rect.x += (width / 2 - rect.x) * 0.05;
            rect.y += (height / 2 - rect.y) * 0.05;
        }
    }
}

function drawRectangles() {
    fill(255, 0, 0);
    noStroke();
    for (let box of rectangles) {
        rectMode(CENTER);
        rect(box.x, box.y, box.w, box.h);
    }
}


function getPose(landmarks) {
    let raisedFingers = 0;

    // Überprüfe, ob der Zeigefinger gehoben ist
    if (landmarks[8][1] < landmarks[6][1]) { // Zeigefinger Spitze ist höher als Mittelgelenk
        raisedFingers++;
    }

    // Überprüfe, ob der Mittelfinger gehoben ist
    if (landmarks[12][1] < landmarks[10][1]) { // Mittelfinger Spitze ist höher als Mittelgelenk
        raisedFingers++;
    }

    // Bestimme die Pose basierend auf der Anzahl der gehobenen Finger
    if (raisedFingers === 1) {
        return "one";  // Zeigefinger ist gehoben (Pose "one")
    } else if (raisedFingers === 2) {
        return "two";  // Zeige- und Mittelfinger sind gehoben (Pose "two")
    } else {
        return "none";  // Keine Pose oder andere Pose
    }
}
