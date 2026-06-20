package com.studyassistant.ai.service;

import com.studyassistant.ai.dto.request.ExplainRequest;
import com.studyassistant.ai.dto.request.FlashcardRequest;
import com.studyassistant.ai.dto.request.QuizRequest;
import com.studyassistant.ai.dto.request.SummaryRequest;
import com.studyassistant.ai.dto.response.ExplainResponse;
import com.studyassistant.ai.dto.response.FlashcardResponse;
import com.studyassistant.ai.dto.response.FlashcardsResultResponse;
import com.studyassistant.ai.dto.response.QuizQuestionResponse;
import com.studyassistant.ai.dto.response.QuizResponse;
import com.studyassistant.ai.dto.response.SummaryResponse;

import com.studyassistant.ai.dto.request.StudyPlanRequest;
import com.studyassistant.ai.dto.response.StudyPlanDayResponse;
import com.studyassistant.ai.dto.response.StudyPlanResponse;
import com.studyassistant.ai.dto.request.ChatRequest;
import com.studyassistant.ai.dto.response.ChatResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service("mockAIService")
public class MockAIService implements AIService {

    @Override
    public SummaryResponse generateSummary(SummaryRequest request) {
        String content = request.getContent().trim();
        String tone = request.getTone() != null ? request.getTone() : "concise";

        int originalWordCount = countWords(content);
        String summary = buildMockSummary(content, tone);
        int summaryWordCount = countWords(summary);
        String generatedAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        return new SummaryResponse(summary, originalWordCount, summaryWordCount, tone, generatedAt);
    }

    @Override
    public QuizResponse generateQuiz(QuizRequest request) {
        String content = request.getContent().trim();
        String difficulty = request.getDifficulty() != null
                ? request.getDifficulty().toLowerCase()
                : "medium";

        int count = Math.max(1, Math.min(request.getNumberOfQuestions(), 10));
        List<QuizQuestionResponse> pool = buildQuestionPool(content, difficulty);

        List<QuizQuestionResponse> selectedQuestions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            selectedQuestions.add(pool.get(i % pool.size()));
        }

