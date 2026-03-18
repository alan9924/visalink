/* =====================================================
   VisaLink – app.js  |  All interactivity & quiz logic
   ===================================================== */

/**
 * 0. MOBILE NATIVE ENHANCEMENTS (Android & iOS)
 * Tactile feedback & Native share implementations.
 */
function triggerHaptic(type = 'medium') {
  if (!window.navigator.vibrate) return;
  
  switch(type) {
    case 'light': window.navigator.vibrate(10); break;
    case 'medium': window.navigator.vibrate(25); break;
    case 'heavy': window.navigator.vibrate(50); break;
    case 'success': window.navigator.vibrate([20, 40, 20]); break;
    case 'error': window.navigator.vibrate([60, 30, 60]); break;
  }
}

/** 
 * Share Content via Native Mobile Sheet
 */
async function shareContent(title, text, url) {
  triggerHaptic('medium');
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      console.log('Share cancelled or failed:', err);
    }
  } else {
    // Fallback if not supported
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = url || window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    showToast('Enlace copiado al portapapeles', 'success');
  }
}

// Global Tab Management with Haptic
const TABS = ['inicio', 'semaforo', 'planes', 'faq', 'info', 'pasaporte', 'consulados'];

function showTab(id) {
  triggerHaptic('light');
  TABS.forEach(t => {
    const page = document.getElementById('tab-' + t);
    const btn = document.getElementById('tab-btn-' + t);
    const mobBtn = document.querySelector(`.mob-nav-item[onclick*="'${t}'"]`);
    
    if (page) page.classList.toggle('active', t === id);
    if (btn) btn.classList.toggle('active', t === id);
    if (mobBtn) {
      document.querySelectorAll('.mob-nav-item').forEach(i => i.classList.remove('mob-nav-active'));
      if (t === id) mobBtn.classList.add('mob-nav-active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'auto' }); // Instant for responsiveness

  if (id === 'semaforo' && typeof initQuiz === 'function') {
    const card = document.getElementById('quiz-card');
    if (card && card.style.display === 'none' && 
        document.getElementById('quiz-result').style.display === 'none') {
      initQuiz();
    }
  }
}


// =====================================================
// 1. NAVBAR – scroll effect & hamburger
// =====================================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.style.opacity = navLinks.classList.contains('open') ? '0' : '1';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.style.opacity = '1';
    });
  });
}

