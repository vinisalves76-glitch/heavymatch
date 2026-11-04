// Estado compartilhado entre os módulos clássicos do HeavyMatch.
// Os scripts são carregados em ordem no index.html.
const WHATSAPP_NUMBER = "5511999999999";
let vehicles = [];
let filtered = [...vehicles], index = 0, favorites = [], current = null;
let activeCategory = "", startX = null, startY = null, suppressPhotoClick = false;
let activePhotoIndex = 0;
const $ = id => document.getElementById(id);
