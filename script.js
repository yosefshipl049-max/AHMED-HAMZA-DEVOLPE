
const menuBtn = document.querySelector("#menuBtn");
const navbar = document.querySelector("#navbar");

menuBtn.addEventListener("click", function () {
    navbar.classList.toggle("open");

    const opened = navbar.classList.contains("open");
    menuBtn.setAttribute("aria-expanded", opened);

    menuBtn.innerHTML = opened
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});

navbar.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        navbar.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

document.querySelector("#year").textContent = new Date().getFullYear();

const backTop = document.querySelector("#backTop");
const readingProgress = document.createElement("div");
readingProgress.className = "reading-progress";
document.body.prepend(readingProgress);

window.addEventListener("scroll", function () {
    backTop.classList.toggle("visible", window.scrollY > 400);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

    readingProgress.style.width = progress + "%";
});

backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* البحث في الموضوعات */
const courseSearch = document.querySelector("#courseSearch");
const courseCards = document.querySelectorAll(".course-card");
const emptySearch = document.querySelector("#emptySearch");

courseSearch.addEventListener("input", function () {
    const value = courseSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    courseCards.forEach(function (card) {
        const text = (card.dataset.title + " " + card.innerText).toLowerCase();
        const match = text.includes(value);

        card.hidden = !match;
        if (match) visibleCount++;
    });

    emptySearch.hidden = visibleCount !== 0;
});

/* معمل وزن المعادلات */
const equations = {
    water: {
        left: [
            { formula: "H₂", atoms: { H: 2 } },
            { formula: "O₂", atoms: { O: 2 } }
        ],
        right: [{ formula: "H₂O", atoms: { H: 2, O: 1 } }],
        answer: [2, 1, 2]
    },

    ammonia: {
        left: [
            { formula: "N₂", atoms: { N: 2 } },
            { formula: "H₂", atoms: { H: 2 } }
        ],
        right: [{ formula: "NH₃", atoms: { N: 1, H: 3 } }],
        answer: [1, 3, 2]
    },

    salt: {
        left: [
            { formula: "Na", atoms: { Na: 1 } },
            { formula: "Cl₂", atoms: { Cl: 2 } }
        ],
        right: [{ formula: "NaCl", atoms: { Na: 1, Cl: 1 } }],
        answer: [2, 1, 2]
    }
};

const equationSelect = document.querySelector("#equationSelect");
const equationArea = document.querySelector("#equationArea");
const atomCounts = document.querySelector("#atomCounts");
const labFeedback = document.querySelector("#labFeedback");

let coefficients = [1, 1, 1];

function renderEquation() {
    const equation = equations[equationSelect.value];
    equationArea.innerHTML = "";

    const leftSide = equation.left;
    const rightSide = equation.right;

    leftSide.forEach(function (item, index) {
        addMolecule(item, index);

        if (index < leftSide.length - 1) {
            addOperator("+");
        }
    });

    addOperator("→");

    rightSide.forEach(function (item, index) {
        addMolecule(item, index + leftSide.length);

        if (index < rightSide.length - 1) {
            addOperator("+");
        }
    });

    updateAtomCounts();
}

function addOperator(symbol) {
    const operator = document.createElement("span");
    operator.className = symbol === "→" ? "equation-arrow" : "equation-plus";
    operator.textContent = symbol;
    equationArea.appendChild(operator);
}

function addMolecule(item, index) {
    const molecule = document.createElement("div");
    molecule.className = "molecule-input";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "20";
    input.value = coefficients[index];
    input.setAttribute("aria-label", "معامل " + item.formula);

    input.addEventListener("input", function () {
        let number = Number(input.value);

        if (!Number.isInteger(number) || number < 1) number = 1;
        if (number > 20) number = 20;

        coefficients[index] = number;
        input.value = number;

        updateAtomCounts();
        labFeedback.textContent = "عدّلت المعاملات. اضغط تحقق من الوزن.";
        labFeedback.className = "lab-feedback";
    });

    const formula = document.createElement("strong");
    formula.textContent = item.formula;

    molecule.append(input, formula);
    equationArea.appendChild(molecule);
}

