// Logic for Landing Page

const modalOverlay = document.getElementById('leadModal');
const leadForm = document.getElementById('leadForm');

// Pricing Data
const pricingData = {
    monthly: [
        { price: "49.90", unit: "/mês", label: "cobrado mensalmente" },
        { price: "274.90", unit: "/mês", label: "cobrado mensalmente" },
        { price: "164.90", unit: "/mês", label: "cobrado mensalmente" }
    ],
    annual: [
        { price: "39.92", unit: "/mês", label: "cobrado anualmente" },
        { price: "219.92", unit: "/mês", label: "cobrado anualmente" },
        { price: "131.92", unit: "/mês", label: "cobrado anualmente" }
    ]
};

let isAnnual = false; // Default state

// Open Modal
window.openLeadModal = function () {
    if (modalOverlay) {
        modalOverlay.classList.remove('hidden');
        requestAnimationFrame(() => {
            modalOverlay.classList.add('active');
        });
    }
};

// Close Modal
window.closeLeadModal = function () {
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
        setTimeout(() => {
            modalOverlay.classList.add('hidden');
        }, 300);
    }
};

// Toggle Billing Logic
window.toggleBilling = function () {
    isAnnual = !isAnnual;

    // Update Toggle UI
    const toggleBtn = document.getElementById('billing-toggle');
    const badge = document.getElementById('saving-badge');
    const labelMonthly = document.getElementById('label-monthly');
    const labelAnnual = document.getElementById('label-annual');

    toggleBtn.setAttribute('aria-pressed', isAnnual);

    if (isAnnual) {
        badge.classList.remove('hidden');
        labelAnnual.classList.add('active');
        labelMonthly.classList.remove('active');
    } else {
        badge.classList.add('hidden');
        labelAnnual.classList.remove('active');
        labelMonthly.classList.add('active');
    }

    // Update Prices
    const cards = document.querySelectorAll('.pricing-card');
    const data = isAnnual ? pricingData.annual : pricingData.monthly;

    cards.forEach((card, index) => {
        const priceEl = card.querySelector('.price');
        // Reconstruct the price HTML: R$ XX.XX<small>/mês</small>
        priceEl.innerHTML = `R$ ${data[index].price}<small>${data[index].unit}</small>`;
    });
};


// Close on click outside
if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            window.closeLeadModal();
        }
    });
}

// Handle Form Submit
if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = leadForm.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.textContent = 'Enviando...';

        // Simulate API call
        setTimeout(() => {
            const formData = new FormData(leadForm);
            const user = {
                nome: formData.get('nome') || 'Visitante',
                email: formData.get('email') || 'visitante@email.com'
            };
            localStorage.setItem('lead_info', JSON.stringify(user));

            // Show Success Message instead of redirecting
            const modalBody = document.querySelector('.modal');
            if (modalBody) {
                modalBody.innerHTML = `
                    <button class="close-modal" onclick="closeLeadModal()">×</button>
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 48px; margin-bottom: 1rem;">✅</div>
                        <h3 style="margin-bottom: 0.5rem;">Solicitação Recebida!</h3>
                        <p style="color: #a0aec0; margin-bottom: 1.5rem;">
                            Obrigado, ${user.nome.split(' ')[0]}!<br>
                            Em breve um de nossos consultores entrará em contato para liberar seu acesso à demonstração.
                        </p>
                        <button onclick="closeLeadModal()" class="btn-primary btn-full">Fechar</button>
                    </div>
                `;
            }

            // window.location.href = `/app/?auto=true&email=${encodeURIComponent(user.email)}`;

        }, 1500);
    });
}
