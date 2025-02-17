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

    video.elt.onloadeddata = () => {
        console.log("Video geladen, starte Handpose-Erkennung...");
        detect();
    };

    // // Rechtecke starten in der Mitte und fliegen in zufällige Richtungen
    // for (let i = 0; i < 20; i++) {
    //     let angle = random(TWO_PI);  // Zufälliger Winkel
    //     rectangles.push({
    //         x: width / 2,
    //         y: height / 2,
    //         w: random(20, 50),
    //         h: random(20, 50),
    //         speed: random(2, 5),
    //         dirX: cos(angle), // Zufällige Richtung
    //         dirY: sin(angle)  
    //     });
    // }
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
        }
    }
    moveRectangles();
    drawRectangles();
    spawnNewRectangles();  // Ständig neue Rechtecke erzeugen
}

function moveRectangles() {
    for (let i = rectangles.length - 1; i >= 0; i--) {  // `let i` hinzufügen
        let box = rectangles[i];
        
        if (pose === "one") {
            // Rechtecke bleiben stehen
        } else if (pose === "two") {
           // Mehr horizontale Bewegung, weniger vertikale Bewegung
           box.x += box.dirX * box.speed * 1.5;  // Stärker nach links/rechts
           box.y += box.dirY * box.speed * 0.3;  // Weniger nach oben/unten
        } else {
            // Standard-Bewegung (gleichmäßig nach außen)
            box.x += box.dirX * box.speed;
            box.y += box.dirY * box.speed;
        }
        // Entferne Rechtecke, wenn sie aus dem Bild fliegen
        if (box.x < -50 || box.x > width + 50 || box.y < -50 || box.y > height + 50) {
            rectangles.splice(i, 1);
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

// Funktion, um neue Rechtecke zu erzeugen
function spawnNewRectangles() {
    if (frameCount % 10 === 0) {  // Alle 10 Frames ein neues Rechteck
        let angle = random(TWO_PI);
        rectangles.push({
            x: width / 2,
            y: height / 2,
            w: random(20, 50),
            h: random(20, 50),
            speed: random(2, 5),
            dirX: cos(angle),
            dirY: sin(angle)
        });
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