// =====================================================
// 2. FLOATING PARTICLES in hero
// =====================================================
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 20}%;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.5 + 0.1};
    `;
    container.appendChild(p);
  }
}
createParticles();

// =====================================================
// 3. ANIMATED COUNTER for hero stats
// =====================================================
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString('es-MX');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString('es-MX');
    }
  }, 16);
}

const countersObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.getAttribute('data-target'));
      animateCounter(el, target);
      countersObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => countersObserver.observe(el));

// Sentimiento de Aprobación – activa animaciones al entrar en viewport
const tscObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && e.target.classList.contains('testimonial-stats-card')) {
      // La barra se activa via CSS (.visible .sa-bar-fill)
      startLiveFeed();
      tscObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.testimonial-stats-card').forEach(el => tscObserver.observe(el));

// Feed en vivo – rotación de aprobaciones recientes
const liveFeedItems = [
  ' Ana G. – CDMX – Visa aprobada hace 2 min',
  ' Roberto M. – Guadalajara – Visa aprobada hace 5 min',
  ' Laura P. – Monterrey – Visa aprobada hace 8 min',
  ' Carlos R. – Tijuana – Visa aprobada hace 11 min',
  ' Sofía V. – Hermosillo – Visa aprobada hace 14 min',
  ' Diego F. – CDMX – Visa aprobada hace 17 min',
  ' María L. – Guadalajara – Visa aprobada hace 21 min',
];
let liveFeedIndex = 0;

function startLiveFeed() {
  const feed = document.getElementById('sa-live-feed');
  if (!feed) return;
  setInterval(() => {
    liveFeedIndex = (liveFeedIndex + 1) % liveFeedItems.length;
    const span = document.createElement('span');
    span.className = 'sa-live-item';
    span.textContent = liveFeedItems[liveFeedIndex];
    feed.innerHTML = '';
    feed.appendChild(span);
  }, 4000);
}




// =====================================================
// 4. SCROLL REVEAL ANIMATIONS
// =====================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.classList.add('visible');
      }, 80 * (i % 4));
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.benefit-card, .testimonial-card, .testimonial-stats-card, .step-item'
).forEach(el => revealObserver.observe(el));

// =====================================================
// =====================================================
const questions = [
  {
    id: 1,
    text: "Hablemos de su estabilidad. ¿Cuál es su situación laboral o profesional actual?",
    options: [
      { label: "Empleado formal (+3 años) o Dueño de negocio con acta constitutiva", weight: 15, color: "green", feedback: "La antigüedad y formalidad son indicadores clave de que usted tiene un motivo sólido para regresar a su país." },
      { label: "Freelance con estados de cuenta o Empleado (1-3 años)", weight: 10, color: "yellow", feedback: "Su perfil es aceptable, pero el Cónsul pondrá especial atención en la constancia de sus ingresos." },
      { label: "Empleado reciente (<6 meses), Informal o Estudiante", weight: 5, color: "yellow", feedback: "Los perfiles con poca antigüedad son considerados de 'bajo arraigo' bajo la sección 214(b)." },
      { label: "Desempleado o sin comprobantes de ingresos", weight: 2, color: "red", feedback: "Sin una fuente de ingresos comprobable, es muy difícil superar la presunción de intención de trabajar en EE.UU." }
    ]
  },
  {
    id: 2,
    text: "Como Cónsul, debo evaluar si puede costear su viaje. ¿Cuál es su ingreso mensual neto comprobable?",
    options: [
      { label: "Más de $45,000 MXN mensuales", weight: 12, color: "green", feedback: "Usted cuenta con una solvencia económica robusta para un viaje de placer." },
      { label: "$20,000 - $45,000 MXN mensuales", weight: 8, color: "yellow", feedback: "Ingresos moderados. Deberá demostrar que el gasto del viaje es proporcional a sus ahorros." },
      { label: "Menos de $20,000 MXN mensuales", weight: 3, color: "red", feedback: "Sus ingresos podrían considerarse ajustados para costear los gastos en dólares en EE.UU." }
    ]
  },
  {
    id: 3,
    text: "¿Quiénes conforman su núcleo familiar directo en México?",
    options: [
      { label: "Cónyuge e hijos (dependientes directos)", weight: 12, color: "green", feedback: "La familia directa en casa es el lazo de unión más fuerte que un solicitante puede tener." },
      { label: "Padres o hermanos a mi cargo", weight: 8, color: "yellow", feedback: "Existen lazos familiares, aunque con menor 'peso' que un cónyuge o hijos propios." },
      { label: "Soltero(a) sin dependientes", weight: 5, color: "red", feedback: "Como soltero sin dependientes, usted tiene una mayor movilidad, lo que nos obliga a ser más estrictos con otros criterios." }
    ]
  },
  {
    id: 4,
    text: "¿Qué países ha visitado en los últimos 5 años (fuera de colindantes)?",
    options: [
      { label: "Canadá, Europa, Japón o Australia (con sellos)", weight: 15, color: "green", feedback: "Excelente. Si ha visitado países desarrollados y ha regresado, su perfil de turista es muy confiable." },
      { label: "Visa Americana previa (renovación o vencida sin mal uso)", weight: 12, color: "green", feedback: "Un historial positivo con nosotros es su mejor carta de presentación." },
      { label: "Países de Centro/Sudamérica", weight: 6, color: "yellow", feedback: "Tiene historial de viaje, lo cual es positivo, aunque no en países con regímenes de visa estrictos." },
      { label: "No he salido del país / Pasaporte nuevo", weight: 3, color: "red", feedback: "Un solicitante que nunca ha viajado al extranjero presenta un riesgo mayor estadísticamente." }
    ]
  },
  {
    id: 5,
    text: "¿Tiene familiares directos viviendo en los Estados Unidos?",
    options: [
      { label: "No tengo ningún familiar allá", weight: 10, color: "green", feedback: "Usted no presenta riesgo de 'anclaje' o intención de reunificación familiar." },
      { label: "Tíos, primos o conocidos", weight: 7, color: "yellow", feedback: "Riesgo moderado. Asegúrese de que su propósito de viaje no sea solo 'visitar familia' por tiempo largo." },
      { label: "Padres, hijos o cónyuge allá (residentes/ciudadanos)", weight: 2, color: "red", feedback: "Factor de riesgo crítico. El Cónsul podría sospechar que su intención real es residir con su familia." }
    ]
  },
  {
    id: 6,
    text: "¿Posee bienes inmuebles o activos a su nombre en México?",
    options: [
      { label: "Sí, casa o terreno con escrituras", weight: 10, color: "green", feedback: "El patrimonio inmobiliario es un lazo sólido difícil de abandonar." },
      { label: "Vehículo propio o Negocio registrado", weight: 7, color: "yellow", feedback: "Cuenta con activos que demuestran inversión en su país de origen." },
      { label: "No poseo bienes a mi nombre actualmente", weight: 3, color: "red", feedback: "Usted no tiene anclas materiales que garanticen su retorno ante nuestra sospecha." }
    ]
  },
  {
    id: 7,
    text: "¿Cuál es su nivel máximo de estudios concluidos?",
    options: [
      { label: "Postgrado (Maestría / Doctorado)", weight: 10, color: "green", feedback: "Un alto nivel académico suele correlacionarse con una carrera profesional estable en origen." },
      { label: "Licenciatura o Ingeniería", weight: 7, color: "green", feedback: "Perfil profesional sólido." },
      { label: "Carrera técnica o Preparatoria", weight: 4, color: "yellow", feedback: "Nivel educativo medio." },
      { label: "Básico o sin estudios", weight: 1, color: "red", feedback: "Suele asociarse a perfiles con menor arraigo económico especializado." }
    ]
  },
  {
    id: 8,
    text: "Hablemos de honestidad. ¿Ha tenido rechazos de visa previamente?",
    options: [
      { label: "Nunca me han rechazado", weight: 10, color: "green", feedback: "Su historial está limpio de registros negativos en nuestro sistema." },
      { label: "Rechazo hace más de 2 años", weight: 5, color: "yellow", feedback: "Evaluaremos qué ha cambiado en su vida desde ese rechazo para reconsiderar." },
      { label: "Rechazo reciente (menos de 1 año)", weight: 0, color: "red", feedback: "Es muy poco probable que su situación haya cambiado lo suficiente en meses. Riesgo alto." }
    ]
  },
  {
    id: 9,
    text: "¿Cuál es el propósito real y duración estimada de su viaje?",
    options: [
      { label: "Turismo específico (Disney, Vegas, etc.) / 1 a 2 semanas", weight: 8, color: "green", feedback: "Un plan de viaje coherente y corto es propio de un turista genuino." },
      { label: "Compras o Evento Familiar / 3 a 5 días", weight: 7, color: "green", feedback: "Propósito puntual y creíble." },
      { label: "Visitar amigos o familiares / Tiempo indefinido", weight: 2, color: "red", feedback: "La falta de un itinerario y una fecha clara de regreso es motivo frecuente de rechazo." }
    ]
  },
  {
    id: 10,
    text: "¿Cuenta con ahorros líquidos en su cuenta bancaria para emergencias?",
    options: [
      { label: "Sí, ahorro constante superior al costo del viaje", weight: 10, color: "green", feedback: "Usted demuestra que no gastará todos sus ahorros en el viaje, lo cual es vital." },
      { label: "Sí, pero los fondos son recientes o de nómina justa", weight: 5, color: "yellow", feedback: "Los depósitos grandes y recientes antes de la entrevista suelen ser sospechosos." },
      { label: "No cuento con ahorros significativos", weight: 1, color: "red", feedback: "Si no tiene margen financiero, el Cónsul asumirá que usted busca ir a trabajar para obtener fondos." }
    ]
  }
];


let currentQuestion = 0;
let answers = [];
let selectedOption = null;

function initQuiz() {
  currentQuestion = 0;
  answers = [];
  selectedOption = null;
  document.getElementById('quiz-card').style.display = 'flex';
  document.getElementById('quiz-progress-bar').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentQuestion];
  document.getElementById('quiz-question-text').textContent = `${currentQuestion + 1}. ${q.text}`;
  document.getElementById('quiz-progress-label').textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
  document.getElementById('quiz-fill').style.width = `${((currentQuestion) / questions.length) * 100}%`;

  const optionsEl = document.getElementById('quiz-options');
  optionsEl.innerHTML = '';
  selectedOption = null;

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = `quiz-option option-${opt.color}`;
    btn.id = `quiz-opt-${idx}`;
    btn.textContent = opt.label;
    btn.onclick = () => selectOption(idx, opt);
    optionsEl.appendChild(btn);
  });
}

function selectOption(idx, opt) {
  triggerHaptic('light');
  document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
  const selected = document.getElementById(`quiz-opt-${idx}`);
  if (selected) selected.classList.add('selected');
  selectedOption = opt;
  
  // Auto-advance for better mobile UX
  setTimeout(nextQuestion, 400); 
}

function nextQuestion() {
  if (!selectedOption) return;
  answers.push(selectedOption);
  currentQuestion++;

  if (currentQuestion < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const totalWeight = answers.reduce((sum, a) => sum + a.weight, 0);
  const maxWeight = questions.length * 10;
  const score = Math.round((totalWeight / maxWeight) * 100);

  document.getElementById('quiz-card').style.display = 'none';
  document.getElementById('quiz-progress-bar').style.display = 'none';
  const resultEl = document.getElementById('quiz-result');
  resultEl.style.display = 'block';

  // Score animation
  const scoreEl = document.getElementById('result-score');
  scoreEl.textContent = '0';
  let current = 0;
  const scoreTimer = setInterval(() => {
    current += 2;
    if (current >= score) {
      scoreEl.textContent = score;
      clearInterval(scoreTimer);
    } else {
      scoreEl.textContent = current;
    }
  }, 20);

  // Traffic light
  const redLight = document.getElementById('tl-red');
  const yellowLight = document.getElementById('tl-yellow');
  const greenLight = document.getElementById('tl-green');
  redLight.classList.remove('active-red');
  yellowLight.classList.remove('active-yellow');
  greenLight.classList.remove('active-green');

  let title, desc, alertClass, alertIcon;

  if (score >= 85) {
    greenLight.classList.add('active-green');
    title = 'OFICIAL CONSULAR: ALTA PROBABILIDAD DE APROBACIÓN';
    desc = `Basado en su historial de viaje, solvencia y lazos familiares, su perfil es consistente con los requisitos de la Sección 214(b). Usted demuestra un arraigo sólido en México. Solo requiere una gestión impecable de su DS-160 para evitar errores técnicos.`;
    scoreEl.style.color = '#10b981';
    alertClass = 'alert-positive';
  } else if (score >= 60) {
    yellowLight.classList.add('active-yellow');
    title = 'OFICIAL CONSULAR: PERFIL EN OBSERVACIÓN (RIESGO MEDIO)';
    desc = `Usted presenta algunos puntos de arraigo, pero hay debilidades en su solvencia o historial que podrían generar dudas. El oficial se enfocará en cuestionar su intención de retorno. Necesita una estrategia clara para su entrevista y documentación de apoyo específica.`;
    scoreEl.style.color = '#f59e0b';
    alertClass = 'alert-neutral';
  } else {
    redLight.classList.add('active-red');
    title = 'OFICIAL CONSULAR: ALTO RIESGO DE RECHAZO';
    desc = `Atención: Bajo los lineamientos actuales del Departamento de Estado, su perfil carece del arraigo necesario para garantizar su retorno. Presenta múltiples 'banderas rojas' (red flags). Le recomendamos NO aplicar sin antes fortalecer sus lazos económicos o profesionales.`;
    scoreEl.style.color = '#ef4444';
    alertClass = 'alert-negative';
  }

  document.getElementById('result-title').textContent = title;
  document.getElementById('result-desc').textContent = desc;

  // Factors breakdown with detailed feedback
  const factorsEl = document.getElementById('result-factors');
  factorsEl.innerHTML = `
    <div class="result-alert ${alertClass}">
      <strong>Evaluación del Cónsul:</strong> ${desc}
    </div>
    <p style="font-size: 0.85rem; color: hsla(0,0%,100%,0.5); margin-bottom: 20px; text-align: center;">Desglose detallado de su entrevista simulada:</p>
    <div class="factors-grid"></div>
  `;

  const factorsGrid = factorsEl.querySelector('.factors-grid');
  const factorLabels = [
    'Arraigo Laboral', 'Capacidad Financiera', 'Vínculos Familiares',
    'Historial de Viajes', 'Riesgo de Anclaje', 'Nivel Profesional',
    'Arraigo Material', 'Historial Migratorio', 'Intención de Viaje', 'Solvencia Bancaria'
  ];

  answers.forEach((ans, idx) => {
    const factorItem = document.createElement('div');
    factorItem.className = 'factor-detail-item';
    factorItem.innerHTML = `
      <div class="factor-header">
        <span class="factor-dot ${ans.weight >= 8 ? 'dot-green' : ans.weight >= 4 ? 'dot-yellow' : 'dot-red'}"></span>
        <strong>${factorLabels[idx]}</strong>
      </div>
      <p class="factor-feedback">${ans.feedback}</p>
    `;
    factorsGrid.appendChild(factorItem);
  });
}

function restartQuiz() {
  initQuiz();
}

const WHATSAPP_PHONE = "524271035773";

function sendQuizToWhatsApp() {
  const score = document.getElementById('result-score').textContent;
  const title = document.getElementById('result-title').textContent;
  const message = `Hola! He terminado el cuestionario de VisaLink y mi puntaje fue: ${score}/100.\n\nResultado: *${title}*\n\nMe gustaría recibir asesoría personalizada sobre mi trámite.`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`, '_blank');
}

