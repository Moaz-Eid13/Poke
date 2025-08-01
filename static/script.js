// Poke Programming Language Web Interface
class PokeIDE {
    constructor() {
        this.codeEditor = document.getElementById('codeEditor');
        this.output = document.getElementById('output');
        this.runBtn = document.getElementById('runBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.clearOutputBtn = document.getElementById('clearOutputBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        
        this.initializeEventListeners();
        this.initializeExamples();
        this.addKeyboardShortcuts();
    }

    initializeEventListeners() {
        this.runBtn.addEventListener('click', () => this.runCode());
        this.clearBtn.addEventListener('click', () => this.clearCode());
        this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
        this.exampleBtn.addEventListener('click', () => this.showExampleMenu());
        
        // Add keyboard shortcut for running code
        this.codeEditor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
        });
    }

    initializeExamples() {
        const exampleCards = document.querySelectorAll('.example-card');
        exampleCards.forEach(card => {
            card.addEventListener('click', () => {
                const exampleType = card.dataset.example;
                this.loadExample(exampleType);
            });
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to run code
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            
            // Ctrl/Cmd + K to clear output
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.clearOutput();
            }
        });
    }

    async runCode() {
        const code = this.codeEditor.value.trim();
        
        if (!code) {
            this.displayOutput('No code to run!', 'error');
            return;
        }

        this.setLoading(true);
        this.clearOutput();
        this.displayOutput('Running code...', 'info');

        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            this.clearOutput();
            
            if (result.error) {
                this.displayOutput(result.error, 'error');
            } else if (result.output) {
                this.displayOutput(result.output, 'success');
            } else {
                this.displayOutput('Code executed successfully!', 'success');
            }

        } catch (error) {
            this.clearOutput();
            this.displayOutput(`Network error: ${error.message}`, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    clearCode() {
        this.codeEditor.value = '';
        this.codeEditor.focus();
    }

    clearOutput() {
        this.output.innerHTML = '';
    }

    displayOutput(message, type = 'info') {
        const outputElement = document.createElement('div');
        
        switch (type) {
            case 'error':
                outputElement.className = 'error-message';
                break;
            case 'success':
                outputElement.className = 'output-message';
                break;
            case 'info':
            default:
                outputElement.className = 'info-message';
                break;
        }
        
        outputElement.textContent = message;
        this.output.appendChild(outputElement);
        
        // Auto-scroll to bottom
        this.output.scrollTop = this.output.scrollHeight;
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.runBtn.disabled = true;
            this.runBtn.classList.add('loading');
            this.runBtn.innerHTML = '<span class="btn-icon">⏳</span> Running...';
        } else {
            this.runBtn.disabled = false;
            this.runBtn.classList.remove('loading');
            this.runBtn.innerHTML = '<span class="btn-icon">▶</span> Run Code';
        }
    }

    loadExample(exampleType) {
        const examples = {
            hello: `# Hello World Example
mon greeting = "Hello, Poke! 🎯"
print(greeting)

mon name = "World"
print("Hello, " + name + "!")

# Try some basic math
mon x = 10
mon y = 5
print("10 + 5 = " + print_ret(x + y))`,

            factorial: `# Factorial Function Example
rotom factorial(n) ->
    if n <= 1 then 1 else n * factorial(n - 1) end

# Test the factorial function
for i = 0 to 6 then
    print("factorial(" + print_ret(i) + ") = " + print_ret(factorial(i)))
end

# Calculate factorial of 10
print("factorial(10) = " + print_ret(factorial(10)))`,

            fibonacci: `# Fibonacci Sequence Example
mon fibs = [0, 1]

# Generate first 15 Fibonacci numbers
for i = 2 to 15 then
    mon next = fibs[i-1] + fibs[i-2]
    append(fibs, next)
end

print("First 15 Fibonacci numbers:")
print(fibs)

# Function to get nth Fibonacci number
rotom fib(n)
    if n <= 1 then
        return n
    else
        return fib(n-1) + fib(n-2)
    end
end

print("20th Fibonacci number: " + print_ret(fib(20)))`,

            calculator: `# Simple Calculator Example
rotom calculator(operation, a, b)
    if operation == "+" then
        return a + b
    elif operation == "-" then
        return a - b
    elif operation == "*" then
        return a * b
    elif operation == "/" then
        if b == 0 then
            return "Error: Division by zero!"
        else
            return a / b
        end
    elif operation == "^" then
        return a ^ b
    elif operation == "%" then
        return a % b
    else
        return "Unknown operation: " + operation
    end
end

# Test the calculator
mon a = 15
mon b = 4

print("Calculator Demo:")
print(print_ret(a) + " + " + print_ret(b) + " = " + print_ret(calculator("+", a, b)))
print(print_ret(a) + " - " + print_ret(b) + " = " + print_ret(calculator("-", a, b)))
print(print_ret(a) + " * " + print_ret(b) + " = " + print_ret(calculator("*", a, b)))
print(print_ret(a) + " / " + print_ret(b) + " = " + print_ret(calculator("/", a, b)))
print(print_ret(a) + " ^ " + print_ret(b) + " = " + print_ret(calculator("^", a, b)))
print(print_ret(a) + " % " + print_ret(b) + " = " + print_ret(calculator("%", a, b)))

# Test error handling
print("Division by zero test: " + print_ret(calculator("/", 10, 0)))`
        };

        if (examples[exampleType]) {
            this.codeEditor.value = examples[exampleType];
            this.codeEditor.focus();
            
            // Clear output and show info message
            this.clearOutput();
            this.displayOutput(`Loaded ${exampleType} example. Click "Run Code" to execute!`, 'info');
        }
    }

    showExampleMenu() {
        // Simple example selection with prompt
        const exampleOptions = [
            'hello - Hello World and basic operations',
            'factorial - Recursive factorial function',
            'fibonacci - Fibonacci sequence generation',
            'calculator - Simple calculator with operations'
        ];
        
        const choice = prompt(
            'Choose an example to load:\n\n' + 
            exampleOptions.join('\n') + 
            '\n\nEnter the example name (hello, factorial, fibonacci, calculator):'
        );
        
        if (choice && ['hello', 'factorial', 'fibonacci', 'calculator'].includes(choice.toLowerCase())) {
            this.loadExample(choice.toLowerCase());
        }
    }
}