function updateAtomCounts() {
    const equation = equations[equationSelect.value];
    const leftCounts = {};
    const rightCounts = {};

    equation.left.forEach(function (item, index) {
        Object.entries(item.atoms).forEach(function ([element, count]) {
            leftCounts[element] = (leftCounts[element] || 0) + count * coefficients[index];
        });
    });

    equation.right.forEach(function (item, index) {
        Object.entries(item.atoms).forEach(function ([element, count]) {
            rightCounts[element] = (rightCounts[element] || 0) + count * coefficients[index + equation.left.length];
        });
    });

    atomCounts.innerHTML = "";

    const elements = new Set([
        ...Object.keys(leftCounts),
        ...Object.keys(rightCounts)
    ]);

    elements.forEach(function (element) {
        const same = (leftCounts[element] || 0) === (rightCounts[element] || 0);

        const row = document.createElement("div");
        row.className = "atom-row" + (same ? " balanced" : "");
        row.innerHTML = `
            <strong>${element}</strong>
            <span>${leftCounts[element] || 0}</span>
            <i class="fa-solid fa-arrow-left"></i>
            <span>${rightCounts[element] || 0}</span>
        `;

        atomCounts.appendChild(row);
    });
}

equationSelect.addEventListener("change", function () {
    coefficients = [1, 1, 1];
    renderEquation();

    labFeedback.textContent = "عدّل الأرقام ثم تحقق من الوزن.";
    labFeedback.className = "lab-feedback";
});

document.querySelector("#checkEquation").addEventListener("click", function () {
    const answer = equations[equationSelect.value].answer;
    const correct = answer.every(function (value, index) {
        return coefficients[index] === value;
    });

    if (correct) {
        labFeedback.textContent = "ممتاز! المعادلة موزونة وعدد ذرات كل عنصر متساوٍ في الطرفين.";
        labFeedback.className = "lab-feedback success";
    } else {
        labFeedback.textContent = "لسه مش موزونة. راجع عدد ذرات كل عنصر وحاول تاني.";
        labFeedback.className = "lab-feedback error";
    }
});

document.querySelector("#showBalance").addEventListener("click", function () {
    coefficients = [...equations[equationSelect.value].answer];
    renderEquation();

    labFeedback.textContent = "ده الحل الموزون. غيّرنا المعاملات فقط، مش الأرقام داخل الصيغ.";
    labFeedback.className = "lab-feedback success";
});

document.querySelector("#resetEquation").addEventListener("click", function () {
    coefficients = [1, 1, 1];
    renderEquation();

    labFeedback.textContent = "بدأنا من جديد. جرّب توزن المعادلة بنفسك.";
    labFeedback.className = "lab-feedback";
});

renderEquation();