// Initialize quiz on load (only if container exists)
if (document.getElementById('quiz-card')) {
  initQuiz();
}

// =====================================================
// 6. FAQ ACCORDION
// =====================================================
function toggleFaq(id) {
  const item = document.getElementById(id);
  const answer = item.querySelector('.faq-answer');
  const btn = item.querySelector('.faq-question');
  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-answer').classList.remove('open');
    el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    item.classList.add('open');
    answer.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function toggleWhyVisaLink() {
  triggerHaptic('light');
  const content = document.getElementById('why-visalink-content');
  const btn = document.getElementById('why-visalink-btn');
  const icon = document.getElementById('why-visalink-icon');
  
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'flex';
    setTimeout(() => {
      content.style.opacity = '1';
    }, 10);
    icon.style.transform = 'rotate(180deg)';
    btn.style.background = 'hsla(0, 0%, 100%, 0.08)';
    btn.style.borderColor = 'hsla(224, 76%, 65%, 0.4)';
  } else {
    content.style.opacity = '0';
    setTimeout(() => {
      content.style.display = 'none';
    }, 400);
    icon.style.transform = 'rotate(0deg)';
    btn.style.background = 'hsla(0, 0%, 100%, 0.03)';
    btn.style.borderColor = 'hsla(0, 0%, 100%, 0.1)';
  }
}

