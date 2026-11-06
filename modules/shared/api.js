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
