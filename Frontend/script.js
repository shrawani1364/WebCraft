let currentTemplate = '';
let selectedElement = null;
// Use WeakMap so DOM elements can be keys (works reliably)
let originalStyles = new WeakMap();
let zoomLevel = 100;


// Smooth scroll to sections
function scrollToTemplates() {
    document.getElementById('templates').scrollIntoView({ behavior: 'smooth' });
}

// Navigation active state
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                this.classList.add('active');
                // Scroll to section
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Template Selection
function selectTemplate(templateName) {
    currentTemplate = templateName;
    
    // Hide homepage sections
    document.querySelector('.navbar').style.display = 'none';
    document.querySelector('.hero-section').style.display = 'none';
    document.querySelector('.features-section').style.display = 'none';
    document.querySelector('.templates-section').style.display = 'none';
    document.querySelector('.about-section').style.display = 'none';
    document.querySelector('.pricing-section').style.display = 'none';
    document.querySelector('.footer').style.display = 'none';
    
    // Show editor
    document.getElementById('editorScreen').style.display = 'block';
    document.getElementById('templateName').textContent = templates[templateName].name;
    
    // Load template into canvas
    document.getElementById('canvas').innerHTML = templates[templateName].html;
    
    // Add event listeners to editable elements
    setupEditableElements();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Back to Templates
function backToTemplates() {
    if (confirm('Are you sure? Any unsaved changes will be lost.')) {
        // Show homepage sections
        document.querySelector('.navbar').style.display = 'block';
        document.querySelector('.hero-section').style.display = 'block';
        document.querySelector('.features-section').style.display = 'block';
        document.querySelector('.templates-section').style.display = 'block';
        document.querySelector('.about-section').style.display = 'block';
        document.querySelector('.pricing-section').style.display = 'block';
        document.querySelector('.footer').style.display = 'block';
        
        // Hide editor
        document.getElementById('editorScreen').style.display = 'none';
        
        selectedElement = null;
        hideAllControls();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Setup Editable Elements
function setupEditableElements() {
    const editableTexts = document.querySelectorAll('.editable');
    const editableImages = document.querySelectorAll('.editable-image');
    
    editableTexts.forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            selectTextElement(this);
        });
    });
    
    editableImages.forEach(element => {
        element.addEventListener('click', function(e) {
            e.stopPropagation();
            selectImageElement(this);
        });
    });
    
    // Click outside to deselect
    document.getElementById('canvas').addEventListener('click', function(e) {
        if (e.target.id === 'canvas') {
            deselectAll();
        }
    });
}

// Select Text Element
function selectTextElement(element) {
    deselectAll();
    selectedElement = element;
    element.classList.add('selected');
    
    // Store original styles
    storeOriginalStyles(element);
    
    // Show text controls
    document.getElementById('textControls').style.display = 'block';
    document.getElementById('imageControls').style.display = 'none';
    
    // Populate controls
    document.getElementById('textContent').value = element.textContent;
    
    const computedStyle = window.getComputedStyle(element);
    document.getElementById('fontSize').value = parseInt(computedStyle.fontSize);
    document.getElementById('textColor').value = rgbToHex(computedStyle.color);
    document.getElementById('textAlign').value = computedStyle.textAlign;
    
    const fontWeight = computedStyle.fontWeight;
    if (fontWeight === '700' || fontWeight === 'bold') {
        document.getElementById('fontWeight').value = 'bold';
    } else if (fontWeight === '600') {
        document.getElementById('fontWeight').value = '600';
    } else if (fontWeight === '300') {
        document.getElementById('fontWeight').value = '300';
    } else {
        document.getElementById('fontWeight').value = 'normal';
    }
    
    document.getElementById('fontFamily').value = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
    
    // Add event listeners
    addTextControlListeners();
}

