export type Language = "es" | "en";

export const translations = {
  es: {
    // NAVEGACIÓN Y ACCIONES COMUNES
    inicio: "Inicio",
    proyectos: "Proyectos",
    nosotros: "Nosotros",
    disena: "Diseña",
    blog: "Blog",
    contacto: "Contacto",
    spanish: "Español",
    english: "Inglés",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    view: "Ver",
    close: "Cerrar",
    open: "Abrir",
    yes: "Sí",
    no: "No",
    startProject: "Comenzar Proyecto",
    services: "Servicios",
    aboutUs: "Nosotros",
    contact: "Contacto",
    email: "Correo",
    phone: "Teléfono",
    office: "Oficina",
    firstName: "Nombre",
    lastName: "Apellido",
    firstNamePlaceholder: "Juan",
    lastNamePlaceholder: "Pérez",
    whyChooseUs: "¿Por qué Elegirnos?",
    messageError: "Error al enviar el mensaje. Por favor, intenta de nuevo.",

    // PÁGINA DE INICIO
    homeHeroTitle: "U2 Group es una incubadora de ideas arquitectónicas que desafían el status quo",
    homeHeroDescription: "Transformamos espacios en experiencias únicas que reflejan tu visión y estilo de vida",
    projectsSectionTitle: "Proyectos de U2 Group",
    projectsSectionDescription: "Descubre cómo transformamos ideas en realidades arquitectónicas excepcionales",
    viewAllProjects: "Ver Todos los Proyectos",
    calculatorTitle1: "Convierte cada metro cuadrado en",
    calculatorTitle2: "algo extraordinario",
    calculatorSubtitle1: "Comienza a construir el espacio de tus sueños desde",
    calculatorSubtitle2: "con U2 Group",
    calculatorPerM2: "por m²",
    calculatorButton: "Diseña conmigo",
    newsTitle: "Blogs",
    newsSubtitle: "Mantente al día con las últimas tendencias en arquitectura y diseño",
    readArticle: "Leer Artículo",
    interiorDesignCategory: "Diseño Interior",
    sustainabilityCategory: "Sostenibilidad",
    corporateCategory: "Corporativo",
    residentialCategory: "Residencial",
    viewAllArticles: "Ver Todos los Artículos",

    // PROYECTOS
    projectsTitle: "Nuestros Proyectos",
    projectsSubtitle: "Descubre cómo transformamos ideas en realidades arquitectónicas excepcionales",
    projectsHighlights: "Nuestros Destacados",
    aboutProject: "Sobre el Proyecto",
    mainFeatures: "Características Principales",
    moreProjects: "Más Proyectos",
    featuredProjects: "Proyectos Destacados",
    viewProjects: "Ver Proyectos",
    projectYear: "Año",
    projectLocation: "Ubicación",
    projectDescription: "Descripción",
    utilization: "Utilización",
    year: "Año",
    category: "Categoría",
    type: "Tipo",
    size: "Tamaño",
    location: "Ubicación",
    backToProjects: "Volver a Proyectos",
    errorLoadingProject: "Error al cargar el proyecto",
    projectGallery: "Galería del Proyecto",
    haveProject: "¿Tienes un proyecto en mente?",
    contactTeam: "Contáctanos y nuestro equipo te ayudará a hacerlo realidad",

    // BLOG
    blogTitle: "Nuestro Blog",
    blogSubtitle: "Explora nuestras últimas publicaciones sobre diseño y arquitectura",

    // CONTACTO
    contactTitle: "Contáctanos",
    contactSubtitle: "Estamos aquí para ayudarte con tu proyecto",
    getInTouch: "Ponte en Contacto",
    contactInfo: "Información de Contacto",
    fillForm: "Completa este formulario y nuestro equipo te contactará en 24 horas",
    emailAddress: "Correo Electrónico",
    emailPlaceholder: "juan@ejemplo.com",
    phoneNumber: "Número de Teléfono",
    phonePlaceholder: "+57 300 1234567",
    projectLocationPlaceholder: "Ciudad, País",
    projectTimeline: "Cronograma del Proyecto",
    selectTimeline: "Seleccionar cronograma",
    asap: "Lo antes posible",
    within3Months: "Dentro de 3 meses",
    within6Months: "Dentro de 6 meses",
    within1Year: "Dentro de 1 año",
    justPlanning: "Solo planeando",
    additionalComments: "Comentarios Adicionales",
    commentsPlaceholder: "Cuéntanos más sobre tu proyecto...",
    sendMessageButton: "Enviar Mensaje",
    sendingMessage: "Enviando mensaje...",
    messageSent: "¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo en las próximas 24 horas.",
    
    // POR QUÉ ELEGIRNOS
    moreThan4Years: "Más de 4 años de experiencia",
    customDesigns: "Diseños personalizados",
    professionalTeam: "Equipo profesional",
    response24h: "Respuesta en 24h",

    // DISEÑO
    designTitle: "Diseña tu espacio",
    designSubtitle: "Personaliza cada detalle de tu proyecto",
    designCost: "Costo del Diseño",
    getYourQuote: "Obtén tu Cotización",
    readyToStart: "¿Listo para comenzar tu proyecto?",
    defaultView: "Vista por defecto",
    customView: "Vista personalizada",
    areaCompleted: "completado del área adicional",
    chooseThe: "Elige los",
    area: "Área",
    add: "Agregar",
    remove: "Quitar",
    maxUnitsExceeded: "Excediste el máximo permitido para este servicio ({{max}})",
    suggestionsTitle: "Sugerencias para llenar el área",
    suggestionsDescription: "Selecciona productos que caben en el área restante",
    noSuggestionsAvailable: "No hay más productos que quepan en el área restante. Puedes disminuir el área restante o aumentar el área total.",
    decreaseRemainingArea: "Disminuir área restante",
    increaseTotalArea: "Aumentar área total",
    areaExceededAlert: "Has excedido el área total disponible. Reduce la selección o ajusta el área para poder cotizar.",
    turnEverySquareMeter: "Convierte cada metro cuadrado en",
    somethingExtraordinary: "algo extraordinario",
    startBuildingYourDreamSpaceStartingFrom: "Comienza a construir el espacio de tus sueños desde",
    withU2Group: "con U2 Group",
    usdPerM2: "USD por m²",
    "Design Your Project": "Diseña tu Proyecto",
    totalServices: "Total servicios",
    totalArea: "Total área",
    gmailForInvoice: "Correo Gmail para recibir la factura:",
    sending: "Enviando...",
    sendInvoice: "Enviar factura",
    invoiceError: "No se pudo enviar la factura. Verifica el correo o intenta de nuevo.",
    invoiceSent: "¡Factura enviada correctamente!",

    // PÁGINA NOSOTROS
    heroTitle: "U2 Group: Diseño Arquitectónico con Propósito",
    heroDescription1: "Somos un equipo apasionado de arquitectos y diseñadores comprometidos con la creación de espacios que inspiran y transforman vidas.",
    heroDescription2: "Nuestra misión es convertir tus sueños en realidades arquitectónicas excepcionales, combinando innovación, sostenibilidad y diseño centrado en el usuario.",
    mission: "Nuestra Misión",
    vision: "Nuestra Visión",
    missionDescription: "Transformar espacios en experiencias únicas que reflejen la visión y el estilo de vida de nuestros clientes, a través de un diseño arquitectónico innovador y sostenible.",
    visionDescription: "Ser reconocidos globalmente como líderes en diseño arquitectónico innovador, creando espacios que inspiran y mejoran la vida de las personas.",
    
    whatWeDo: "Lo que Hacemos",
    whatWeDoDescription: "Combinamos creatividad, tecnología y experiencia para ofrecer soluciones arquitectónicas excepcionales.",
    weSpecialize: "Nos Especializamos",
    weSpecializeDescription: "En diseño arquitectónico residencial y comercial, con un enfoque en la sostenibilidad y la innovación.",
    globalVision: "Visión Global",
    globalVisionDescription: "Aplicamos las mejores prácticas internacionales adaptadas a las necesidades locales.",
    noGuesswork: "Sin Improvisación",
    noGuessworkDescription: "Cada proyecto se basa en investigación, planificación detallada y metodologías probadas.",
    realTeam: "Equipo Real",
    realTeamDescription: "Un equipo dedicado de profesionales comprometidos con la excelencia en cada proyecto.",
    
    // Valores
    creativity: "Creatividad",
    sustainability: "Sostenibilidad",
    quality: "Calidad",
    innovation: "Innovación",
    clientCentric: "Centrado en el Cliente",
    integrity: "Integridad",
    collaboration: "Colaboración",
    attentionToDetail: "Atención al Detalle",
    flexibility: "Flexibilidad",
    
    // Tooltips de Valores
    creativityTooltip: "Exploramos soluciones únicas y originales para cada proyecto.",
    sustainabilityTooltip: "Comprometidos con prácticas de diseño ecológicas y sostenibles.",
    qualityTooltip: "Excelencia en cada detalle y aspecto del proyecto.",
    innovationTooltip: "Incorporamos las últimas tecnologías y tendencias en diseño.",
    clientCentricTooltip: "Tu visión y necesidades son nuestra prioridad.",
    integrityTooltip: "Transparencia y honestidad en todo lo que hacemos.",
    collaborationTooltip: "Trabajamos juntos para lograr resultados excepcionales.",
    attentionToDetailTooltip: "Cuidado meticuloso en cada aspecto del diseño.",
    flexibilityTooltip: "Nos adaptamos a tus necesidades y requerimientos.",
    
    // Proceso
    howWeDo: "Cómo lo Hacemos",
    weListen: "Escuchamos",
    weListenDescription: "No tomamos decisiones hasta que tu visión esté clara.",
    weCreateConcept: "Creamos el Concepto",
    weCreateConceptDescription: "Aquí comienza la magia: combinamos función, estética y emoción en un concepto único. Cada detalle surge de tus necesidades reales. Sin plantillas, solo propósito.",
    youVisualize3D: "Visualizas en 3D",
    youVisualize3DDescription: "Con nuestros renders hiperrealistas, recorrerás y sentirás tu espacio antes de que se coloque un solo ladrillo. Así tomas decisiones con claridad y confianza.",
    weBuildWithYou: "Construimos Contigo",
    weBuildWithYouDescription: "Desde los planos hasta los acabados, eres parte de cada paso. Te guiamos, te mantenemos informado y caminamos contigo. Tu espacio no se construye solo, se construye contigo.",
    
    // FUNDADORES
    meetTheFounders: "Conoce a los Fundadores",
    founders: "fundadores",
    coFounderArchitect: "Co-Fundadora y Arquitecta",
    coFounderIndustrialDesigner: "Co-Fundador y Diseñador Industrial",
    
    // CATEGORÍAS DE DISEÑO
    basicSpaces: "Espacios básicos",
    homeFunction: "Funcionalidad del hogar",
    workAndCreativity: "Trabajo & Creatividad",
    wellnessAndHealth: "Bienestar & Salud",
    natureAndSustainability: "Naturaleza & Sustentabilidad",
    entertainmentAndSocial: "Entretenimiento & Social",
    
    // MENSAJES DE ESTADO
    noBlogs: "No hay blogs disponibles",
    designAreaTitle: "Área de diseño:",
    
    // POLÍTICA DE PRIVACIDAD
    privacyTitle: "Política de Privacidad",
    privacyLastUpdate: "Última actualización: Marzo 2023",
    privacyIntro: "En U2 Group, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe cómo recopilamos, usamos y protegemos tu información.",
    
    // Alcance
    privacyScope: "Alcance de la Política",
    "privacyScopeItems.website": "Sitio web de U2 Group",
    "privacyScopeItems.plans": "Planes y servicios arquitectónicos",
    "privacyScopeItems.design": "Servicios de diseño",
    "privacyScopeItems.data": "Gestión de datos del cliente",
    
    // Cumplimiento
    privacyCompliance: "Cumplimiento Normativo",
    "privacyComplianceItems.gdpr": "Reglamento General de Protección de Datos (GDPR)",
    "privacyComplianceItems.ccpa": "Ley de Privacidad del Consumidor de California (CCPA)",
    "privacyComplianceItems.uk": "Ley de Protección de Datos del Reino Unido",
    "privacyComplianceItems.pipeda": "PIPEDA (Canadá)",
    "privacyComplianceItems.colombia": "Ley de Protección de Datos Personales de Colombia",
    
    // Datos Recolectados
    privacyDataCollected: "Datos que Recolectamos",
    "privacyDataTable.category": "Categoría",
    "privacyDataTable.examples": "Ejemplos",
    "privacyDataTable.howCollected": "Cómo lo Recolectamos",
    "privacyDataTable.howWeUse": "Cómo lo Usamos",
    
    // Categorías de Datos
    "privacyDataTable.identifiers": "Identificadores",
    "privacyDataTable.identifiersExamples": "Nombre, correo electrónico, teléfono",
    "privacyDataTable.identifiersHow": "Formularios de registro y contacto",
    
    "privacyDataTable.billing": "Facturación",
    "privacyDataTable.billingExamples": "Información de pago, dirección de facturación",
    "privacyDataTable.billingHow": "Proceso de pago y facturación",
    
    "privacyDataTable.projectData": "Datos del Proyecto",
    "privacyDataTable.projectDataExamples": "Planos, diseños, especificaciones",
    "privacyDataTable.projectDataHow": "Subida de archivos y formularios de proyecto",
    
    "privacyDataTable.siteUsage": "Uso del Sitio",
    "privacyDataTable.siteUsageExamples": "Páginas visitadas, tiempo de sesión",
    "privacyDataTable.siteUsageHow": "Cookies y análisis de uso",
    
    "privacyDataTable.communications": "Comunicaciones",
    "privacyDataTable.communicationsExamples": "Historial de mensajes, preferencias",
    "privacyDataTable.communicationsHow": "Chat, correos y formularios de contacto",
    
    // POLÍTICA DE PRIVACIDAD - Navegación
    backToHome: "Volver al Inicio",
    viewCookiePolicy: "Ver Política de Cookies",
    
    // POLÍTICA DE COOKIES
    cookiesTitle: "Política de Cookies",
    cookiesLastUpdate: "Última actualización: Marzo 2023",
    cookiesWhatAre: "¿Qué son las Cookies?",
    cookiesWhatAreDesc: "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a mejorar tu experiencia y a entender cómo utilizas nuestros servicios.",
    cookiesTypes: "Tipos de Cookies que Utilizamos",
    cookiesFunctional: "Cookies Funcionales",
    cookiesFunctionalDesc: "Necesarias para el funcionamiento básico del sitio. Permiten la navegación y el uso de funciones esenciales.",
    cookiesAnalytics: "Cookies Analíticas",
    cookiesAnalyticsDesc: "Nos ayudan a entender cómo interactúas con nuestro sitio, permitiéndonos mejorar su rendimiento y funcionalidad.",
    cookiesAds: "Cookies de Publicidad",
    cookiesAdsDesc: "Utilizadas para mostrarte contenido relevante y medir la efectividad de nuestras campañas publicitarias.",
    cookiesDataCollected: "Datos Recopilados por las Cookies",
    cookiesDataIP: "Dirección IP (anónima)",
    cookiesDataPages: "Páginas visitadas y patrones de navegación",
    cookiesDataPrefs: "Preferencias y configuraciones del usuario",
    cookiesConsent: "Tu Consentimiento",
    cookiesConsentDesc: "Al usar nuestro sitio, aceptas el uso de cookies según lo descrito en esta política. Puedes ajustar la configuración de tu navegador para rechazar cookies, aunque esto podría afectar algunas funcionalidades del sitio.",
    cookiesRevokeConsent: "Revocar Consentimiento",
    cookiesMoreInfo: "Más Información",
    cookiesMoreInfoDesc: "Para más detalles, consulta nuestra",
    cookiesPrivacyPolicy: "Política de Privacidad",
    cookiesOrWriteUs: "o escríbenos a",
    cookieBannerText: "Este sitio usa cookies para mejorar tu experiencia.",
    cookieBannerReadMore: "Leer más",
    cookieBannerAccept: "Aceptar",

    // FOOTER
    privacyPolicy: "Política de Privacidad",
    architecturalDesign: "Diseño Arquitectónico",
    consulting: "Consultoría",
    company: "Empresa",
    adminPanel: "Panel Admin",
    allRightsReserved: "Todos los derechos reservados",
    followUs: "Síguenos",
    developedBy: "Desarrollado por Zare, Jara y Pedroza",
  },
  en: {
    // NAVIGATION AND COMMON ACTIONS
    inicio: "Home",
    proyectos: "Projects",
    nosotros: "About Us",
    disena: "Design",
    blog: "Blog",
    contacto: "Contact",
    spanish: "Spanish",
    english: "English",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    startProject: "Start Project",
    services: "Services",
    aboutUs: "About Us",
    contact: "Contact",
    email: "Email",
    phone: "Phone",
    office: "Office",
    firstName: "First Name",
    lastName: "Last Name",
    firstNamePlaceholder: "John",
    lastNamePlaceholder: "Doe",
    whyChooseUs: "Why Choose Us?",
    messageError: "Error sending message. Please try again.",

    // HOME PAGE
    homeHeroTitle: "U2 Group is an incubator of architectural ideas that challenge the status quo",
    homeHeroDescription: "We transform spaces into unique experiences that reflect your vision and lifestyle",
    projectsSectionTitle: "U2 Group Projects",
    projectsSectionDescription: "Discover how we turn ideas into exceptional architectural realities",
    viewAllProjects: "View All Projects",
    calculatorTitle1: "Turn every square meter into",
    calculatorTitle2: "something extraordinary",
    calculatorSubtitle1: "Start building the space of your dreams from",
    calculatorSubtitle2: "with U2 Group",
    calculatorPerM2: "per m²",
    calculatorButton: "Design with me",
    newsTitle: "Blogs",
    newsSubtitle: "Stay up to date with the latest trends in architecture and design",
    readArticle: "Read Article",
    interiorDesignCategory: "Interior Design",
    sustainabilityCategory: "Sustainability",
    corporateCategory: "Corporate",
    residentialCategory: "Residential",
    viewAllArticles: "View All Articles",

    // PROJECTS
    projectsTitle: "U2 Group Projects",
    projectsSubtitle: "Discover how we turn ideas into exceptional architectural realities",
    projectsHighlights: "Our Highlights",
    aboutProject: "About the Project",
    mainFeatures: "Main Features",
    moreProjects: "More Projects",
    featuredProjects: "Featured Projects",
    viewProjects: "View Projects",
    projectYear: "Year",
    projectLocation: "Location",
    projectDescription: "Description",
    utilization: "Utilization",
    year: "Year",
    category: "Category",
    type: "Type",
    size: "Size",
    location: "Location",
    backToProjects: "Back to Projects",
    errorLoadingProject: "Error loading project",
    projectGallery: "Project Gallery",
    haveProject: "Do you have a project in mind?",
    contactTeam: "Contact us and our team will help you make it a reality",

    // BLOG
    blogTitle: "Our Blog",
    blogSubtitle: "Explore our latest posts on design and architecture",

    // CONTACT
    contactTitle: "Contact Us",
    contactSubtitle: "We're here to help you with your project",
    getInTouch: "Get in Touch",
    contactInfo: "Contact Information",
    fillForm: "Complete this form and our team will contact you within 24 hours",
    emailAddress: "Email Address",
    emailPlaceholder: "john@example.com",
    phoneNumber: "Phone Number",
    phonePlaceholder: "+1 234 5678 900",
    projectLocationPlaceholder: "City, Country",
    projectTimeline: "Project Timeline",
    selectTimeline: "Select timeline",
    asap: "As soon as possible",
    within3Months: "Within 3 months",
    within6Months: "Within 6 months",
    within1Year: "Within 1 year",
    justPlanning: "Just planning",
    additionalComments: "Additional Comments",
    commentsPlaceholder: "Tell us more about your project...",
    sendMessageButton: "Send Message",
    sendingMessage: "Sending message...",
    messageSent: "Message sent successfully! We will contact you within the next 24 hours.",
    
    // WHY CHOOSE US
    moreThan4Years: "More than 4 years of experience",
    customDesigns: "Custom designs",
    professionalTeam: "Professional team",
    response24h: "24h response",

    // DESIGN
    designTitle: "Design your space",
    designSubtitle: "Customize every detail of your project",
    designCost: "Design Cost",
    getYourQuote: "Get Your Quote",
    readyToStart: "Ready to start your project?",
    defaultView: "Default view",
    customView: "Custom view",
    areaCompleted: "completed of additional area",
    chooseThe: "Choose the",
    area: "Area",
    add: "Add",
    remove: "Remove",
    maxUnitsExceeded: "You exceeded the maximum allowed for this service ({{max}})",
    suggestionsTitle: "Suggestions to fill the area",
    suggestionsDescription: "Select products that fit in the remaining area",
    noSuggestionsAvailable: "No more products fit in the remaining area. You can decrease the remaining area or increase the total area.",
    decreaseRemainingArea: "Decrease remaining area",
    increaseTotalArea: "Increase total area",
    areaExceededAlert: "You have exceeded the total available area. Reduce the selection or adjust the area to be able to quote.",
    turnEverySquareMeter: "Turn every square meter into",
    somethingExtraordinary: "something extraordinary",
    startBuildingYourDreamSpaceStartingFrom: "Start building the space of your dreams from",
    withU2Group: "with U2 Group",
    usdPerM2: "USD per m²",
    "Design Your Project": "Design Your Project",
    totalServices: "Total services",
    totalArea: "Total area",
    gmailForInvoice: "Gmail to receive invoice:",
    sending: "Sending...",
    sendInvoice: "Send invoice",
    invoiceError: "Could not send invoice. Check email or try again.",
    invoiceSent: "Invoice sent successfully!",

    // ABOUT US PAGE
    heroTitle: "U2 Group: Architectural Design with Purpose",
    heroDescription1: "We are a passionate team of architects and designers committed to creating spaces that inspire and transform lives.",
    heroDescription2: "Our mission is to turn your dreams into exceptional architectural realities, combining innovation, sustainability, and user-centered design.",
    mission: "Our Mission",
    vision: "Our Vision",
    missionDescription: "Transform spaces into unique experiences that reflect our clients' vision and lifestyle through innovative and sustainable architectural design.",
    visionDescription: "To be globally recognized as leaders in innovative architectural design, creating spaces that inspire and improve people's lives.",
    
    whatWeDo: "What We Do",
    whatWeDoDescription: "We combine creativity, technology, and experience to deliver exceptional architectural solutions.",
    weSpecialize: "We Specialize",
    weSpecializeDescription: "In residential and commercial architectural design, with a focus on sustainability and innovation.",
    globalVision: "Global Vision",
    globalVisionDescription: "We apply the best international practices adapted to local needs.",
    noGuesswork: "No Guesswork",
    noGuessworkDescription: "Every project is based on research, detailed planning, and proven methodologies.",
    realTeam: "Real Team",
    realTeamDescription: "A dedicated team of professionals committed to excellence in every project.",
    
    // Values
    creativity: "Creativity",
    sustainability: "Sustainability",
    quality: "Quality",
    innovation: "Innovation",
    clientCentric: "Client Centric",
    integrity: "Integrity",
    collaboration: "Collaboration",
    attentionToDetail: "Attention to Detail",
    flexibility: "Flexibility",
    
    // Value Tooltips
    creativityTooltip: "We explore unique and original solutions for each project.",
    sustainabilityTooltip: "Committed to eco-friendly and sustainable design practices.",
    qualityTooltip: "Excellence in every detail and aspect of the project.",
    innovationTooltip: "We incorporate the latest technologies and design trends.",
    clientCentricTooltip: "Your vision and needs are our priority.",
    integrityTooltip: "Transparency and honesty in everything we do.",
    collaborationTooltip: "We work together to achieve exceptional results.",
    attentionToDetailTooltip: "Meticulous care in every aspect of design.",
    flexibilityTooltip: "We adapt to your needs and requirements.",
    
    // Process
    howWeDo: "How We Do It",
    weListen: "We Listen",
    weListenDescription: "We don't make decisions until your vision is clear.",
    weCreateConcept: "We Create the Concept",
    weCreateConceptDescription: "This is where the magic begins: we combine function, aesthetics, and emotion in a unique concept. Every detail emerges from your real needs. No templates, just purpose.",
    youVisualize3D: "You Visualize in 3D",
    youVisualize3DDescription: "With our hyperrealistic renders, you'll walk through and feel your space before a single brick is laid. This way you make decisions with clarity and confidence.",
    weBuildWithYou: "We Build With You",
    weBuildWithYouDescription: "From blueprints to finishes, you're part of every step. We guide you, keep you informed, and walk with you. Your space isn't built alone, it's built with you.",
    
    // FOUNDERS
    meetTheFounders: "Meet the Founders",
    founders: "founders",
    coFounderArchitect: "Co-Founder and Architect",
    coFounderIndustrialDesigner: "Co-Founder and Industrial Designer",
    
    // DESIGN CATEGORIES
    basicSpaces: "Basic spaces",
    homeFunction: "Home functionality",
    workAndCreativity: "Work & Creativity",
    wellnessAndHealth: "Wellness & Health",
    natureAndSustainability: "Nature & Sustainability",
    entertainmentAndSocial: "Entertainment & Social",
    
    // STATUS MESSAGES
    noBlogs: "No blogs available",
    designAreaTitle: "Design area:",
    
    // PRIVACY POLICY
    privacyTitle: "Privacy Policy",
    privacyLastUpdate: "Last updated: March 2023",
    privacyIntro: "At U2 Group, we take our users' privacy seriously. This policy describes how we collect, use, and protect your information.",
    
    // Scope
    privacyScope: "Policy Scope",
    "privacyScopeItems.website": "U2 Group website",
    "privacyScopeItems.plans": "Architectural plans and services",
    "privacyScopeItems.design": "Design services",
    "privacyScopeItems.data": "Client data management",
    
    // Compliance
    privacyCompliance: "Regulatory Compliance",
    "privacyComplianceItems.gdpr": "General Data Protection Regulation (GDPR)",
    "privacyComplianceItems.ccpa": "California Consumer Privacy Act (CCPA)",
    "privacyComplianceItems.uk": "UK Data Protection Act",
    "privacyComplianceItems.pipeda": "PIPEDA (Canada)",
    "privacyComplianceItems.colombia": "Colombian Personal Data Protection Law",
    
    // Collected Data
    privacyDataCollected: "Data We Collect",
    "privacyDataTable.category": "Category",
    "privacyDataTable.examples": "Examples",
    "privacyDataTable.howCollected": "How We Collect It",
    "privacyDataTable.howWeUse": "How We Use It",
    
    // Data Categories
    "privacyDataTable.identifiers": "Identifiers",
    "privacyDataTable.identifiersExamples": "Name, email, phone",
    "privacyDataTable.identifiersHow": "Registration and contact forms",
    
    "privacyDataTable.billing": "Billing",
    "privacyDataTable.billingExamples": "Payment information, billing address",
    "privacyDataTable.billingHow": "Payment and billing process",
    
    "privacyDataTable.projectData": "Project Data",
    "privacyDataTable.projectDataExamples": "Plans, designs, specifications",
    "privacyDataTable.projectDataHow": "File uploads and project forms",
    
    "privacyDataTable.siteUsage": "Site Usage",
    "privacyDataTable.siteUsageExamples": "Pages visited, session time",
    "privacyDataTable.siteUsageHow": "Cookies and usage analytics",
    
    "privacyDataTable.communications": "Communications",
    "privacyDataTable.communicationsExamples": "Message history, preferences",
    "privacyDataTable.communicationsHow": "Chat, emails, and contact forms",
    
    // PRIVACY POLICY - Navigation
    backToHome: "Back to Home",
    viewCookiePolicy: "View Cookie Policy",
    
    // COOKIES POLICY
    cookiesTitle: "Cookies Policy",
    cookiesLastUpdate: "Last updated: March 2023",
    cookiesWhatAre: "What are Cookies?",
    cookiesWhatAreDesc: "Cookies are small text files stored on your device when you visit our website. They help us improve your experience and understand how you use our services.",
    cookiesTypes: "Types of Cookies We Use",
    cookiesFunctional: "Functional Cookies",
    cookiesFunctionalDesc: "Required for basic site functionality. They enable navigation and essential features.",
    cookiesAnalytics: "Analytics Cookies",
    cookiesAnalyticsDesc: "Help us understand how you interact with our site, allowing us to improve its performance and functionality.",
    cookiesAds: "Advertising Cookies",
    cookiesAdsDesc: "Used to show you relevant content and measure the effectiveness of our advertising campaigns.",
    cookiesDataCollected: "Data Collected by Cookies",
    cookiesDataIP: "IP Address (anonymized)",
    cookiesDataPages: "Pages visited and browsing patterns",
    cookiesDataPrefs: "User preferences and settings",
    cookiesConsent: "Your Consent",
    cookiesConsentDesc: "By using our site, you accept the use of cookies as described in this policy. You can adjust your browser settings to reject cookies, although this may affect some site functionalities.",
    cookiesRevokeConsent: "Revoke Consent",
    cookiesMoreInfo: "More Information",
    cookiesMoreInfoDesc: "For more details, check our",
    cookiesPrivacyPolicy: "Privacy Policy",
    cookiesOrWriteUs: "or write to us at",
    cookieBannerText: "This site uses cookies to improve your experience.",
    cookieBannerReadMore: "Read more",
    cookieBannerAccept: "Accept",

    // MARKETPLACE
    productos: "Products",
    carrito: "Cart",
    ordenes: "Orders",
    favoritos: "Favorites",
    ajustes: "Settings",
    conectado_como: "Connected as",
    salir: "Logout",
    iniciar_sesion: "Login",
    cerrar_sesion: "Logout",
    mi_cuenta: "My account",
    mis_pedidos: "My orders",
    mis_favoritos: "My favorites",
    agregar_al_carrito: "Add to cart",
    quitar_del_carrito: "Remove from cart",
    ver_producto: "View product",
    precio: "Price",
    cantidad: "Quantity",
    total: "Total",
    
    // AUTHENTICATION MARKETPLACE
    login_required: "Login required",
    acceso_requerido: "Access Required",
    login_to_view_plan: "Sign in to access all details and options for this architectural plan",
    login_to_add_cart: "Sign in to add products to your shopping cart",
    login_to_add_favorites: "Sign in to save products to your favorites",
    crear_cuenta: "Create New Account",
    login_benefits: "By creating an account you can save favorites, access complete plans and make purchases.",

    // MARKETPLACE
    productos: "Productos",
    carrito: "Carrito",
    ordenes: "Órdenes",
    favoritos: "Favoritos",
    ajustes: "Ajustes",
    conectado_como: "Conectado como",
    salir: "Salir",
    iniciar_sesion: "Iniciar sesión",
    cerrar_sesion: "Cerrar sesión",
    mi_cuenta: "Mi cuenta",
    mis_pedidos: "Mis pedidos",
    mis_favoritos: "Mis favoritos",
    agregar_al_carrito: "Agregar al carrito",
    quitar_del_carrito: "Quitar del carrito",
    ver_producto: "Ver producto",
    precio: "Precio",
    cantidad: "Cantidad",
    total: "Total",
    confirmar_compra: "Confirmar compra",
    procesar_pago: "Procesar pago",
    carrito_vacio: "Tu carrito está vacío",
    no_hay_productos: "No hay productos disponibles",
    buscar_productos: "Buscar productos",
    filtrar_por: "Filtrar por",
    ordenar_por: "Ordenar por",
    precio_mas_bajo: "Precio más bajo",
    precio_mas_alto: "Precio más alto",
    mas_reciente: "Más reciente",
    mas_antiguo: "Más antiguo",
    nombre_a_z: "Nombre A-Z",
    nombre_z_a: "Nombre Z-A",
    
    // AUTENTICACIÓN MARKETPLACE
    login_required: "Iniciar sesión requerido",
    acceso_requerido: "Acceso Requerido",
    login_to_view_plan: "Inicia sesión para acceder a todos los detalles y opciones de este plano arquitectónico",
    login_to_add_cart: "Inicia sesión para agregar productos a tu carrito de compras",
    login_to_add_favorites: "Inicia sesión para guardar productos en tus favoritos",
    crear_cuenta: "Crear Cuenta Nueva",
    login_benefits: "Al crear una cuenta podrás guardar favoritos, acceder a planos completos y realizar compras.",
    login_success: "¡Sesión iniciada correctamente!",
    login_error: "Credenciales inválidas. Por favor, intenta de nuevo.",
    register_here: "Crear cuenta",
    no_account: "¿No tienes una cuenta?",
    forgot_password: "¿Olvidaste tu contraseña?",
    email_placeholder: "tu@email.com",
    password_placeholder: "Tu contraseña",
    login_button: "Iniciar Sesión",
    login_loading: "Iniciando sesión...",

    // FOOTER
    privacyPolicy: "Privacy Policy",
    architecturalDesign: "Architectural Design",
    consulting: "Consulting",
    company: "Company",
    adminPanel: "Admin Panel",
    allRightsReserved: "All rights reserved",
    followUs: "Follow us",
    developedBy: "Developed by Pedroza, Zare and Jara",
  },

  en: {
    // NAVEGACIÓN Y ACCIONES COMUNES
    inicio: "Home",
    proyectos: "Projects",
    nosotros: "About Us",
    disena: "Design",
    blog: "Blog",
    contacto: "Contact",
    spanish: "Spanish",
    english: "English",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    view: "View",
    close: "Close",
    open: "Open",
    yes: "Yes",
    no: "No",
    startProject: "Start Project",
    services: "Services",
    aboutUs: "About Us",

    contact: "Contact",

    email: "Email",

    phone: "Phone",

    office: "Office",

    firstName: "First Name",

    lastName: "Last Name",

    firstNamePlaceholder: "John",

    lastNamePlaceholder: "Doe",

    whyChooseUs: "Why Choose Us?",

    messageError: "Error sending message. Please try again.",



    // HOME PAGE

    homeHeroTitle: "U2 Group is an incubator of architectural ideas that challenge the status quo",

    homeHeroDescription: "We transform spaces into unique experiences that reflect your vision and lifestyle",

    projectsSectionTitle: "U2 Group Projects",

    projectsSectionDescription: "Discover how we turn ideas into exceptional architectural realities",

    viewAllProjects: "View All Projects",

    calculatorTitle1: "Turn every square meter into",

    calculatorTitle2: "something extraordinary",

    calculatorSubtitle1: "Start building the space of your dreams from",

    calculatorSubtitle2: "with U2 Group",

    calculatorPerM2: "per m²",

    calculatorButton: "Design with me",

    newsTitle: "Blogs",

    newsSubtitle: "Stay up to date with the latest trends in architecture and design",

    readArticle: "Read Article",

    interiorDesignCategory: "Interior Design",

    sustainabilityCategory: "Sustainability",

    corporateCategory: "Corporate",

    residentialCategory: "Residential",

    viewAllArticles: "View All Articles",



    // PROJECTS

    projectsTitle: "U2 Group Projects",

    projectsSubtitle: "Discover how we turn ideas into exceptional architectural realities",

    projectsHighlights: "Our Highlights",

    aboutProject: "About the Project",

    mainFeatures: "Main Features",

    moreProjects: "More Projects",

    featuredProjects: "Featured Projects",

    viewProjects: "View Projects",

    projectYear: "Year",

    projectLocation: "Location",

    projectDescription: "Description",

    utilization: "Utilization",

    year: "Year",

    category: "Category",

    type: "Type",

    size: "Size",

    location: "Location",

    backToProjects: "Back to Projects",

    errorLoadingProject: "Error loading project",

    projectGallery: "Project Gallery",

    haveProject: "Do you have a project in mind?",

    contactTeam: "Contact us and our team will help you make it a reality",



    // BLOG

    blogTitle: "Our Blog",

    blogSubtitle: "Explore our latest posts on design and architecture",



    // CONTACT

    contactTitle: "Contact Us",

    contactSubtitle: "We're here to help you with your project",

    getInTouch: "Get in Touch",

    contactInfo: "Contact Information",

    fillForm: "Complete this form and our team will contact you within 24 hours",

    emailAddress: "Email Address",

    emailPlaceholder: "john@example.com",

    phoneNumber: "Phone Number",

    phonePlaceholder: "+1 234 5678 900",

    projectLocationPlaceholder: "City, Country",

    projectTimeline: "Project Timeline",

    selectTimeline: "Select timeline",

    asap: "As soon as possible",

    within3Months: "Within 3 months",

    within6Months: "Within 6 months",

    within1Year: "Within 1 year",

    justPlanning: "Just planning",

    additionalComments: "Additional Comments",

    commentsPlaceholder: "Tell us more about your project...",

    sendMessageButton: "Send Message",

    sendingMessage: "Sending message...",

    messageSent: "Message sent successfully! We will contact you within the next 24 hours.",

    

    // WHY CHOOSE US

    moreThan4Years: "More than 4 years of experience",

    customDesigns: "Custom designs",

    professionalTeam: "Professional team",

    response24h: "24h response",



    // DESIGN

    designTitle: "Design your space",

    designSubtitle: "Customize every detail of your project",

    designCost: "Design Cost",

    getYourQuote: "Get Your Quote",

    readyToStart: "Ready to start your project?",

    defaultView: "Default view",

    customView: "Custom view",

    areaCompleted: "completed of additional area",

    chooseThe: "Choose the",

    area: "Area",

    add: "Add",

    remove: "Remove",

    maxUnitsExceeded: "You exceeded the maximum allowed for this service ({{max}})",

    suggestionsTitle: "Suggestions to fill the area",

    suggestionsDescription: "Select products that fit in the remaining area",

    noSuggestionsAvailable: "No more products fit in the remaining area. You can decrease the remaining area or increase the total area.",

    decreaseRemainingArea: "Decrease remaining area",

    increaseTotalArea: "Increase total area",

    areaExceededAlert: "You have exceeded the total available area. Reduce the selection or adjust the area to be able to quote.",

    turnEverySquareMeter: "Turn every square meter into",

    somethingExtraordinary: "something extraordinary",

    startBuildingYourDreamSpaceStartingFrom: "Start building the space of your dreams from",

    withU2Group: "with U2 Group",

    usdPerM2: "USD per m²",

    "Design Your Project": "Design Your Project",

    totalServices: "Total services",

    totalArea: "Total area",

    gmailForInvoice: "Gmail to receive invoice:",

    sending: "Sending...",

    sendInvoice: "Send invoice",

    invoiceError: "Could not send invoice. Check email or try again.",

    invoiceSent: "Invoice sent successfully!",



    // ABOUT US PAGE

    heroTitle: "U2 Group: Architectural Design with Purpose",

    heroDescription1: "We are a passionate team of architects and designers committed to creating spaces that inspire and transform lives.",

    heroDescription2: "Our mission is to turn your dreams into exceptional architectural realities, combining innovation, sustainability, and user-centered design.",

    mission: "Our Mission",

    vision: "Our Vision",

    missionDescription: "Transform spaces into unique experiences that reflect our clients' vision and lifestyle through innovative and sustainable architectural design.",

    visionDescription: "To be globally recognized as leaders in innovative architectural design, creating spaces that inspire and improve people's lives.",

    

    whatWeDo: "What We Do",

    whatWeDoDescription: "We combine creativity, technology, and experience to deliver exceptional architectural solutions.",

    weSpecialize: "We Specialize",

    weSpecializeDescription: "In residential and commercial architectural design, with a focus on sustainability and innovation.",

    globalVision: "Global Vision",

    globalVisionDescription: "We apply the best international practices adapted to local needs.",

    noGuesswork: "No Guesswork",

    noGuessworkDescription: "Every project is based on research, detailed planning, and proven methodologies.",

    realTeam: "Real Team",

    realTeamDescription: "A dedicated team of professionals committed to excellence in every project.",

    

    // Values

    creativity: "Creativity",

    sustainability: "Sustainability",

    quality: "Quality",

    innovation: "Innovation",

    clientCentric: "Client Centric",

    integrity: "Integrity",

    collaboration: "Collaboration",

    attentionToDetail: "Attention to Detail",

    flexibility: "Flexibility",

    

    // Value Tooltips

    creativityTooltip: "We explore unique and original solutions for each project.",

    sustainabilityTooltip: "Committed to eco-friendly and sustainable design practices.",

    qualityTooltip: "Excellence in every detail and aspect of the project.",

    innovationTooltip: "We incorporate the latest technologies and design trends.",

    clientCentricTooltip: "Your vision and needs are our priority.",

    integrityTooltip: "Transparency and honesty in everything we do.",

    collaborationTooltip: "We work together to achieve exceptional results.",

    attentionToDetailTooltip: "Meticulous care in every aspect of design.",

    flexibilityTooltip: "We adapt to your needs and requirements.",

    

    // Process

    howWeDo: "How We Do It",

    weListen: "We Listen",

    weListenDescription: "We don't make decisions until your vision is clear.",

    weCreateConcept: "We Create the Concept",

    weCreateConceptDescription: "This is where the magic begins: we combine function, aesthetics, and emotion in a unique concept. Every detail emerges from your real needs. No templates, just purpose.",

    youVisualize3D: "You Visualize in 3D",

    youVisualize3DDescription: "With our hyperrealistic renders, you'll walk through and feel your space before a single brick is laid. This way you make decisions with clarity and confidence.",

    weBuildWithYou: "We Build With You",

    weBuildWithYouDescription: "From blueprints to finishes, you're part of every step. We guide you, keep you informed, and walk with you. Your space isn't built alone, it's built with you.",

    

    // FOUNDERS

    meetTheFounders: "Meet the Founders",

    founders: "founders",

    coFounderArchitect: "Co-Founder and Architect",

    coFounderIndustrialDesigner: "Co-Founder and Industrial Designer",

    

    // DESIGN CATEGORIES

    basicSpaces: "Basic spaces",

    homeFunction: "Home functionality",

    workAndCreativity: "Work & Creativity",

    wellnessAndHealth: "Wellness & Health",

    natureAndSustainability: "Nature & Sustainability",

    entertainmentAndSocial: "Entertainment & Social",

    

    // STATUS MESSAGES

    noBlogs: "No blogs available",

    designAreaTitle: "Design area:",

    

    // PRIVACY POLICY

    privacyTitle: "Privacy Policy",

    privacyLastUpdate: "Last updated: March 2023",

    privacyIntro: "At U2 Group, we take our users' privacy seriously. This policy describes how we collect, use, and protect your information.",

    

    // Scope

    privacyScope: "Policy Scope",

    "privacyScopeItems.website": "U2 Group website",

    "privacyScopeItems.plans": "Architectural plans and services",

    "privacyScopeItems.design": "Design services",

    "privacyScopeItems.data": "Client data management",

    

    // Compliance

    privacyCompliance: "Regulatory Compliance",

    "privacyComplianceItems.gdpr": "General Data Protection Regulation (GDPR)",

    "privacyComplianceItems.ccpa": "California Consumer Privacy Act (CCPA)",

    "privacyComplianceItems.uk": "UK Data Protection Act",

    "privacyComplianceItems.pipeda": "PIPEDA (Canada)",

    "privacyComplianceItems.colombia": "Colombian Personal Data Protection Law",

    

    // Collected Data

    privacyDataCollected: "Data We Collect",

    "privacyDataTable.category": "Category",

    "privacyDataTable.examples": "Examples",

    "privacyDataTable.howCollected": "How We Collect It",

    "privacyDataTable.howWeUse": "How We Use It",

    

    // Data Categories

    "privacyDataTable.identifiers": "Identifiers",

    "privacyDataTable.identifiersExamples": "Name, email, phone",

    "privacyDataTable.identifiersHow": "Registration and contact forms",

    

    "privacyDataTable.billing": "Billing",

    "privacyDataTable.billingExamples": "Payment information, billing address",

    "privacyDataTable.billingHow": "Payment and billing process",

    

    "privacyDataTable.projectData": "Project Data",

    "privacyDataTable.projectDataExamples": "Plans, designs, specifications",

    "privacyDataTable.projectDataHow": "File uploads and project forms",

    

    "privacyDataTable.siteUsage": "Site Usage",

    "privacyDataTable.siteUsageExamples": "Pages visited, session time",

    "privacyDataTable.siteUsageHow": "Cookies and usage analytics",

    

    "privacyDataTable.communications": "Communications",

    "privacyDataTable.communicationsExamples": "Message history, preferences",

    "privacyDataTable.communicationsHow": "Chat, emails, and contact forms",

    

    // PRIVACY POLICY - Navigation

    backToHome: "Back to Home",

    viewCookiePolicy: "View Cookie Policy",

    

    // COOKIES POLICY

    cookiesTitle: "Cookies Policy",

    cookiesLastUpdate: "Last updated: March 2023",

    cookiesWhatAre: "What are Cookies?",

    cookiesWhatAreDesc: "Cookies are small text files stored on your device when you visit our website. They help us improve your experience and understand how you use our services.",

    cookiesTypes: "Types of Cookies We Use",

    cookiesFunctional: "Functional Cookies",

    cookiesFunctionalDesc: "Required for basic site functionality. They enable navigation and essential features.",

    cookiesAnalytics: "Analytics Cookies",

    cookiesAnalyticsDesc: "Help us understand how you interact with our site, allowing us to improve its performance and functionality.",

    cookiesAds: "Advertising Cookies",

    cookiesAdsDesc: "Used to show you relevant content and measure the effectiveness of our advertising campaigns.",

    cookiesDataCollected: "Data Collected by Cookies",

    cookiesDataIP: "IP Address (anonymized)",

    cookiesDataPages: "Pages visited and browsing patterns",

    cookiesDataPrefs: "User preferences and settings",

    cookiesConsent: "Your Consent",

    cookiesConsentDesc: "By using our site, you accept the use of cookies as described in this policy. You can adjust your browser settings to reject cookies, although this may affect some site functionalities.",

    cookiesRevokeConsent: "Revoke Consent",

    cookiesMoreInfo: "More Information",

    cookiesMoreInfoDesc: "For more details, check our",

    cookiesPrivacyPolicy: "Privacy Policy",

    cookiesOrWriteUs: "or write to us at",

    cookieBannerText: "This site uses cookies to improve your experience.",

    cookieBannerReadMore: "Read more",

    cookieBannerAccept: "Accept",



    // MARKETPLACE

    productos: "Productos",

    carrito: "Carrito",

    ordenes: "Órdenes",

    favoritos: "Favoritos",

    ajustes: "Ajustes",

    conectado_como: "Conectado como",

    salir: "Salir",

    iniciar_sesion: "Iniciar sesión",

    cerrar_sesion: "Cerrar sesión",

    mi_cuenta: "Mi cuenta",

    mis_pedidos: "Mis pedidos",

    mis_favoritos: "Mis favoritos",

    agregar_al_carrito: "Agregar al carrito",

    quitar_del_carrito: "Quitar del carrito",

    ver_producto: "Ver producto",

    precio: "Precio",

    cantidad: "Cantidad",

    total: "Total",

    confirmar_compra: "Confirmar compra",

    procesar_pago: "Procesar pago",

    carrito_vacio: "Tu carrito está vacío",

    no_hay_productos: "No hay productos disponibles",

    buscar_productos: "Buscar productos",

    filtrar_por: "Filtrar por",

    ordenar_por: "Ordenar por",

    precio_mas_bajo: "Precio más bajo",

    precio_mas_alto: "Precio más alto",

    mas_reciente: "Más reciente",

    mas_antiguo: "Más antiguo",

    nombre_a_z: "Nombre A-Z",

    nombre_z_a: "Nombre Z-A",

    

    // AUTENTICACIÓN MARKETPLACE

    login_required: "Iniciar sesión requerido",

    login_to_view_plan: "Inicia sesión para acceder a todos los detalles y opciones de este plano arquitectónico",

    login_to_add_cart: "Inicia sesión para agregar productos a tu carrito de compras",

    login_to_add_favorites: "Inicia sesión para guardar productos en tus favoritos",

    login_success: "¡Sesión iniciada correctamente!",

    login_error: "Credenciales inválidas. Por favor, intenta de nuevo.",

    register_here: "Crear cuenta",

    no_account: "¿No tienes una cuenta?",

    forgot_password: "¿Olvidaste tu contraseña?",

    email_placeholder: "tu@email.com",

    password_placeholder: "Tu contraseña",

    login_button: "Iniciar Sesión",

    login_loading: "Iniciando sesión...",



    // FOOTER

    privacyPolicy: "Privacy Policy",

    architecturalDesign: "Architectural Design",

    consulting: "Consulting",

    company: "Company",

    adminPanel: "Admin Panel",

    allRightsReserved: "All rights reserved",

    followUs: "Follow us",

    developedBy: "Developed by Pedroza, Zare and Jara",

  }

} as const; 
