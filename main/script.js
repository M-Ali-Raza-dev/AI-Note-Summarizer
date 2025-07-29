// DOM Elements
const noteInput = document.getElementById('noteInput');
const summarizeBtn = document.getElementById('summarizeBtn');
const summaryContainer = document.getElementById('summaryContainer');
const outputActions = document.getElementById('outputActions');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const charCount = document.getElementById('charCount');
const summaryLength = document.getElementById('summaryLength');

// Stats elements
const originalWords = document.getElementById('originalWords');
const summaryWords = document.getElementById('summaryWords');
const compressionRatio = document.getElementById('compressionRatio');

// State
let currentSummary = '';
let originalText = '';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateCharCounter();
    updateStats();
});

// Event Listeners
function initializeEventListeners() {
    noteInput.addEventListener('input', handleInputChange);
    summarizeBtn.addEventListener('click', handleSummarize);
    copyBtn.addEventListener('click', handleCopy);
    downloadBtn.addEventListener('click', handleDownload);
    clearBtn.addEventListener('click', handleClear);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-resize textarea
    noteInput.addEventListener('input', autoResizeTextarea);
}

// Handle input changes
function handleInputChange() {
    updateCharCounter();
    updateStats();
    toggleSummarizeButton();
}

// Update character counter
function updateCharCounter() {
    const count = noteInput.value.length;
    charCount.textContent = count.toLocaleString();
    
    // Color coding for character count
    if (count > 5000) {
        charCount.style.color = 'var(--danger-color)';
    } else if (count > 2000) {
        charCount.style.color = 'var(--warning-color)';
    } else {
        charCount.style.color = 'var(--text-secondary)';
    }
}

// Toggle summarize button state
function toggleSummarizeButton() {
    const hasText = noteInput.value.trim().length > 0;
    summarizeBtn.disabled = !hasText;
    
    if (hasText) {
        summarizeBtn.style.opacity = '1';
        summarizeBtn.style.cursor = 'pointer';
    } else {
        summarizeBtn.style.opacity = '0.6';
        summarizeBtn.style.cursor = 'not-allowed';
    }
}

// Auto-resize textarea
function autoResizeTextarea() {
    noteInput.style.height = 'auto';
    noteInput.style.height = Math.max(200, noteInput.scrollHeight) + 'px';
}