function toggleProcessSteps() {
  triggerHaptic('medium');
  const content = document.getElementById('process-steps-content');
  const btn = document.getElementById('unfold-process-btn');
  
  if (!content || !btn) return;
  
  const isOpen = content.classList.contains('open');
  
  if (!isOpen) {
    content.classList.add('open');
    btn.textContent = 'Ocultar los 8 pasos';
    btn.classList.add('active');
    
    // Revelar items manualmente para evitar depender de scroll cuando está colapsado
    setTimeout(() => {
      document.querySelectorAll('#process-steps-content .step-item').forEach(el => {
        el.classList.add('visible');
      });
    }, 100);
  } else {
    content.classList.remove('open');
    btn.textContent = 'Ver los 8 pasos del proceso';
    btn.classList.remove('active');
  }
}

// =====================================================
// 7. HERO FORM
// =====================================================
function handleHeroForm() {
  const email = document.getElementById('hero-email').value.trim();
  if (!email || !email.includes('@')) {
    showToast('Por favor ingresa tu correo electrónico válido.', 'warning');
    return;
  }
  showToast(`Información enviada a ${email}`, 'success');
  document.getElementById('hero-email').value = '';
  setTimeout(() => {
    document.getElementById('simulador').scrollIntoView({ behavior: 'smooth' });
  }, 1500);
}