        return new QuizResponse(selectedQuestions, difficulty);
    }

    @Override
    public FlashcardsResultResponse generateFlashcards(FlashcardRequest request) {
        String content = request.getContent().trim();
        List<FlashcardResponse> flashcards = buildFlashcards(content);
        return new FlashcardsResultResponse(flashcards);
    }

    @Override
    public ExplainResponse explainTopic(ExplainRequest request) {
        String topic = request.getTopic().trim();
        String level = request.getLevel() != null
                ? request.getLevel().toLowerCase()
                : "beginner";

        String explanation = buildExplanation(topic, level);

        return new ExplainResponse(topic, level, explanation, LocalDateTime.now());
    }

    private String buildExplanation(String topic, String level) {
        switch (level) {
            case "advanced":
                return "Advanced Explanation of " + topic + ":\n\n"
                        + topic + " is a complex concept that can be understood by studying its structure, principles, real-world applications, and limitations. "
                        + "At an advanced level, focus on how it works internally, how it interacts with related systems, and what trade-offs are involved.\n\n"
                        + "Key areas to study:\n"
                        + "1. Core architecture and internal working\n"
                        + "2. Performance and scalability\n"
                        + "3. Real-world use cases\n"
                        + "4. Common mistakes and limitations\n\n"
                        + "Advanced learners should compare " + topic + " with similar concepts and apply it in practical projects.";

            case "intermediate":
                return "Intermediate Explanation of " + topic + ":\n\n"
                        + topic + " is an important concept that builds on basic understanding and introduces practical usage. "
                        + "At this level, you should understand not only what it means, but also how and why it is used.\n\n"
                        + "Important points:\n"
                        + "- Understand the main definition\n"
                        + "- Learn how it works step by step\n"
                        + "- Study examples\n"
                        + "- Practice applying it in small problems\n\n"
                        + "This helps you connect theory with practical implementation.";

            case "beginner":
            default:
                return "Beginner Explanation of " + topic + ":\n\n"
                        + topic + " is a concept that helps us understand a topic in a simple way. "
                        + "Think of it as a basic idea that you should first understand clearly before going deeper.\n\n"
                        + "Simple way to study it:\n"
                        + "- Learn the meaning\n"
                        + "- Understand why it is useful\n"
                        + "- Look at one simple example\n"
                        + "- Revise it in your own words\n\n"
                        + "Once the basics are clear, you can move to more detailed and technical explanations.";
        }
    }

    private String buildMockSummary(String content, String tone) {
        String[] sentences = content.split("(?<=[.!?])\\s+");
        int total = sentences.length;

        switch (tone.toLowerCase()) {
            case "bullet-points":
                StringBuilder bullets = new StringBuilder("Key Points:\n");
                for (int i = 0; i < total; i += Math.max(1, total / 5)) {
                    bullets.append("• ").append(sentences[i].trim()).append("\n");
                }
                return bullets.toString().trim();

            case "detailed":
                int detailedCount = Math.max(2, (int) (total * 0.6));
                return Arrays.stream(sentences)
                        .limit(detailedCount)
                        .collect(Collectors.joining(" "))
                        + "\n\n[This content covers multiple concepts. Review each section carefully.]";

            case "concise":
            default:
                int conciseCount = Math.max(2, (int) (total * 0.3));
                List<String> picked = Arrays.stream(sentences)
                        .limit(conciseCount)
                        .collect(Collectors.toList());

                return "Summary: " + String.join(" ", picked)
                        + (total > 4 ? " [+" + (total - conciseCount) + " more points in original]" : "");
        }
    }

    private List<QuizQuestionResponse> buildQuestionPool(String content, String difficulty) {
        List<QuizQuestionResponse> questions = new ArrayList<>();
        String keyword = extractKeyword(content);
        int wordCount = countWords(content);

        questions.add(new QuizQuestionResponse(
                "What is the main purpose of the provided study content?",
                List.of("To explain important concepts related to the topic", "To provide unrelated entertainment content", "To list random words without meaning", "To avoid learning the subject"),
                "To explain important concepts related to the topic",
                "The content contains study material, so its purpose is to explain and help understand key concepts."
        ));

        questions.add(new QuizQuestionResponse(
                "Which term appears to be important in this content?",
                List.of(keyword, "Television", "Cooking", "Sports"),
                keyword,
                "The term \"" + keyword + "\" was extracted from the submitted study material."
        ));

        questions.add(new QuizQuestionResponse(
                "What is the best way to study this content?",
                List.of("Break it into smaller points and revise actively", "Read once and never revise", "Skip difficult parts", "Memorize without understanding"),
                "Break it into smaller points and revise actively",
                "Active revision and breaking content into smaller parts improves understanding and retention."
        ));

        questions.add(new QuizQuestionResponse(
                "Approximately how many words are present in the submitted content?",
                List.of(String.valueOf(wordCount), String.valueOf(wordCount + 100), String.valueOf(Math.max(1, wordCount - 50)), "0"),
                String.valueOf(wordCount),
                "The word count is calculated from the content submitted by the user."
        ));

        questions.add(new QuizQuestionResponse(
                "For " + difficulty + " difficulty, what should the learner focus on?",
                List.of("Understanding the concept clearly", "Ignoring explanations", "Only copying notes", "Avoiding practice"),
                "Understanding the concept clearly",
                "Regardless of difficulty, concept clarity is the most important part of learning."
        ));

        return questions;
    }

    private List<FlashcardResponse> buildFlashcards(String content) {
        List<FlashcardResponse> cards = new ArrayList<>();

        String keyword = extractKeyword(content);
        int wordCount = countWords(content);

        cards.add(new FlashcardResponse("What is the main concept in this study material?", "The main concept is related to \"" + keyword + "\"."));
        cards.add(new FlashcardResponse("How can you define \"" + keyword + "\"?", "\"" + keyword + "\" is a key idea from the study material."));
        cards.add(new FlashcardResponse("What is the best way to study this topic?", "Break the content into smaller points and revise actively."));
        cards.add(new FlashcardResponse("How many words are present?", "The submitted content contains approximately " + wordCount + " words."));
        cards.add(new FlashcardResponse("Why is active recall useful?", "It helps you remember concepts by retrieving information without looking at notes."));
        cards.add(new FlashcardResponse("Which technique improves long-term memory?", "Spaced repetition improves long-term memory."));
        cards.add(new FlashcardResponse("What should you do after reading?", "Summarize the key ideas in your own words."));
        cards.add(new FlashcardResponse("How should difficult concepts be handled?", "Break them into simpler parts and connect them with examples."));
        cards.add(new FlashcardResponse("What is a good exam strategy?", "Practice questions and review mistakes."));
        cards.add(new FlashcardResponse("Final takeaway?", "Understanding clearly is better than memorizing without context."));

        return cards;
    }

    private String extractKeyword(String content) {
        if (content == null || content.isBlank()) {
            return "Concept";
        }

        String[] words = content.trim().split("\\s+");

        for (String word : words) {
            String clean = word.replaceAll("[^a-zA-Z]", "");
            if (clean.length() > 5) {
                return clean;
            }
        }

        return words[0].replaceAll("[^a-zA-Z]", "");
    }

    private int countWords(String text) {
        if (text == null || text.isBlank()) return 0;
        return text.trim().split("\\s+").length;
    }

    @Override
        public StudyPlanResponse generateStudyPlan(StudyPlanRequest request) {

    String topic = request.getTopic();
    int daysAvailable = request.getDaysAvailable();
    int hoursPerDay = request.getHoursPerDay();

    List<StudyPlanDayResponse> plan = new ArrayList<>();

    for (int day = 1; day <= daysAvailable; day++) {

        List<String> tasks = new ArrayList<>();

        if (day == 1) {
            tasks.add("Introduction to " + topic);
            tasks.add("Understand fundamentals");
            tasks.add("Create short notes");
        } else if (day < daysAvailable) {
            tasks.add("Study advanced concepts of " + topic);
            tasks.add("Practice examples");
            tasks.add("Review previous topics");
        } else {
            tasks.add("Final revision");
            tasks.add("Practice quiz");
            tasks.add("Self assessment");
        }

        plan.add(
            new StudyPlanDayResponse(
                day,
                "Day " + day + " - " + topic,
                tasks,
                hoursPerDay
            )
        );
        }

        return new StudyPlanResponse(
                topic,
                daysAvailable,
                hoursPerDay,
                plan,
                LocalDateTime.now()
                );
        }

        @Override
        public ChatResponse chat(ChatRequest request) {
    String userMessage = request.getMessage().trim();
    String aiResponse = buildChatReply(userMessage.toLowerCase());

    return new ChatResponse(userMessage, aiResponse, LocalDateTime.now());
    }

    private String buildChatReply(String message) {

    if (message.contains("java")) {
        return "Java is an object-oriented programming language used for backend, Android, and enterprise applications. Key topics include OOP, collections, exception handling, streams, multithreading, and JDBC.";
    }

    if (message.contains("spring boot") || message.contains("spring")) {
        return "Spring Boot is a Java framework used to build REST APIs and backend applications quickly. Important concepts include controllers, services, repositories, dependency injection, JPA, Spring Security, and configuration.";
    }

    if (message.contains("react")) {
        return "React is a frontend JavaScript library used to build user interfaces. Important concepts include components, props, state, hooks, routing, context, and API integration using Axios.";
    }

    if (message.contains("sql") || message.contains("mysql") || message.contains("database")) {
        return "SQL is used to store, query, and manage relational data. Key concepts include tables, primary keys, foreign keys, joins, indexes, normalization, transactions, and CRUD operations.";
    }

    if (message.contains("jwt") || message.contains("token") || message.contains("auth")) {
        return "JWT authentication works by generating a signed token after login. The frontend sends this token in the Authorization header as Bearer token. The backend validates it before allowing access to protected APIs.";
    }

    if (message.contains("interview") || message.contains("prepare")) {
        return "For interview preparation, focus on Core Java, SQL, Spring Boot, REST APIs, JWT, React basics, Git, Postman, and your project explanation. Practice explaining your AI Study Assistant clearly.";
    }

    if (message.contains("api") || message.contains("rest")) {
        return "A REST API allows frontend and backend to communicate using HTTP methods like GET, POST, PUT, and DELETE. Good APIs use proper status codes, validation, security, and clean JSON responses.";
    }

    if (message.contains("git") || message.contains("github")) {
        return "Git is used for version control and GitHub is used to host repositories online. Common commands are git status, git add ., git commit -m, git push, git pull, and git branch.";
    }

    return "I am your AI Study Assistant. You can ask me about Java, Spring Boot, React, SQL, JWT, REST APIs, Git, interview preparation, or your AI Study Assistant project.";
    }
}