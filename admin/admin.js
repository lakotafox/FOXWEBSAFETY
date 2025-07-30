// Initial product data structure matching the website
let products = {
    new: [
        {
            id: 1,
            title: "Classic Laminate Series - Silver Birch",
            image: "/images/desk grey L showroom.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Silver Square Handles", "Metal connections", "Core removable locks"]
        },
        {
            id: 2,
            title: "Elements Laminate Series",
            image: "/images/small desk.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Greenguard Certified", "Heavy duty steel frame", "Coordinates with Classic storage"]
        },
        {
            id: 3,
            title: "Signature Collection",
            image: "/images/Showroomwglassboard.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Wood VA Legs available", "Metal VA Legs available", "Modern design"]
        }
    ],
    battleTested: [
        {
            id: 4,
            title: "Palmer House Conference Tables",
            image: "/images/tanconf.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Brushed Steel Base", "Standard grommet", "Multiple sizes available"]
        },
        {
            id: 5,
            title: "Height Adjustable Desks",
            image: "/images/showfacinggarage.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["3-stage legs", "Memory handset", "265 lb weight rating"]
        },
        {
            id: 6,
            title: "Encore Collection",
            image: "/images/conference-room.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Beveled steel frame", "Greenguard Certified", "Works with Elements storage"]
        }
    ],
    seating: [
        {
            id: 7,
            title: "Konfurb Seating Collection",
            image: "/images/reception-area.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Award-winning design", "Ergonomic features", "Multiple series available"]
        },
        {
            id: 8,
            title: "Storage Solutions",
            image: "/images/showroom-1.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Ball bearing slides", "Locking options", "Multiple finishes"]
        },
        {
            id: 9,
            title: "Reception Seating",
            image: "/images/reception tan.jpg",
            price: "Price coming soon",
            description: "Website is a work in progress - prices and products coming soon!",
            features: ["Anti-microbial vinyl", "Designer fabrics", "Modular options"]
        }
    ]
};

// Current active tab
let activeTab = 'new';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderAllProducts();
});

// Switch between tabs
function switchTab(tab) {
    activeTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Render all products
function renderAllProducts() {
    renderProducts('new');
    renderProducts('battleTested');
    renderProducts('seating');
}

// Render products for a specific category
function renderProducts(category) {
    const container = document.getElementById(`${category}-products`);
    container.innerHTML = '';
    
    products[category].forEach((product, index) => {
        const card = createProductCard(product, category, index);
        container.appendChild(card);
    });
}

// Create a product card
function createProductCard(product, category, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <h3>Product ${index + 1}</h3>
        
        <div class="form-group">
            <label>Product Image</label>
            <div class="image-preview ${product.image ? 'has-image' : ''}" 
                 id="preview-${category}-${index}"
                 style="${product.image ? `background-image: url('${product.image}')` : ''}"
                 onclick="selectImage('${category}', ${index})">
                <span style="${product.image ? 'display:none' : ''}">Click to select image</span>
            </div>
            <input type="file" 
                   id="file-${category}-${index}" 
                   accept="image/*" 
                   style="display: none"
                   onchange="handleImageChange('${category}', ${index}, this)">
        </div>
        
        <div class="form-group">
            <label>Title</label>
            <input type="text" 
                   value="${product.title}" 
                   onchange="updateProduct('${category}', ${index}, 'title', this.value)">
        </div>
        
        <div class="form-group">
            <label>Price</label>
            <input type="text" 
                   value="${product.price}" 
                   placeholder="e.g., $1,299 or Price coming soon"
                   onchange="updateProduct('${category}', ${index}, 'price', this.value)">
        </div>
        
        <div class="form-group">
            <label>Description</label>
            <textarea onchange="updateProduct('${category}', ${index}, 'description', this.value)">${product.description}</textarea>
        </div>
        
        <div class="form-group">
            <label>Features</label>
            <div class="features-list" id="features-${category}-${index}">
                ${product.features.map((feature, fi) => `
                    <div class="feature-input">
                        <input type="text" 
                               value="${feature}" 
                               onchange="updateFeature('${category}', ${index}, ${fi}, this.value)">
                        <button class="btn-remove" onclick="removeFeature('${category}', ${index}, ${fi})">×</button>
                    </div>
                `).join('')}
            </div>
            <button class="btn-add" onclick="addFeature('${category}', ${index})">+ Add Feature</button>
        </div>
    `;
    
    return card;
}

// Handle image selection
function selectImage(category, index) {
    document.getElementById(`file-${category}-${index}`).click();
}

// Handle image change
function handleImageChange(category, index, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // For now, we'll store the filename and show preview
            // In a real app, you'd upload to a server
            const imagePath = `/images/${file.name}`;
            products[category][index].image = imagePath;
            
            const preview = document.getElementById(`preview-${category}-${index}`);
            preview.style.backgroundImage = `url('${e.target.result}')`;
            preview.classList.add('has-image');
            preview.querySelector('span').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Update product property
function updateProduct(category, index, property, value) {
    products[category][index][property] = value;
}

// Update feature
function updateFeature(category, index, featureIndex, value) {
    products[category][index].features[featureIndex] = value;
}

// Remove feature
function removeFeature(category, index, featureIndex) {
    products[category][index].features.splice(featureIndex, 1);
    renderProducts(category);
}

// Add feature
function addFeature(category, index) {
    products[category][index].features.push('');
    renderProducts(category);
}

// Export all data
function exportData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        products: products
    };
    
    // Generate the code that would update the website
    const code = `// FoxBuilt Product Update - ${new Date().toLocaleDateString()}
// Copy this code and replace the featuredProducts object in app/page.tsx

const featuredProducts = ${JSON.stringify(products, null, 2)};

// Instructions:
// 1. Open app/page.tsx in your code editor
// 2. Find the "featuredProducts" object (around line 34)
// 3. Replace the entire object with the code above
// 4. Save the file and commit changes
// 5. Push to GitHub to update the website

// Note: Make sure all image files are uploaded to the public/images folder`;
    
    // Show modal with export data
    document.getElementById('exportCode').textContent = code;
    document.getElementById('exportModal').classList.add('show');
}

// Close modal
function closeModal() {
    document.getElementById('exportModal').classList.remove('show');
    document.getElementById('copySuccess').style.display = 'none';
}

// Copy code to clipboard
function copyCode() {
    const code = document.getElementById('exportCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        document.getElementById('copySuccess').style.display = 'block';
        setTimeout(() => {
            document.getElementById('copySuccess').style.display = 'none';
        }, 3000);
    });
}

// Close modal when clicking outside
document.getElementById('exportModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});