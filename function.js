// --- Global Variables & Initial Setup ---
const GEMINI_API_KEY = "AIzaSyAX4FOixoe_aAmlDoeH_m8QUM9RkBXGilo"; // Your Gemini API Key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    // Load feedback from localStorage on page load
    loadFeedback();

    // Attempt to play background audio, handling browser restrictions
    const audio = document.getElementById('background-audio');
    audio.play().catch(error => {
        console.log("Autoplay was prevented. User interaction is needed to start the audio.");
        // We can add a button here to let the user start the audio manually if needed.
    });
    
    // Add event listener for chat input to send on 'Enter' key
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Add event listener for the feedback form
    const feedbackForm = document.getElementById('feedback-form');
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
});


// --- Product Checkout Function ---
function checkout(productType) {
    let totalHarga = 0;
    let message = "";

    switch (productType) {
        case 'follower':
            const jumlahFollower = prompt("Masukkan jumlah follower yang ingin Anda beli:", "100");
            if (jumlahFollower && !isNaN(jumlahFollower) && parseInt(jumlahFollower) > 0) {
                totalHarga = parseInt(jumlahFollower) * 100;
                message = `Total harga untuk ${jumlahFollower} follower adalah: Rp ${totalHarga.toLocaleString('id-ID')}.`;
            } else {
                alert("Jumlah tidak valid. Silakan masukkan angka.");
                return;
            }
            break;
        case 'sc-assain':
            totalHarga = 25000;
            message = `Harga untuk "SC Assain" adalah: Rp ${totalHarga.toLocaleString('id-ID')}.`;
            break;
        case 'reseller-sc-assain':
            totalHarga = 50000;
            message = `Harga untuk "Reseller SC Assain" adalah: Rp ${totalHarga.toLocaleString('id-ID')}.`;
            break;
        default:
            alert("Produk tidak ditemukan.");
            return;
    }

    alert(message + "\n\n(Ini adalah simulasi. Tidak ada data yang disimpan.)");
}


// --- Chatbot Functions ---
const chatPopup = document.getElementById('chat-popup');
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const chatLoading = document.getElementById('chat-loading');

function toggleChat() {
    if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
        chatPopup.style.display = 'flex';
    } else {
        chatPopup.style.display = 'none';
    }
}

async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;

    // Display user's message
    appendMessage(userMessage, 'user');
    chatInput.value = '';
    chatLoading.style.display = 'block';

    try {
        // Construct the request payload for Gemini API
        const payload = {
            contents: [{
                parts: [{
                    text: `Anda adalah Rakha-AI, asisten virtual untuk RakhaStore AI. Kepribadian Anda profesional, pengertian, dan berbudi luhur. Jawab pertanyaan pengguna dengan sopan dan informatif. Pertanyaan pengguna: "${userMessage}"`
                }]
            }]
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.candidates[0].content.parts[0].text;
        
        // Display AI's response
        appendMessage(aiMessage, 'ai');

    } catch (error) {
        console.error('Error fetching from Gemini API:', error);
        appendMessage('Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti.', 'ai');
    } finally {
        chatLoading.style.display = 'none';
    }
}

function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-bubble', sender === 'user' ? 'user-bubble' : 'ai-bubble');
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to the latest message
}


// --- Kritik & Saran Functions ---
function handleFeedbackSubmit(event) {
    event.preventDefault(); // Prevent the form from reloading the page

    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const commentInput = document.getElementById('comment');

    // Validation
    if (!ratingInput) {
        alert("Mohon berikan rating bintang.");
        return;
    }
    if (commentInput.value.trim() === '') {
        alert("Mohon isi kolom komentar.");
        return;
    }

    const newFeedback = {
        rating: ratingInput.value,
        comment: commentInput.value.trim(),
        date: new Date().toLocaleString('id-ID')
    };

    saveFeedback(newFeedback);
    loadFeedback(); // Refresh the display

    // Clear the form
    event.target.reset();
}

function saveFeedback(feedback) {
    // Get existing feedback from localStorage or initialize an empty array
    const existingFeedback = JSON.parse(localStorage.getItem('rakhastore_feedback')) || [];
    // Add the new feedback to the beginning of the array
    existingFeedback.unshift(feedback);
    // Save the updated array back to localStorage
    localStorage.setItem('rakhastore_feedback', JSON.stringify(existingFeedback));
}

function loadFeedback() {
    const feedbackList = document.getElementById('feedback-list');
    const allFeedback = JSON.parse(localStorage.getItem('rakhastore_feedback')) || [];

    // Clear current display
    feedbackList.innerHTML = '';

    if (allFeedback.length === 0) {
        feedbackList.innerHTML = '<p class="text-center text-gray-400">Belum ada ulasan.</p>';
        return;
    }

    allFeedback.forEach(fb => {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'card p-4 rounded-lg';

        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += `<span class="text-xl ${i < fb.rating ? 'text-amber-500' : 'text-gray-600'}">★</span>`;
        }

        feedbackElement.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <div class="rating">${stars}</div>
                <span class="text-xs text-gray-400">${fb.date}</span>
            </div>
            <p class="text-gray-300">${fb.comment}</p>
        `;
        feedbackList.appendChild(feedbackElement);
    });
}
