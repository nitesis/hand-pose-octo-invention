let model;
let video;
let predictions = [];
let rectangles = [];
let pose = "none";
let poseConfidence = 0;  // Stelle sicher, dass poseConfidence initialisiert wird
// let mainCanvas;
// let leftCanvas;
// let rightCanvas;

// Function for first canvas
async function sketch1(p) {
    p.setup = function () {
      console.log("Sketch 1 läuft!");
      let cnv1 = p.createCanvas(640, 480);
      cnv1.parent("canvas1");
      p.background(0);
    };
    // p.draw = function () {
    //   p.circle(p.mouseX, p.mouseY, 50);
    // };

    // Funktion, die die Rechtecke zeichnet
    p.draw = function () {
        p.background(255); // Hintergrund regelmäßig aktualisieren
        moveRectangles();
        drawRectangles(p);
        spawnNewRectangles();  // Ständig neue Rechtecke erzeugen
        displayPoseConfidence();  // Zeigt die Wahrscheinlichkeit an
    };
}
  
// Run first p5 instance
new p5(sketch1);

async function sketch2(p) {
    p.setup = function () {
        // Video nur einmal erstellen
        if (!video) {
            video = p.createCapture(p.VIDEO);
            video.size(640, 480);
            video.parent("canvas2"); // Video direkt in #canvas2 platzieren
        }
    };

    p.draw = function () {
        // Hier nichts zeichnen, weil kein zusätzliches Canvas erzeugt wird
    };

    // Lade das Handpose-Modell
    model = await handpose.load('my_model/model.json');
    detect();

    video.elt.onloadeddata = () => {
        console.log("Video geladen, starte Handpose-Erkennung...");
        detect();
    };
}

// // Function for second canvas
// async function sketch2(p) {
//     p.setup = function () {
//         let cnv2 = p.createCanvas(640, 480);
//         cnv2.parent("canvas2");
        
//         // Webcam-Video laden
//         video = p.createCapture(p.VIDEO);
//         video.size(640, 480);
//         video.parent("canvas2");  // Weise das Video explizit canvas2 zu (soll kleines Canvas verhindern :-/)
//         video.hide(); // Verstecke das HTML-Element, da wir es manuell zeichnen

//         p.background(255);
//     };
//     p.draw = function () {
//         p.image(video, 0, 0, p.width, p.height); // Video auf Canvas zeichnen
//         // p.fill(255, 0, 0, 100);
//         p.noStroke();
//         // p.square(p.mouseX, p.mouseY, 50);
//     };

//    // Lade das Handpose-Modell
//     model = await handpose.load('my_model/model.json');
//     detect();

//     video.elt.onloadeddata = () => {
//         console.log("Video geladen, starte Handpose-Erkennung...");
//         detect();
//     };
// }

// Start second p5 instance with webcam
new p5(sketch2);

async function detect() {
    if (video.elt.readyState === 4) {  // Prüfe, ob das Video bereit ist
        let hands = await model.estimateHands(video.elt);
        
        if (hands.length > 0) {
            let hand = hands[0];
            let landmarks = hand.landmarks;

            pose = getPose(landmarks);
            poseConfidence = hand.handInViewConfidence;  // Modell-Confidence speichern
        } else {
            pose = "none";
            poseConfidence = 0;
        }
    }
    requestAnimationFrame(detect);
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
    displayPoseConfidence();  // Zeigt die Wahrscheinlichkeit an
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

function drawRectangles(p) { // p als Parameter hinzufügen
    // fill(255, 0, 0);
    // noStroke();
    noFill();  // Entfernt die Füllung
    stroke(0); // Setzt die Farbe des Randes auf schwarz
    strokeWeight(2); // Setzt die Strichstärke auf 3 (kann angepasst werden)
    for (let box of rectangles) {
        p.rectMode(p.CENTER);
        p.rect(box.x, box.y, box.w, box.h);
    }
}

// function drawRectangles() {
//     // fill(255, 0, 0);
//     // noStroke();
//     noFill();  // Entfernt die Füllung
//     stroke(0); // Setzt die Farbe des Randes auf schwarz
//     strokeWeight(2); // Setzt die Strichstärke auf 3 (kann angepasst werden)


//     for (let box of rectangles) {
//         rectMode(CENTER);
//         rect(box.x, box.y, box.w, box.h);
//     }
// }

// Funktion, um neue Rechtecke zu erzeugen
function spawnNewRectangles() {
    if (frameCount % 1 === 0) {  // Jeden Frames ein neues Rechteck
        let angle = random(TWO_PI);
        rectangles.push({
            x: width / 2,
            y: height / 2,
            w: random(20, 50),
            h: random(20, 50),
            speed: random(5, 10), // Geschwindigkeit der Rechtecke
            dirX: cos(angle),
            dirY: sin(angle)
        });
    }
}

function displayPoseConfidence() {
    // Aktualisiere das HTML-Element mit der Pose und der Wahrscheinlichkeit
    let poseConfidenceText = `Pose: ${pose} (${(poseConfidence * 100).toFixed(1)}%)`;
    document.getElementById('pose-confidence').textContent = poseConfidenceText;
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