/* اختبار الكيمياء */
const quizQuestions = [
    {
        q: "ذرة عددها الذري 11 وعددها الكتلي 23. كم عدد النيوترونات؟",
        a: ["11", "12", "23", "34"],
        correct: 1,
        explain: "عدد النيوترونات = العدد الكتلي − العدد الذري = 23 − 11 = 12."
    },
    {
        q: "ليه لازم نوازن المعادلة الكيميائية؟",
        a: ["لتغيير نوع العنصر", "لتحقيق حفظ عدد ذرات كل عنصر", "لزيادة النواتج", "لتغيير الرموز"],
        correct: 1,
        explain: "الذرات لا تختفي ولا تُستحدث في التفاعل الكيميائي؛ لذلك يتساوى عدد ذرات كل عنصر في الطرفين."
    },
    {
        q: "ما مجموع ذرات الهيدروجين في 3H₂O؟",
        a: ["2", "3", "5", "6"],
        correct: 3,
        explain: "كل جزيء ماء فيه ذرتان هيدروجين، ومعامل 3 يعني 3 × 2 = 6 ذرات."
    },
    {
        q: "ذرة متعادلة تحتوي على 8 بروتونات. كم إلكترونًا فيها؟",
        a: ["4", "8", "16", "لا يمكن تحديده"],
        correct: 1,
        explain: "في الذرة المتعادلة، عدد الإلكترونات يساوي عدد البروتونات."
    },
    {
        q: "أي اختيار يعبّر عن نظيرين للعنصر نفسه؟",
        a: ["نفس البروتونات واختلاف النيوترونات", "نفس النيوترونات فقط", "رمزان مختلفان دائمًا", "نفس العدد الكتلي دائمًا"],
        correct: 0,
        explain: "النظائر لها نفس العدد الذري وتختلف في عدد النيوترونات."
    },
    {
        q: "ما الكتلة المولية التقريبية للماء H₂O؟ علمًا بأن H=1 وO=16",
        a: ["17 g/mol", "18 g/mol", "16 g/mol", "20 g/mol"],
        correct: 1,
        explain: "الكتلة المولية للماء = 2×1 + 16 = 18 g/mol."
    },
    {
        q: "في المعادلة 2H₂ + O₂ → 2H₂O، ما معامل الماء؟",
        a: ["1", "2", "3", "4"],
        correct: 1,
        explain: "المعامل هو الرقم الموجود أمام الصيغة، وهو 2 هنا."
    },
    {
        q: "إذا فقدت الذرة إلكترونًا واحدًا، فما شحنتها؟",
        a: ["سالبة 1", "موجبة 1", "متعادلة", "موجبة 2"],
        correct: 1,
        explain: "فقد إلكترون سالب يجعل الشحنة الكلية موجبة بواحد."
    },
    {
        q: "أي مما يلي يُعد تغيرًا كيميائيًا؟",
        a: ["انصهار الثلج", "تقطيع الورق", "صدأ الحديد", "تبخر الماء"],
        correct: 2,
        explain: "صدأ الحديد ينتج عنه مواد جديدة، بينما الخيارات الأخرى تغيرات فيزيائية."
    },
    {
        q: "عنصر في الدورة الثالثة والمجموعة الأولى هو:",
        a: ["الصوديوم", "الكلور", "الأكسجين", "النيون"],
        correct: 0,
        explain: "الصوديوم Na يقع في الدورة الثالثة والمجموعة الأولى."
    }
];

let questionIndex = 0;
let score = 0;
let answered = false;

const questionNumber = document.querySelector("#questionNumber");
const scoreElement = document.querySelector("#score");
const progressFill = document.querySelector("#progressFill");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const nextQuestion = document.querySelector("#nextQuestion");
const quizResult = document.querySelector("#quizResult");

function renderQuestion() {
    answered = false;

    const question = quizQuestions[questionIndex];

    questionNumber.textContent = `السؤال ${questionIndex + 1} من ${quizQuestions.length}`;
    scoreElement.textContent = score;
    progressFill.style.width = `${(questionIndex / quizQuestions.length) * 100}%`;
    questionText.textContent = question.q;
    feedback.textContent = "";
    feedback.className = "quiz-feedback";
    nextQuestion.hidden = true;
    answers.innerHTML = "";

    question.a.forEach(function (answer, index) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "answer-btn";
        button.textContent = answer;

        button.addEventListener("click", function () {
            if (answered) return;

            answered = true;
            const correct = index === question.correct;

            if (correct) {
                score += 10;
                button.classList.add("correct");
                feedback.textContent = "إجابة صحيحة! " + question.explain;
                feedback.classList.add("success");
            } else {
                button.classList.add("wrong");
                answers.children[question.correct].classList.add("correct");
                feedback.textContent = "الإجابة الصحيحة موضحة باللون الأخضر. " + question.explain;
                feedback.classList.add("error");
            }

            Array.from(answers.children).forEach(function (answerButton) {
                answerButton.disabled = true;
            });

            scoreElement.textContent = score;
            progressFill.style.width = `${((questionIndex + 1) / quizQuestions.length) * 100}%`;

            nextQuestion.hidden = false;
            nextQuestion.textContent = questionIndex === quizQuestions.length - 1
                ? "عرض النتيجة"
                : "السؤال التالي ←";
        });

        answers.appendChild(button);
    });
}

