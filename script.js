let model;
let video;
let predictions = [];

async function setup() {
    createCanvas(640, 480);
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();

    // Lade das Handpose-Modell
    model = await handpose.load('my_model/model.json');
    detect();
}

async function detect() {
    predictions = await model.estimateHands(video.elt);  // Schätze die Handpose
    requestAnimationFrame(detect);  // Ständige Aktualisierung
}

function draw() {
    image(video, 0, 0);  // Zeige das Video

    if (predictions.length > 0) {
        let hand = predictions[0];

        if (hand.landmarks.length > 0) {
            let pose = getPose(hand.landmarks);  // Bestimme die Pose (1 oder 2)

            if (pose === "one") {
                background(0, 0, 255);  // Blau bei Pose "one"
            } else if (pose === "two") {
                background(255, 0, 0);  // Rot bei Pose "two"
            }
        }
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


// function getPose(landmarks) {
//     // Eine einfache Logik zur Bestimmung der Pose
//     // Zum Beispiel: Überprüfe die Position von Handgelenk und Finger
//     if (landmarks[0][0] < width / 2) {
//         return "one";  // Pose "one" wenn Hand links
//     } else {
//         return "two";  // Pose "two" wenn Hand rechts
//     }
// }
