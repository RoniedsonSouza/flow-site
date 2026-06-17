// Configuração compartilhada para Flow
// Este arquivo deve ser carregado primeiro

(function() {
  'use strict';
  
  // API Base URL - definido uma única vez
  window.FlowConfig = window.FlowConfig || {};
  window.FlowConfig.API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000/api' 
    : '/api';
})();

