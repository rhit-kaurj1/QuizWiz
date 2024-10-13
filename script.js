
const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;
let questions = []; // This will hold the questions from the API

/**
 * Fetches questions from the Open Trivia Database API.
 */
async function fetchQuestions(retryCount = 0) {
    try {
        const response = await fetch('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple');

        if (!response.ok) { 
            throw new Error('Failed to fetch questions.');
        }

        const data = await response.json();
        questions = data.results.map(q => ({
            question: decodeHTML(q.question), // Decode HTML entities in question
            answers: shuffleArray([
                { text: decodeHTML(q.correct_answer), correct: true }, 
                ...q.incorrect_answers.map(ans => ({ text: decodeHTML(ans), correct: false }))
            ])
        }));
        startQuiz(); // Start the quiz after questions are fetched
    } catch (error) {
        console.error(error);
        alert('Could not load questions. Please try again later.'); 
    }
}

/**
 * Shuffles an array in place.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

/**
 * Decodes any HTML entities in a string.
 * @param {string} html - The string containing HTML entities.
 * @returns {string} The decoded string.
 */
function decodeHTML(html) {
    const text = document.createElement('textarea');
    text.innerHTML = html;
    return text.value;
}

/**
 * Initializes and starts the quiz.
 */
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Next";
    showQuestion();
}

/**
 * Displays the current question and its possible answers.
 */
function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButtons.appendChild(button);

        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", selectAnswer);
    });
}

/**
 * Resets the state of the quiz for the next question.
 */
function resetState() {
    nextButton.style.display = "none";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

/**
 * Handles the user's answer selection.
 * @param {Event} e - The click event triggered by selecting an answer.
 */
function selectAnswer(e) {
    const selectedBtn = e.target;
    const isCorrect = selectedBtn.dataset.correct == "true";
    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
    } else {
        selectedBtn.classList.add("incorrect");
    }

    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct == "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });
    nextButton.style.display = "block"; // Show the next button
}

/**
 * Displays the user's score at the end of the quiz.
 */
function showScore() {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    nextButton.style.display = "block"; // Show the play again button
}

/**
 * Handles the click event for the next button.
 */
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(); // Show next question
    } else {
        showScore(); // Show score at the end
    }
}

// Add event listener for the next button
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        fetchQuestions(); // Fetch new questions when restarting the quiz
    }
});

// Fetch questions and start the quiz when the page loads
fetchQuestions();



/**
 * Tests if the decodeHTML function works correctly.
 */
function testDecodeHTML() {
    console.assert(decodeHTML('&lt;script&gt;') === '<script>', "decodeHTML should convert &lt;script&gt; to <script>");
    console.assert(decodeHTML('&quot;Hello&quot;') === '"Hello"', "decodeHTML should convert &quot;Hello&quot; to \"Hello\"");
    console.assert(decodeHTML('&amp;') === '&', "decodeHTML should convert &amp; to &");
    console.log("All decodeHTML tests passed.");
}

/**
 * Tests if questions can be fetched from the API.
 */
function testFetchQuestions() {
    fetch('https://opentdb.com/api.php?amount=1&type=multiple')
        .then(response => {
            console.assert(response.ok, "API call should be successful.");
            console.log("API call test passed."); 
        })
        .catch(error => {
            console.error("API call failed:", error);
        });
}

/**
 * Tests if selecting answers updates the score correctly.
 */
function testSelectAnswer() {
    const correctButton = document.createElement("button");
    correctButton.dataset.correct = "true"; 
    const incorrectButton = document.createElement("button");
    incorrectButton.dataset.correct = "false";

    selectAnswer({ target: correctButton });
    console.assert(score === 1, "Score should increase to 1 for correct answer."); 

    selectAnswer({ target: incorrectButton });
    console.assert(score === 1, "Score should remain 1 for incorrect answer.");

    console.log("All selectAnswer tests passed.");
}

// Run all the tests
testDecodeHTML();
testFetchQuestions();
testSelectAnswer();