// Select Image Element
function selectImageElement(element) {
    deselectAll();
    selectedElement = element;
    element.classList.add('selected');
    
    // Store original styles
    storeOriginalStyles(element);
    
    // Show image controls
    document.getElementById('imageControls').style.display = 'block';
    document.getElementById('textControls').style.display = 'none';
    
    // Populate controls
    document.getElementById('imageUrl').value = element.src;
    const width = element.style.width;
    document.getElementById('imageWidth').value = width ? parseInt(width) : 100;
    const borderRadius = parseInt(element.style.borderRadius) || 0;
    document.getElementById('imageBorderRadius').value = borderRadius;
    
    // Add event listeners
addImageControlListeners();

// --- 📸 Add Upload Image Button ---
const imageControls = document.getElementById('imageControls');
let existingButton = document.getElementById('uploadImageBtn');
if (!existingButton) {
    const uploadButton = document.createElement('button');
    uploadButton.id = 'uploadImageBtn';
    uploadButton.textContent = 'Upload from Device';
    uploadButton.style.marginTop = '10px';
    uploadButton.style.background = '#6366f1';
    uploadButton.style.color = '#fff';
    uploadButton.style.padding = '6px 12px';
    uploadButton.style.border = 'none';
    uploadButton.style.borderRadius = '6px';
    uploadButton.style.cursor = 'pointer';
    uploadButton.style.fontSize = '0.9rem';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    // Add button + file input to sidebar
    imageControls.appendChild(uploadButton);
    imageControls.appendChild(fileInput);

    // Open picker
    uploadButton.addEventListener('click', () => fileInput.click());

    // Replace image
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && selectedElement) {
            const reader = new FileReader();
            reader.onload = () => {
                selectedElement.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });
}
}

// Store Original Styles (now using WeakMap)
function storeOriginalStyles(element) {
    // Save only once per element
    if (!originalStyles.has(element)) {
        const data = {
            innerHTML: element.innerHTML,
            style: element.getAttribute('style') || '',
            tagName: element.tagName,
        };

        // For images, also store src and attributes that matter
        if (element.tagName === 'IMG') {
            data.src = element.src;
            // store width / borderRadius if present in style (optional)
            data.width = element.style.width || '';
            data.borderRadius = element.style.borderRadius || '';
            data.alt = element.alt || '';
        }

        originalStyles.set(element, data);
    }
}

// Reset Element
function resetElement() {
    if (!selectedElement) {
        alert('Please select an element first');
        return;
    }

    if (!originalStyles.has(selectedElement)) {
        // nothing saved for this element
        alert('No saved original state for this element.');
        return;
    }

    if (confirm('Reset this element to its original state?')) {
        const data = originalStyles.get(selectedElement);

        // If it was an image -> restore src and other image-specific props
        if (data.tagName === 'IMG' && selectedElement.tagName === 'IMG') {
            if (data.src !== undefined) selectedElement.src = data.src;
            if (data.alt !== undefined) selectedElement.alt = data.alt;
            // Restore style properties saved
            if (data.width !== undefined) selectedElement.style.width = data.width;
            if (data.borderRadius !== undefined) selectedElement.style.borderRadius = data.borderRadius;
        } else {
            // For non-image elements restore innerHTML and full style
            selectedElement.innerHTML = data.innerHTML;
            selectedElement.setAttribute('style', data.style || '');
        }

        // Deselect and hide controls
        deselectAll();
        hideAllControls();
    }
}


// Deselect All
function deselectAll() {
    const allSelected = document.querySelectorAll('.selected');
    allSelected.forEach(el => el.classList.remove('selected'));
    selectedElement = null;
}

// Hide All Controls
function hideAllControls() {
    document.getElementById('textControls').style.display = 'none';
    document.getElementById('imageControls').style.display = 'none';
}

// Add Text Control Listeners
function addTextControlListeners() {
    document.getElementById('textContent').oninput = function() {
        if (selectedElement) {
            selectedElement.textContent = this.value;
        }
    };
    
    document.getElementById('fontSize').oninput = function() {
        if (selectedElement) {
            selectedElement.style.fontSize = this.value + 'px';
        }
    };
    
    document.getElementById('textColor').oninput = function() {
        if (selectedElement) {
            selectedElement.style.color = this.value;
        }
    };
    
    document.getElementById('textAlign').onchange = function() {
        if (selectedElement) {
            selectedElement.style.textAlign = this.value;
        }
    };
    
    document.getElementById('fontWeight').onchange = function() {
        if (selectedElement) {
            selectedElement.style.fontWeight = this.value;
        }
    };
    
    document.getElementById('fontFamily').onchange = function() {
        if (selectedElement) {
            selectedElement.style.fontFamily = this.value;
        }
    };
}