function updateProgress() {
    document.querySelector("#attemptsCount").textContent =
        localStorage.getItem("chemistryAttempts") || 0;

    document.querySelector("#bestScore").textContent =
        `${localStorage.getItem("chemistryBestScore") || 0} / 100`;

    const last = localStorage.getItem("chemistryLastScore");

    document.querySelector("#lastScore").textContent =
        last === null ? "—" : `${last} / 100`;
}

function finishQuiz() {
    document.querySelector(".quiz-top").hidden = true;
    document.querySelector(".progress-track").hidden = true;
    questionText.hidden = true;
    answers.hidden = true;
    feedback.hidden = true;
    nextQuestion.hidden = true;
    quizResult.hidden = false;

    const previousBest = Number(localStorage.getItem("chemistryBestScore") || 0);
    const attempts = Number(localStorage.getItem("chemistryAttempts") || 0) + 1;
    const best = Math.max(previousBest, score);

    localStorage.setItem("chemistryBestScore", best);
    localStorage.setItem("chemistryAttempts", attempts);
    localStorage.setItem("chemistryLastScore", score);

    document.querySelector("#resultTitle").textContent =
        score === 100 ? "ممتاز! فل مارك 🎉" :
        score >= 70 ? "شغل ممتاز!" :
        score >= 40 ? "كويس، كمل تدريب" : "دي بداية كويسة";

    document.querySelector("#resultText").textContent =
        `نتيجتك ${score} من 100. ` +
        (score >= 70
            ? "واضح إنك فاهم أجزاء كبيرة من الأساسيات."
            : "راجع التفسيرات وحاول مرة تانية عشان تثبّت المعلومات.");

    updateProgress();
}

nextQuestion.addEventListener("click", function () {
    if (questionIndex < quizQuestions.length - 1) {
        questionIndex++;
        renderQuestion();
    } else {
        finishQuiz();
    }
});

document.querySelector("#restartQuiz").addEventListener("click", function () {
    questionIndex = 0;
    score = 0;

    document.querySelector(".quiz-top").hidden = false;
    document.querySelector(".progress-track").hidden = false;
    questionText.hidden = false;
    answers.hidden = false;
    feedback.hidden = false;
    quizResult.hidden = true;

    renderQuestion();
});

document.querySelector("#resetProgress").addEventListener("click", function () {
    if (!confirm("متأكد إنك عايز تمسح سجل التقدم؟")) return;

    localStorage.removeItem("chemistryBestScore");
    localStorage.removeItem("chemistryAttempts");
    localStorage.removeItem("chemistryLastScore");

    updateProgress();
});

renderQuestion();
updateProgress();

/* نموذج التواصل */
document.querySelector("#contactForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.querySelector("#studentName").value.trim();
    const year = document.querySelector("#studentYear").value;
    const message = document.querySelector("#studentMessage").value.trim();
    const whatsappNumber = ""; // ضع رقم المدرس بصيغة دولية بدون +

    const text = `السلام عليكم، أنا ${name}، الصف الدراسي: ${year}. رسالتي: ${message}`;
    const hint = document.querySelector("#formHint");

    if (!whatsappNumber) {
        hint.textContent = "النموذج جاهز، لكن لازم تضيف رقم واتساب المدرس في الكود لتفعيل الإرسال.";
        return;
    }

    window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
        "_blank"
    );
});
