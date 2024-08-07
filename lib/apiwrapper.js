const ApiWrapper = (() => {
  const fetchApi = async ({
    baseURL,
    endpoint,
    headers,
    options = {},
    retryOnAuthError = true,
  }) => {
    const url = `${baseURL}${endpoint}`;
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      if (
        response.status === 401 &&
        retryOnAuthError &&
        headers['Authorization']
      ) {
        //Bad credentials, retry without token
        const newHeaders = { ...headers };
        delete newHeaders.Authorization;
        return fetchApi({
          baseURL,
          endpoint,
          options,
          headers: newHeaders,
          retryOnAuthError: false,
        });
      }
      throw new Error(
        `API Error: ${response.statusText} (status: ${response.status})`
      );
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  };

  return {
    fetchApi,
  };
})();

export default ApiWrapper;