// Add Image Control Listeners
function addImageControlListeners() {
    document.getElementById('imageUrl').oninput = function() {
        if (selectedElement) {
            selectedElement.src = this.value;
        }
    };
    
    document.getElementById('imageWidth').oninput = function() {
        if (selectedElement) {
            selectedElement.style.width = this.value + '%';
        }
    };
    
    document.getElementById('imageBorderRadius').oninput = function() {
        if (selectedElement) {
            selectedElement.style.borderRadius = this.value + 'px';
        }
    };
}

// Background Color Control
document.getElementById('bgColor').addEventListener('input', function() {
    document.getElementById('canvas').style.backgroundColor = this.value;
});

// Zoom Functions
function zoomIn() {
    if (zoomLevel < 150) {
        zoomLevel += 10;
        updateZoom();
    }
}

function zoomOut() {
    if (zoomLevel > 50) {
        zoomLevel -= 10;
        updateZoom();
    }
}

function updateZoom() {
    const canvas = document.getElementById('canvas');
    canvas.style.transform = `scale(${zoomLevel / 100})`;
    canvas.style.transformOrigin = 'top center';
    document.getElementById('zoomLevel').textContent = zoomLevel + '%';
}

// View Code
function viewCode() {
    const canvas = document.getElementById('canvas');
    const html = generateFullHTML(canvas.innerHTML, canvas.style.backgroundColor);
    
    document.getElementById('codeDisplay').textContent = html;
    document.getElementById('codeModal').classList.add('show');
}

// Close Modal
function closeModal() {
    document.getElementById('codeModal').classList.remove('show');
}

// Copy Code
function copyCode() {
    const codeDisplay = document.getElementById('codeDisplay');
    const text = codeDisplay.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy code. Please select and copy manually.');
    });
}

// Download Website
function downloadWebsite() {
    const canvas = document.getElementById('canvas');
    const html = generateFullHTML(canvas.innerHTML, canvas.style.backgroundColor);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-website-${currentTemplate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('✓ Website downloaded successfully! Open the HTML file in your browser.');
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        font-weight: 600;
        max-width: 350px;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Utility: RGB to Hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';
    
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('codeModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('codeModal').classList.contains('show')) {
            closeModal();
        } else {
            deselectAll();
            hideAllControls();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('editorScreen').style.display === 'block') {
            downloadWebsite();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (document.getElementById('editorScreen').style.display === 'block') {
            viewCode();
        }
    }
    
    if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        resetElement();
    }
});

// Generate Full HTML
function generateFullHTML(content, bgColor) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website - ${currentTemplate}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${bgColor || '#ffffff'};
            padding: 50px 20px;
            line-height: 1.6;
            color: #1e293b;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1, h2, h3 {
            margin-bottom: 16px;
            line-height: 1.3;
            font-weight: 700;
        }
        h1 {
            font-size: 2.5rem;
        }
        h2 {
            font-size: 2rem;
            margin-top: 40px;
        }
        p {
            margin-bottom: 16px;
            line-height: 1.7;
        }
        img {
            max-width: 100%;
            height: auto;
            display: block;
        }
        strong {
            font-weight: 600;
            color: #0f172a;
        }
        
        /* Template-specific styles */
        .template-business h1 {
            color: #1e293b;
        }
        .template-portfolio h1 {
            color: #be123c;
            text-align: center;
        }
        .template-portfolio p {
            text-align: center;
        }
        .template-blog h1 {
            color: #0891b2;
        }
        .template-landing {
            text-align: center;
        }
        .template-landing h1 {
            color: #7c3aed;
        }
        .template-restaurant h1 {
            color: #c2410c;
            text-align: center;
        }
        .template-ecommerce h1 {
            color: #0891b2;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 30px 15px;
            }
            h1 {
                font-size: 2rem;
            }
            h2 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
</body>
</html>`;
}

// Console messages
console.log('%c🎨 WebCraft Studio Professional', 'color: #6366f1; font-size: 24px; font-weight: bold;');
console.log('%cKeyboard Shortcuts:', 'color: #64748b; font-size: 14px; font-weight: bold; margin-top: 10px;');
console.log('  ESC - Close modal or deselect element');
console.log('  Ctrl/Cmd + S - Download website');
console.log('  Ctrl/Cmd + K - View code');
console.log('  Delete - Reset selected element');