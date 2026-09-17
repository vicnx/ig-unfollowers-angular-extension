import { UserNode } from '../models/user.model';
import { WITHOUT_PROFILE_PICTURE_URL_IDS } from './instagram.constants';

/**
 * Generador de avatares SVG Data-URI con gradientes limpios y modernos.
 * 100% local, sin peticiones de red, sin 403 de Meta y seguro para CSP.
 */
export function createSvgAvatar(initials: string, color1: string, color2: string): string {
  const safeInitials = (initials || 'ES').slice(0, 2).toUpperCase();
  const idSuffix = `${safeInitials}_${color1.replace('#', '')}_${color2.replace('#', '')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="g_${idSuffix}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${color1}"/><stop offset="100%" stop-color="${color2}"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g_${idSuffix})"/><text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${safeInitials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const GRADIENT_PALETTES: [string, string][] = [
  ['#833ab4', '#fd1d1d'], // Púrpura a Rojo
  ['#fd1d1d', '#fcb045'], // Naranja a Ámbar
  ['#00c6ff', '#0072ff'], // Azul Eléctrico
  ['#11998e', '#38ef7d'], // Verde Esmeralda
  ['#fc466b', '#3f5efb'], // Violeta Neón
  ['#f12711', '#f5af19'], // Fuego Cálido
  ['#654ea3', '#eaafc8'], // Lavanda
  ['#00b09b', '#96c93d'], // Primavera
  ['#7f00ff', '#e100ff'], // Magenta
  ['#4facfe', '#00f2fe'], // Turquesa
  ['#fa709a', '#fee140'], // Melocotón
  ['#2e3192', '#1bffff'], // Océano
];

/**
 * Lista de 30 cuentas ficticias con nombres y apellidos 100% españoles,
 * realistas y creíbles para capturas de pantalla de la guía.
 */
export const DEFAULT_MOCK_USERS: UserNode[] = [
  {
    id: 'mock_es_101',
    username: 'pablo_garcia.94',
    full_name: 'Pablo García • Fotografía & Viajes',
    profile_pic_url: createSvgAvatar('PG', '#833ab4', '#fd1d1d'),
    is_verified: true,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_102',
    username: 'laura.sanchez_',
    full_name: 'Laura Sánchez • Arquitectura',
    profile_pic_url: createSvgAvatar('LS', '#11998e', '#38ef7d'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_103',
    username: 'carlos_mrtz',
    full_name: 'Carlos Martínez',
    profile_pic_url: createSvgAvatar('CM', '#00c6ff', '#0072ff'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: true, // Seguidor mutuo
  },
  {
    id: 'mock_es_104',
    username: 'marta.navarroo',
    full_name: 'Marta Navarro • Diseño & Moda',
    profile_pic_url: createSvgAvatar('MN', '#fc466b', '#3f5efb'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_105',
    username: 'alvaro_ruiz92',
    full_name: 'Álvaro Ruiz • Periodista Deportivo',
    profile_pic_url: createSvgAvatar('AR', '#f12711', '#f5af19'),
    is_verified: true,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_106',
    username: 'lucia.fernandez_',
    full_name: 'Lucía Fernández • Ilustración & Cerámica',
    profile_pic_url: createSvgAvatar('LF', '#654ea3', '#eaafc8'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: true, // Seguidor mutuo
  },
  {
    id: 'mock_es_107',
    username: 'javier_moreno_',
    full_name: 'Javier Moreno',
    profile_pic_url: createSvgAvatar('JM', '#00b09b', '#96c93d'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_108',
    username: 'sara_iglesias',
    full_name: 'Sara Iglesias • Libros & Café',
    profile_pic_url: createSvgAvatar('SI', '#4facfe', '#00f2fe'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_109',
    username: 'diego_alvarez.es',
    full_name: 'Diego Álvarez',
    profile_pic_url: createSvgAvatar('DA', '#7f00ff', '#e100ff'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_110',
    username: 'clara_dominguez_',
    full_name: 'Clara Domínguez • Interiorismo',
    profile_pic_url: createSvgAvatar('CD', '#fa709a', '#fee140'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: true, // Seguidor mutuo
  },
  {
    id: 'mock_es_111',
    username: 'alejandro_ortega',
    full_name: 'Alejandro Ortega',
    profile_pic_url: createSvgAvatar('AO', '#2e3192', '#1bffff'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_112',
    username: 'raquel_torres_',
    full_name: 'Raquel Torres • Yoga & Salud',
    profile_pic_url: createSvgAvatar('RT', '#11998e', '#38ef7d'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_113',
    username: 'sergio_castillo_',
    full_name: 'Sergio Castillo',
    profile_pic_url: createSvgAvatar('SC', '#fd1d1d', '#fcb045'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_114',
    username: 'elena_ramos.ph',
    full_name: 'Elena Ramos • Fotografía Retrato',
    profile_pic_url: createSvgAvatar('ER', '#00c6ff', '#0072ff'),
    is_verified: true,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_115',
    username: 'adrian_romero97',
    full_name: 'Adrián Romero',
    profile_pic_url: createSvgAvatar('AR', '#fc466b', '#3f5efb'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: true, // Seguidor mutuo
  },
  {
    id: 'mock_es_116',
    username: 'marina.serrano_',
    full_name: 'Marina Serrano',
    profile_pic_url: createSvgAvatar('MS', '#654ea3', '#eaafc8'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_117',
    username: 'victor_garrido_',
    full_name: 'Víctor Garrido • Sonido & Música',
    profile_pic_url: createSvgAvatar('VG', '#00b09b', '#96c93d'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_118',
    username: 'carmen_molina.art',
    full_name: 'Carmen Molina • Arte Textil',
    profile_pic_url: createSvgAvatar('CM', '#fa709a', '#fee140'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_119',
    username: 'marcos_vargas_',
    full_name: 'Marcos Vargas',
    profile_pic_url: createSvgAvatar('MV', '#f12711', '#f5af19'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_120',
    username: 'irene_castro_',
    full_name: 'Irene Castro • Senderismo & Montaña',
    profile_pic_url: createSvgAvatar('IC', '#11998e', '#38ef7d'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_121',
    username: 'roberto_gil_',
    full_name: 'Roberto Gil',
    profile_pic_url: createSvgAvatar('RG', '#7f00ff', '#e100ff'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_122',
    username: 'alba_medina.es',
    full_name: 'Alba Medina • Nutrición',
    profile_pic_url: createSvgAvatar('AM', '#2e3192', '#1bffff'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: true, // Seguidor mutuo
  },
  {
    id: 'mock_es_123',
    username: 'guillermo_sanz',
    full_name: 'Guillermo Sanz',
    profile_pic_url: createSvgAvatar('GS', '#4facfe', '#00f2fe'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_124',
    username: 'patricia_blanco_',
    full_name: 'Patricia Blanco',
    profile_pic_url: `https://instagram.com/p/${WITHOUT_PROFILE_PICTURE_URL_IDS[0]}`,
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_125',
    username: 'ruben_herrera.fit',
    full_name: 'Rubén Herrera • Entrenador Personal',
    profile_pic_url: createSvgAvatar('RH', '#833ab4', '#fd1d1d'),
    is_verified: true,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_126',
    username: 'silvia_pascual_',
    full_name: 'Silvia Pascual',
    profile_pic_url: createSvgAvatar('SP', '#fd1d1d', '#fcb045'),
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_127',
    username: 'hugo_navas_',
    full_name: 'Hugo Navas • Ciclismo & Rutas',
    profile_pic_url: createSvgAvatar('HN', '#00c6ff', '#0072ff'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_128',
    username: 'natalia_cruz_',
    full_name: 'Natalia Cruz',
    profile_pic_url: createSvgAvatar('NC', '#fc466b', '#3f5efb'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: true, // Seguidor mutuo
  },
  {
    id: 'mock_es_129',
    username: 'cuenta_personal_es',
    full_name: 'Usuario Reservado',
    profile_pic_url: `https://instagram.com/p/${WITHOUT_PROFILE_PICTURE_URL_IDS[1]}`,
    is_verified: false,
    is_private: true,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
  {
    id: 'mock_es_130',
    username: 'david_romero.bcn',
    full_name: 'David Romero • Gastronomía & Tapas',
    profile_pic_url: createSvgAvatar('DR', '#654ea3', '#eaafc8'),
    is_verified: false,
    is_private: false,
    followed_by_viewer: true,
    requested_by_viewer: false,
    follows_viewer: false,
  },
];

/**
 * Genera una lista con usuarios de nombres y apellidos españoles totalmente aleatorizados.
 */
export function generateRandomizedMockUsers(count = 30): UserNode[] {
  const nombres = [
    'Pablo', 'Laura', 'Carlos', 'Marta', 'Álvaro', 'Lucía', 'Javier', 'Sara',
    'Diego', 'Clara', 'Alejandro', 'Raquel', 'Sergio', 'Elena', 'Adrián', 'Marina',
    'Víctor', 'Carmen', 'Marcos', 'Irene', 'Roberto', 'Alba', 'Guillermo', 'Patricia',
    'Rubén', 'Silvia', 'Hugo', 'Natalia', 'David', 'Paula'
  ];

  const apellidos = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez',
    'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno',
    'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez',
    'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Molina', 'Morales'
  ];

  const aficiones = [
    'Fotografía', 'Viajes', 'Diseño', 'Arquitectura', 'Arte', 'Música', 'Senderismo',
    'Café', 'Libros', 'Nutrición', 'Yoga', 'Ciclismo', 'Gastronomía', 'Ilustración'
  ];

  const results: UserNode[] = [];

  for (let i = 0; i < count; i++) {
    const fn = nombres[Math.floor(Math.random() * nombres.length)];
    const ln = apellidos[Math.floor(Math.random() * apellidos.length)];
    const aficion = aficiones[Math.floor(Math.random() * aficiones.length)];

    // Generar combinaciones realistas de username español
    const cleanFn = fn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanLn = ln.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const handleStyles = [
      `${cleanFn}_${cleanLn}`,
      `${cleanFn}.${cleanLn}_`,
      `${cleanFn}_${cleanLn}${Math.floor(Math.random() * 89 + 10)}`,
      `${cleanFn}.${cleanLn.slice(0, 4)}`,
      `${cleanFn}_${cleanLn}.es`,
    ];
    const username = handleStyles[i % handleStyles.length];
    const fullName = Math.random() < 0.4 ? `${fn} ${ln} • ${aficion}` : `${fn} ${ln}`;
    const initials = `${fn[0]}${ln[0]}`;
    const pal = GRADIENT_PALETTES[i % GRADIENT_PALETTES.length];

    const isVerified = Math.random() < 0.15; // 15% verificados
    const isPrivate = Math.random() < 0.25;  // 25% privados
    const followsViewer = Math.random() < 0.2; // 20% seguidores mutuos

    results.push({
      id: `random_mock_es_${Date.now()}_${i + 1}`,
      username,
      full_name: fullName,
      profile_pic_url: createSvgAvatar(initials, pal[0], pal[1]),
      is_verified: isVerified,
      is_private: isPrivate,
      followed_by_viewer: true,
      requested_by_viewer: false,
      follows_viewer: followsViewer,
    });
  }

  return results;
}
