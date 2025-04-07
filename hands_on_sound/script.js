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

    // Draw all the tracked hand points
    for (let i = 0; i < hands.length; i++) {
        let hand = hands[i];

        for (let j = 0; j < hand.keypoints.length; j++) {
            let keypoint = hand.keypoints[j];

            if (hand.keypoints[j].name === "index_finger_tip") {
                fill (255);
                circle(keypoint.x, keypoint.y, 20);
                playSound(keypoint.x, keypoint.y);
            } else {
                fill(234, 125, 255, 200);
                noStroke();
                circle(keypoint.x, keypoint.y, 10);
            }
        }
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