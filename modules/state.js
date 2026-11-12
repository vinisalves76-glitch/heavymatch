// Estado compartilhado entre os módulos clássicos do HeavyMatch.
// Os scripts são carregados em ordem no index.html.
// Contato geral opcional. Os anúncios devem priorizar o WhatsApp do vendedor.
// Mantenha vazio até existir um número comercial real configurado.
const WHATSAPP_NUMBER = "";
let vehicles = [];
let filtered = [...vehicles], index = 0, favorites = [], current = null;
let activeCategory = "", startX = null, startY = null, suppressPhotoClick = false;
let activePhotoIndex = 0;
const $ = id => document.getElementById(id);
