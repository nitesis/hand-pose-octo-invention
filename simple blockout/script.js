let handPose;
let video;
let hands = [];
let osc; // Oscillator for sound
let soundEnabled = false;
let notes = [
            261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, // Octave 1 (C4 - C5)
            523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, // Octave 2 (C5 - C6)
            1046.50, 1174.66, 1318.51, 1396.91, 1567.98, 1760.00, 1975.53, 2093.00 // Octave 3 (C6 - C7)
];

let prevIndexX = null; // Neue globale Variable für die vorherige Position des Zeigefingers
let showText = false; // Zustand, ob der Text angezeigt werden soll
let startX = null; // Startposition der Bewegung
let totalDistance = 0; // Gesamte zurückgelegte Distanz
const minDistance = 50; // Mindestdistanz für die Textanzeige (in Pixeln)

function preload() {
    // Load the handpose model
    handPose = ml5.handPose({ flipHorizontal: true });
}

function setup() {
    createCanvas(640, 480);

    // Create a video capture from the webcam and hide it
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();

    // Start the detection of hands from  the webcam
    handPose.detectStart(video, gotHands);

    // Sound setup
    osc = new p5.Oscillator('sine');
    osc.amp(0); // Mute initially
    
    document.getElementById("soundButton").addEventListener("click", toggleSound);
}

function toggleSound() {
    if (!soundEnabled) {
        soundEnabled = true;
        osc.start();
        document.getElementById("soundButton").innerText = "Disable Sound";
    } else {
        soundEnabled = false;
        osc.stop();
        document.getElementById("soundButton").innerText = "Enable Sound";
    }
}

// Callback function when hands are detected
function gotHands(results) {
    // Save the results in the hands array
    hands = results;
}

function draw() {
    // Mirror the video horizontally
    push(); // Save the current state of the drawing
    translate(width, 0); // Move the origin to the right edge of the canvas
    scale(-1, 1); // Invert the x-axis
    image(video, 0, 0, width, height); // Draw the video
    pop(); // Restore the previous state of the drawing

    let displayText = ""; // Variable für den anzuzeigenden Text

    // Draw all the tracked hand points
    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];

        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];

            if (hand.keypoints[j].name === "index_finger_tip") {
                fill (255);
                circle(keypoint.x, keypoint.y, 20);

                // Bewegungslogik für den Zeigefinger
                if (prevIndexX !== null) {
                    let deltaX = keypoint.x - prevIndexX;

                    // Wenn Bewegung nach rechts (deltaX > 0)
                    if (deltaX > 0) {
                        if (startX === null) {
                            startX = prevIndexX; // Startposition festlegen
                        }
                        totalDistance = keypoint.x - startX; // Gesamtdistanz berechnen

                        // Text anzeigen, wenn Mindestdistanz erreicht
                        if (totalDistance >= minDistance) {
                            showText = true;
                        }
                    } else {
                        // Bewegung in andere Richtung: Zurücksetzen
                        startX = null;
                        totalDistance = 0;
                    }
                }
                prevIndexX = keypoint.x; // Aktuelle Position speichern

                playSound(keypoint.x, keypoint.y); // Sound bleibt erhalten
            } else {
                fill(234, 125, 255, 200);
                noStroke();
                circle(keypoint.x, keypoint.y, 10);
            }
        }
    }

    // // Text auf dem Canvas anzeigen
    // if (displayText !== "") {
    // Text dauerhaft anzeigen, sobald showText true ist
    // if (showText) {

    // Text anzeigen: Entweder temporär (bei Bewegung) oder dauerhaft (wenn showText true ist)
    // if (showText) {
    //     fill(255);
    //     textSize(32);
    //     textAlign(CENTER, CENTER);
    //     text("From left to right", width / 2, height / 2);
    // }
    // Text mit schwarzem Hintergrund anzeigen, sobald showText true ist
    if (showText) {
        textSize(32);
        textAlign(CENTER, CENTER);
        
        // Schwarzes Rechteck als Hintergrund
        let textStr = "From left to right";
        let textW = textWidth(textStr); // Breite des Textes
        let textH = textSize(); // Höhe des Textes (basierend auf textSize)
        let padding = 10; // Abstand um den Text herum
        
        fill(0); // Schwarz
        rectMode(CENTER);
        rect(width / 2, height / 2, textW + padding * 2, textH + padding * 2);

        // Weißer Text darüber
        fill(255); // Weiß
        text(textStr, width / 2, height / 2);
    }
}

function playSound(x, y) {
    let mappedFreq = map(x, 0, width, 0, notes.length - 1);
    let noteIndex = floor(mappedFreq);
    let frequency = notes[noteIndex];

    let mappedVolume = map(y, 0, height, 1, 0);

    osc.freq(frequency);
    osc.amp(mappedVolume, 0.1);
}