// Handle summarization
async function handleSummarize() {
    const text = noteInput.value.trim();
    
    if (!text) {
        showToast('Please enter some text to summarize', 'error');
        return;
    }
    
    if (text.length < 50) {
        showToast('Please enter at least 50 characters for better summarization', 'warning');
        return;
    }
    
    originalText = text;
    showLoading(true);
    
    try {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
        
        const summary = generateSummary(text, summaryLength.value);
        displaySummary(summary);
        showToast('Summary generated successfully!', 'success');
        
    } catch (error) {
        console.error('Summarization error:', error);
        showToast('Failed to generate summary. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Generate summary (AI simulation)
function generateSummary(text, length) {
    // This is a simplified text summarization algorithm
    // In a real application, you would use an actual AI API
    
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
    if (sentences.length === 0) return text;
    
    // Clean sentences
    const cleanSentences = sentences.map(s => s.trim()).filter(s => s.length > 10);
    
    let summaryLength_val;
    switch (length) {
        case 'short':
            summaryLength_val = Math.min(2, Math.ceil(cleanSentences.length * 0.2));
            break;
        case 'medium':
            summaryLength_val = Math.min(5, Math.ceil(cleanSentences.length * 0.4));
            break;
        case 'long':
            summaryLength_val = Math.min(8, Math.ceil(cleanSentences.length * 0.6));
            break;
        default:
            summaryLength_val = Math.min(5, Math.ceil(cleanSentences.length * 0.4));
    }
    
    // Score sentences based on word frequency and position
    const wordFreq = calculateWordFrequency(text);
    const scoredSentences = cleanSentences.map((sentence, index) => {
        let score = 0;
        const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
        
        // Score based on word frequency
        words.forEach(word => {
            if (wordFreq[word] && word.length > 3) {
                score += wordFreq[word];
            }
        });
        
        // Boost score for sentences at beginning and end
        if (index < cleanSentences.length * 0.3) score *= 1.2;
        if (index > cleanSentences.length * 0.7) score *= 1.1;
        
        // Normalize by sentence length
        score = score / words.length;
        
        return { sentence, score, originalIndex: index };
    });
    
    // Select top sentences
    const topSentences = scoredSentences
        .sort((a, b) => b.score - a.score)
        .slice(0, summaryLength_val)
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(item => item.sentence);
    
    return topSentences.join(' ');
}

// Calculate word frequency
function calculateWordFrequency(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const freq = {};
    
    words.forEach(word => {
        if (word.length > 3) { // Ignore short words
            freq[word] = (freq[word] || 0) + 1;
        }
    });
    
    return freq;
}

// Display summary
function displaySummary(summary) {
    currentSummary = summary;
    
    summaryContainer.innerHTML = `
        <div class="summary-content">
            <p>${summary}</p>
        </div>
    `;
    
    outputActions.style.display = 'flex';
    updateStats();
    
    // Add animation
    const summaryContent = summaryContainer.querySelector('.summary-content');
    summaryContent.style.animation = 'fadeIn 0.5s ease-out';
}

// Update statistics
function updateStats() {
    const originalWordCount = countWords(originalText || noteInput.value);
    const summaryWordCount = countWords(currentSummary);
    
    originalWords.textContent = originalWordCount.toLocaleString();
    summaryWords.textContent = summaryWordCount.toLocaleString();
    
    if (originalWordCount > 0 && summaryWordCount > 0) {
        const compression = Math.round((1 - summaryWordCount / originalWordCount) * 100);
        compressionRatio.textContent = `${compression}%`;
        
        // Animate stats
        animateNumber(originalWords, originalWordCount);
        animateNumber(summaryWords, summaryWordCount);
        animateNumber(compressionRatio, compression, '%');
    } else {
        compressionRatio.textContent = '0%';
    }
}

// Count words in text
function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Animate number changes
function animateNumber(element, targetValue, suffix = '') {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString() + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Handle copy functionality
async function handleCopy() {
    if (!currentSummary) {
        showToast('No summary to copy', 'warning');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentSummary);
        showToast('Summary copied to clipboard!', 'success');
        
        // Visual feedback
        copyBtn.style.background = 'var(--success-color)';
        copyBtn.style.borderColor = 'var(--success-color)';
        setTimeout(() => {
            copyBtn.style.background = '';
            copyBtn.style.borderColor = '';
        }, 1000);
        
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentSummary;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showToast('Summary copied to clipboard!', 'success');
    }
}

// Handle download functionality
function handleDownload() {
    if (!currentSummary) {
        showToast('No summary to download', 'warning');
        return;
    }
    
    const content = `AI Note Summary\n${'='.repeat(50)}\n\nOriginal Text:\n${originalText}\n\nSummary:\n${currentSummary}\n\nGenerated on: ${new Date().toLocaleString()}\nSummary Length: ${summaryLength.value}\nCompression Ratio: ${compressionRatio.textContent}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `note-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Summary downloaded successfully!', 'success');
}

// Handle clear functionality
function handleClear() {
    if (!noteInput.value && !currentSummary) {
        showToast('Nothing to clear', 'warning');
        return;
    }
    
    // Confirmation for significant content
    if (noteInput.value.length > 100 || currentSummary) {
        if (!confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
            return;
        }
    }
    
    // Clear with animation
    noteInput.style.transition = 'opacity 0.3s ease-out';
    summaryContainer.style.transition = 'opacity 0.3s ease-out';
    
    noteInput.style.opacity = '0';
    summaryContainer.style.opacity = '0';
    
    setTimeout(() => {
        noteInput.value = '';
        currentSummary = '';
        originalText = '';
        
        summaryContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-robot"></i>
                <p>Your AI-generated summary will appear here</p>
            </div>
        `;
        
        outputActions.style.display = 'none';
        
        // Reset styles
        noteInput.style.opacity = '1';
        summaryContainer.style.opacity = '1';
        noteInput.style.height = 'auto';
        
        updateCharCounter();
        updateStats();
        toggleSummarizeButton();
        
        showToast('Content cleared successfully!', 'success');
    }, 300);
}

// Show loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.style.display = 'flex';
        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Processing...</span>
        `;
    } else {
        loadingOverlay.style.display = 'none';
        summarizeBtn.disabled = false;
        summarizeBtn.innerHTML = `
            <i class="fas fa-magic"></i>
            <span>Summarize Notes</span>
            <div class="btn-shine"></div>
        `;
        toggleSummarizeButton();
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    
    // Set toast color based on type
    switch (type) {
        case 'success':
            toast.style.background = 'var(--success-color)';
            toast.querySelector('i').className = 'fas fa-check-circle';
            break;
        case 'error':
            toast.style.background = 'var(--danger-color)';
            toast.querySelector('i').className = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            toast.style.background = 'var(--warning-color)';
            toast.querySelector('i').className = 'fas fa-exclamation-triangle';
            break;
        default:
            toast.style.background = 'var(--success-color)';
            toast.querySelector('i').className = 'fas fa-info-circle';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to summarize
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!summarizeBtn.disabled) {
            handleSummarize();
        }
    }
    
    // Ctrl/Cmd + C to copy summary (when summary is focused)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && currentSummary) {
        if (document.activeElement === summaryContainer || summaryContainer.contains(document.activeElement)) {
            event.preventDefault();
            handleCopy();
        }
    }
    
    // Ctrl/Cmd + S to download
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && currentSummary) {
        event.preventDefault();
        handleDownload();
    }
    
    // Ctrl/Cmd + Delete to clear
    if ((event.ctrlKey || event.metaKey) && event.key === 'Delete') {
        event.preventDefault();
        handleClear();
    }
    
    // Escape to close loading
    if (event.key === 'Escape') {
        showLoading(false);
    }
}

// Advanced text analysis features
function getTextComplexity(text) {
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
    const words = text.match(/\b\w+\b/g) || [];
    const avgWordsPerSentence = words.length / sentences.length || 0;
    
    // Simple complexity score based on sentence length and word variety
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
    const lexicalDiversity = uniqueWords / words.length || 0;
    
    return {
        sentences: sentences.length,
        words: words.length,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        lexicalDiversity: Math.round(lexicalDiversity * 100) / 100,
        complexity: avgWordsPerSentence > 20 ? 'High' : avgWordsPerSentence > 15 ? 'Medium' : 'Low'
    };
}

// Enhanced summary generation with better algorithms
function extractKeyPhrases(text) {
    const words = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const phrases = {};
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
        const phrase2 = words[i] + ' ' + words[i + 1];
        phrases[phrase2] = (phrases[phrase2] || 0) + 1;
        
        if (i < words.length - 2) {
            const phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
            phrases[phrase3] = (phrases[phrase3] || 0) + 1;
        }
    }
    
    // Return top phrases
    return Object.entries(phrases)
        .filter(([phrase, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([phrase]) => phrase);
}

// Improved sentence scoring
function calculateSentenceScore(sentence, wordFreq, keyPhrases, position, totalSentences) {
    const words = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    
    // Word frequency score
    words.forEach(word => {
        if (wordFreq[word] && word.length > 3) {
            score += Math.log(wordFreq[word] + 1);
        }
    });
    
    // Key phrase bonus
    keyPhrases.forEach(phrase => {
        if (sentence.toLowerCase().includes(phrase)) {
            score += 2;
        }
    });
    
    // Position importance (beginning and end are more important)
    const normalizedPosition = position / totalSentences;
    if (normalizedPosition < 0.2 || normalizedPosition > 0.8) {
        score *= 1.3;
    }
    
    // Length penalty for very short or very long sentences
    const wordCount = words.length;
    if (wordCount < 5 || wordCount > 40) {
        score *= 0.7;
    }
    
    // Normalize by sentence length
    return score / Math.sqrt(words.length);
}

// Enhanced summary generation
function generateAdvancedSummary(text, length) {
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [];
    if (sentences.length === 0) return text;
    
    const cleanSentences = sentences.map(s => s.trim()).filter(s => s.length > 10);
    const wordFreq = calculateWordFrequency(text);
    const keyPhrases = extractKeyPhrases(text);
    
    let targetSentences;
    switch (length) {
        case 'short':
            targetSentences = Math.max(1, Math.min(3, Math.ceil(cleanSentences.length * 0.15)));
            break;
        case 'medium':
            targetSentences = Math.max(2, Math.min(6, Math.ceil(cleanSentences.length * 0.35)));
            break;
        case 'long':
            targetSentences = Math.max(3, Math.min(10, Math.ceil(cleanSentences.length * 0.55)));
            break;
        default:
            targetSentences = Math.max(2, Math.min(6, Math.ceil(cleanSentences.length * 0.35)));
    }
    
    // Score all sentences
    const scoredSentences = cleanSentences.map((sentence, index) => ({
        sentence,
        score: calculateSentenceScore(sentence, wordFreq, keyPhrases, index, cleanSentences.length),
        originalIndex: index
    }));
    
    // Select best sentences while maintaining diversity
    const selectedSentences = [];
    const sortedSentences = [...scoredSentences].sort((a, b) => b.score - a.score);
    
    for (const sentenceObj of sortedSentences) {
        if (selectedSentences.length >= targetSentences) break;
        
        // Check for diversity (avoid very similar sentences)
        const isDiverse = selectedSentences.every(selected => {
            const similarity = calculateSimilarity(sentenceObj.sentence, selected.sentence);
            return similarity < 0.7;
        });
        
        if (isDiverse) {
            selectedSentences.push(sentenceObj);
        }
    }
    
    // Sort by original order and join
    return selectedSentences
        .sort((a, b) => a.originalIndex - b.originalIndex)
        .map(obj => obj.sentence)
        .join(' ');
}

// Calculate sentence similarity (simple word overlap)
function calculateSimilarity(sentence1, sentence2) {
    const words1 = new Set(sentence1.toLowerCase().match(/\b\w+\b/g) || []);
    const words2 = new Set(sentence2.toLowerCase().match(/\b\w+\b/g) || []);
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

// Initialize tooltips and help text
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = event.target.getAttribute('data-tooltip');
    
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Performance monitoring
function trackUsage() {
    const usage = {
        summarizationsCount: parseInt(sessionStorage.getItem('summarizations') || '0'),
        totalCharactersProcessed: parseInt(sessionStorage.getItem('totalChars') || '0'),
        averageCompressionRatio: parseFloat(sessionStorage.getItem('avgCompression') || '0')
    };
    
    return usage;
}

function updateUsageStats(originalLength, summaryLength) {
    const current = trackUsage();
    current.summarizationsCount++;
    current.totalCharactersProcessed += originalLength;
    
    const compressionRatio = (1 - summaryLength / originalLength) * 100;
    current.averageCompressionRatio = (current.averageCompressionRatio * (current.summarizationsCount - 1) + compressionRatio) / current.summarizationsCount;
    
    sessionStorage.setItem('summarizations', current.summarizationsCount.toString());
    sessionStorage.setItem('totalChars', current.totalCharactersProcessed.toString());
    sessionStorage.setItem('avgCompression', current.averageCompressionRatio.toString());
}

// Export functionality
function exportSummaryAsJSON() {
    const data = {
        originalText: originalText,
        summary: currentSummary,
        metadata: {
            summaryLength: summaryLength.value,
            originalWordCount: countWords(originalText),
            summaryWordCount: countWords(currentSummary),
            compressionRatio: compressionRatio.textContent,
            generatedAt: new Date().toISOString(),
            textComplexity: getTextComplexity(originalText)
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `note-summary-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Initialize advanced features
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    
    // Add advanced export option (right-click on download button)
    downloadBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (currentSummary) {
            exportSummaryAsJSON();
            showToast('Data exported as JSON!', 'success');
        }
    });
});