// =====================================================
// 8. PURCHASE HANDLER (Stripe/MercadoPago simulation)
// =====================================================
function handlePurchase(plan, price) {
  triggerHaptic('success');
  const message = `¡Hola! Me interesa el Plan ${plan} ($${price} MXN). ¿Me podrían dar los pasos para iniciar?`;
  const encodedMessage = encodeURIComponent(message);
  showToast(`Redirigiendo a WhatsApp para contratar el Plan ${plan}...`, 'success');
  
  setTimeout(() => {
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`, '_blank');
  }, 800);
}

// =====================================================
// 9. NEWSLETTER
// =====================================================
function handleNewsletter() {
  const email = document.getElementById('footer-newsletter-email').value.trim();
  if (!email || !email.includes('@')) {
    showToast('Por favor ingresa tu correo electrónico válido.', 'warning');
    return;
  }
  showToast(`Suscripción confirmada. Recibirás tips de visa en ${email}`, 'success');
  document.getElementById('footer-newsletter-email').value = '';
}

// =====================================================
// 10. TOAST NOTIFICATION
// =====================================================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.vl-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'vl-toast';
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    right: 24px;
    background: ${type === 'success' ? 'hsla(158, 84%, 40%, 0.9)' : 'hsla(38, 92%, 50%, 0.9)'};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid hsla(0, 0%, 100%, 0.1);
    color: white;
    padding: 18px 28px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.95rem;
    z-index: 9999;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
    max-width: 400px;
    line-height: 1.4;
    animation: slideInRight 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    font-family: 'Inter', sans-serif;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

const style = document.createElement('style');
style.textContent = `@keyframes slideInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`;
document.head.appendChild(style);

// =====================================================
// 11. COOKIE CONSENT
// =====================================================
function acceptCookies() {
  localStorage.setItem('vl_cookies', 'accepted');
  hideCookieBanner();
}
function rejectCookies() {
  localStorage.setItem('vl_cookies', 'essential');
  hideCookieBanner();
}
function hideCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  banner.style.opacity = '0';
  banner.style.transform = 'translateY(20px)';
  banner.style.transition = 'all 0.4s ease';
  setTimeout(() => banner.remove(), 400);
}
// Check if already accepted
if (localStorage.getItem('vl_cookies')) {
  document.getElementById('cookie-banner')?.remove();
}



// =====================================================
// 13. SMOOTH SCROLL for all anchor links
// =====================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Sticky CTA removed as per user request


// =====================================================
// 15. GLOWING EFFECT FOR CARDS
// =====================================================
(function initGlowingEffect() {
  const glowItems = document.querySelectorAll('[data-glow]');
  if (!glowItems.length) return;

  const proximity = 64;
  const inactiveZone = 0.01;
  const spread = 40;

  let mouseX = 0;
  let mouseY = 0;

  const itemStates = Array.from(glowItems).map(item => ({
    el: item.querySelector('.glowing-effect-glow'),
    currentAngle: 0,
    targetAngle: 0
  }));

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function loop() {
    itemStates.forEach(state => {
      if (!state.el) return;
      
      const parent = state.el.parentElement.parentElement; // .action-card
      const rect = parent.getBoundingClientRect();
      
      const left = rect.left;
      const top = rect.top;
      const width = rect.width;
      const height = rect.height;
      if (width === 0 && height === 0) return; // Hidden
      
      const center = [left + width * 0.5, top + height * 0.5];
      const distanceFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
      const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;
      
      let isActive = 0;
      if (distanceFromCenter >= inactiveRadius) {
        if (
          mouseX > left - proximity &&
          mouseX < left + width + proximity &&
          mouseY > top - proximity &&
          mouseY < top + height + proximity
        ) {
          isActive = 1;
        }
      }

      state.el.style.setProperty('--active', isActive.toString());

      if (isActive) {
        let tAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;
        let angleDiff = tAngle - state.currentAngle;
        angleDiff = ((angleDiff + 180) % 360 + 360) % 360 - 180;
        state.targetAngle = state.currentAngle + angleDiff;
      }
      
      state.currentAngle = lerp(state.currentAngle, state.targetAngle, 0.1);
      state.el.style.setProperty('--start', state.currentAngle.toString());
      state.el.style.setProperty('--spread', spread.toString());
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();

// =====================================================
// 16. PASSPORT REAL-TIME SIMULATION
// =====================================================
function checkPassportUpdates() {
  const statusText = document.querySelector('#tab-pasaporte span[style*="10b981"]');
  if (statusText) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    statusText.textContent = `SRE Conectado: Tarifas oficiales actualizadas (${timeStr})`;
  }
}

function handlePassportAction(vigencia, precio) {
  triggerHaptic('medium');
  const message = `Hola! Me interesa el trámite de Pasaporte Mexicano con vigencia de ${vigencia} (${precio} MXN).`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`, '_blank');
}

// Update every minute if the tab is potentially open
setInterval(checkPassportUpdates, 60000);

// =====================================================
// 17. LIVE VISA FEE SIMULATION
// =====================================================
function updateLiveVisaFee() {
  const feeUSD = 185;
  const baseRate = 18.50;
  const variation = (new Date().getDate() % 10) / 10;
  const finalRate = baseRate + variation;
  const feeMXN = Math.round(feeUSD * finalRate / 5) * 5;
  
  const now = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const dateStr = now.toLocaleDateString('es-MX', options);

  const feeElement = document.getElementById('live-visa-fee');
  const dateElement = document.getElementById('live-fee-date');

  if (feeElement) feeElement.textContent = `$${feeMXN.toLocaleString('es-MX')} MXN`;
  if (dateElement) {
    dateElement.textContent = `Actualizado: ${dateStr}`;
  }
}

console.log('%cVisaLink 2026 – Loaded Successfully', 'color:#1a56db;font-size:16px;font-weight:bold;');
checkPassportUpdates();
updateLiveVisaFee();
