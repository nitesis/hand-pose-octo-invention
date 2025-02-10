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
    // Eine einfache Logik zur Bestimmung der Pose
    // Zum Beispiel: Überprüfe die Position von Handgelenk und Finger
    if (landmarks[0][0] < width / 2) {
        return "one";  // Pose "one" wenn Hand links
    } else {
        return "two";  // Pose "two" wenn Hand rechts
    }
}
