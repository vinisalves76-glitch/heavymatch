// Camada compartilhada para chamadas HTTP da aplicação.
// Mantém autenticação, serialização e tratamento de erros em um único contrato.
window.hmApiRequest = async function hmApiRequest(path, options = {}) {
  const {
    method = "GET",
    token,
    body,
    headers = {},
    errorMessage = "Não foi possível concluir a solicitação."
  } = options;

  const requestHeaders = { Accept: "application/json", ...headers };
  const requestOptions = { method, headers: requestHeaders };

  if (token) requestHeaders.Authorization = "Bearer " + token;
  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(path, requestOptions);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || errorMessage);
  return result;
};

// Uma única instância de autenticação evita concorrência no armazenamento da
// sessão quando autenticação e gestão de anúncios carregam ao mesmo tempo.
window.hmGetSupabaseClient = function hmGetSupabaseClient() {
  if (window.hmSupabaseClient) return Promise.resolve(window.hmSupabaseClient);
  if (window.hmSupabaseClientPromise) return window.hmSupabaseClientPromise;

  window.hmSupabaseClientPromise = (async () => {
    const config = await window.hmApiRequest("/api/config", {
      errorMessage: "Não foi possível carregar a configuração do Supabase."
    });
    if (!window.supabase?.createClient) {
      throw new Error("A biblioteca de conexão não carregou. Verifique sua conexão e tente novamente.");
    }
    window.hmSupabaseClient = window.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    return window.hmSupabaseClient;
  })().catch(error => {
    window.hmSupabaseClientPromise = null;
    throw error;
  });

  return window.hmSupabaseClientPromise;
};