// Enhanced syntax highlighting for Poke language
class PokeSyntaxHighlighter {
    constructor(textarea) {
        this.textarea = textarea;
        this.setupHighlighting();
    }

    setupHighlighting() {
        // Add basic syntax highlighting on input
        this.textarea.addEventListener('input', () => {
            this.highlightSyntax();
        });
    }

    highlightSyntax() {
        // Simple syntax highlighting - this is a basic implementation
        // For a full implementation, you'd want to use a proper syntax highlighter
        const keywords = ['mon', 'rotom', 'if', 'elif', 'else', 'then', 'end', 'for', 'to', 'step', 'while', 'and', 'or', 'not', 'return', 'continue', 'break'];
        const builtins = ['print', 'input', 'len', 'append', 'pop', 'extend', 'clear', 'true', 'false', 'null', 'pi'];
        
        // This is a simplified version - for production, use a proper highlighter
        // like CodeMirror or Monaco Editor
    }
}

// Auto-resize textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
}

// Initialize the IDE when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ide = new PokeIDE();
    
    // Setup auto-resize for code editor
    const codeEditor = document.getElementById('codeEditor');
    if (codeEditor) {
        codeEditor.addEventListener('input', () => autoResizeTextarea(codeEditor));
        
        // Setup basic tab support
        codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeEditor.selectionStart;
                const end = codeEditor.selectionEnd;
                const value = codeEditor.value;
                
                codeEditor.value = value.substring(0, start) + '    ' + value.substring(end);
                codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
            }
        });
    }
    
    // Add smooth animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    document.querySelectorAll('.examples-section, .features-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Add welcome message
    console.log('%c🎯 Welcome to Poke Programming Language!', 'color: #4299e1; font-size: 16px; font-weight: bold;');
    console.log('%cTry running some code and explore the examples!', 'color: #718096; font-size: 14px;');
});

// Global error handler
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

// Service worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Only register if you create a service worker file
        // navigator.serviceWorker.register('/sw.js');
    });
}
