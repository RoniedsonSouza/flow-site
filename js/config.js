// Configuração compartilhada para Projeto Flow
// Este arquivo deve ser carregado primeiro

(function() {
  'use strict';
  
  window.FlowConfig = window.FlowConfig || {};
  window.FlowConfig.API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : '/api';
  window.FlowConfig.WHATSAPP_E164 = '5527988911795';
  window.FlowConfig.INSTAGRAM_BRANCHES = [
    { city: 'Projeto Flow', handle: 'projetflow' }
  ];
})();
