document.addEventListener('DOMContentLoaded', function() {
    // Find all pre code blocks
    const codeBlocks = document.querySelectorAll('pre');
    
    codeBlocks.forEach(block => {
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.textContent = 'Copy';
        copyButton.setAttribute('aria-label', 'Copy code');
        
        // Add button to code block
        block.style.position = 'relative';
        block.insertBefore(copyButton, block.firstChild);
        
        // Add click event
        copyButton.addEventListener('click', function() {
            const code = block.querySelector('code');
            const textToCopy = code ? code.textContent : block.textContent;
            
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Change button text temporarily
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    copyButton.classList.add('copied');
                    
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                        copyButton.classList.remove('copied');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    copyButton.textContent = 'Failed';
                    
                    setTimeout(() => {
                        copyButton.textContent = 'Copy';
                    }, 2000);
                });
        });
    });
});
